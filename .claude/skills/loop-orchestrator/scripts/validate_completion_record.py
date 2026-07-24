#!/usr/bin/env python3
"""Validate the structure and populated fields of a loop completion record."""

from __future__ import annotations

import re
import sys
from pathlib import Path


SECTION_ORDER = [
    "Task Contract",
    "Orientation Evidence",
    "Version 1",
    "Critique 1",
    "Version 2",
    "Critique 2",
    "Version 3",
    "Final Verification",
]

COMMON_FIELDS = {
    "Task Contract": [
        "Requested outcome",
        "Builder identity",
        "Acceptance criteria",
        "Non-goals and authority boundary",
        "Bounded stretch",
        "Mode",
        "Mode rationale",
        "Coordination budget",
    ],
    "Orientation Evidence": [
        "Repository and branch",
        "HEAD",
        "Dirty-tree boundary",
        "Canonical sources read",
    ],
    "Version 1": ["Material delta", "Verification evidence", "Reusable lesson"],
    "Final Verification": [
        "Final verifier identity",
        "Checks run and exact outcomes",
        "Completion claims directly proved",
        "Claims still unverified",
        "Remaining risk",
        "Next smallest safe action",
    ],
}

CRITIQUE_FIELDS = [
    "Reviewer identity",
    "Accepted findings",
    "Rejected findings and reasons",
    "Unresolved findings",
]

VERSION_FIELDS = ["Material delta or `no patch required`", "Verification evidence", "Reusable lesson"]

PLACEHOLDER_PATTERNS = (
    "quick | standard | assured",
    "none | destination",
    "[populate",
    "[independent",
    "[patch",
    "[final",
    "[token_",
    "[target_",
)


def fail(messages: list[str]) -> None:
    for message in messages:
        print(f"INVALID: {message}", file=sys.stderr)
    print("COMPLETION_RECORD_INVALID", file=sys.stderr)
    raise SystemExit(1)


def parse_sections(text: str) -> tuple[list[str], dict[str, dict[str, str]]]:
    order: list[str] = []
    sections: dict[str, dict[str, str]] = {}
    current: str | None = None

    for line in text.splitlines():
        if line.startswith("## "):
            current = line[3:].strip()
            if current in sections:
                fail([f"duplicate section: {current}"])
            order.append(current)
            sections[current] = {}
            continue

        if current is None:
            continue

        match = re.match(r"^- ([^:]+):\s*(.*)$", line)
        if match:
            key, value = match.groups()
            sections[current][key.strip()] = value.strip()

    return order, sections


def is_placeholder(value: str) -> bool:
    lowered = value.lower()
    return not value or any(pattern in lowered for pattern in PLACEHOLDER_PATTERNS)


def main() -> None:
    if len(sys.argv) != 3 or sys.argv[1] not in {"quick", "standard", "assured"}:
        print(f"Usage: {Path(sys.argv[0]).name} <quick|standard|assured> <record.md>", file=sys.stderr)
        raise SystemExit(2)

    mode = sys.argv[1]
    record = Path(sys.argv[2])
    if not record.is_file():
        fail([f"file not found: {record}"])

    order, sections = parse_sections(record.read_text(encoding="utf-8"))
    required_sections = ["Task Contract", "Orientation Evidence", "Version 1"]
    if mode in {"standard", "assured"}:
        required_sections += ["Critique 1", "Version 2"]
    if mode == "assured":
        required_sections += ["Critique 2", "Version 3"]
    required_sections += ["Final Verification"]

    errors: list[str] = []
    for section in required_sections:
        if section not in sections:
            errors.append(f"missing section: {section}")

    present_required = [name for name in order if name in required_sections]
    if present_required != required_sections:
        errors.append("required sections are out of order")

    field_map = dict(COMMON_FIELDS)
    if mode in {"standard", "assured"}:
        field_map["Critique 1"] = CRITIQUE_FIELDS
        field_map["Version 2"] = VERSION_FIELDS
    if mode == "assured":
        field_map["Critique 2"] = CRITIQUE_FIELDS
        field_map["Version 3"] = VERSION_FIELDS

    for section, fields in field_map.items():
        if section not in required_sections or section not in sections:
            continue
        for field in fields:
            value = sections[section].get(field, "")
            if is_placeholder(value):
                errors.append(f"{section}: missing or placeholder value for '{field}'")

    declared_mode = sections.get("Task Contract", {}).get("Mode", "").strip("` ")
    if declared_mode != mode:
        errors.append(f"declared mode '{declared_mode or 'missing'}' does not match requested mode '{mode}'")

    builder = sections.get("Task Contract", {}).get("Builder identity", "").strip().casefold()
    reviewers: list[str] = []
    for critique in ("Critique 1", "Critique 2"):
        if critique in required_sections and critique in sections:
            reviewer = sections[critique].get("Reviewer identity", "").strip()
            if reviewer.lower() in {"self-review", "self", "builder"}:
                errors.append(f"{critique}: reviewer must be independent of the builder")
            if reviewer:
                normalized_reviewer = reviewer.casefold()
                reviewers.append(normalized_reviewer)
                if mode in {"standard", "assured"} and normalized_reviewer == builder:
                    errors.append(f"{critique}: reviewer identity matches builder identity")

    if mode == "assured" and len(reviewers) == 2 and reviewers[0] == reviewers[1]:
        errors.append("assured mode requires two different independent reviewers")

    verifier = sections.get("Final Verification", {}).get("Final verifier identity", "").strip().casefold()
    if mode in {"standard", "assured"} and verifier in {"self-review", "self", "builder"}:
        errors.append("final verifier must be independent of the builder")
    if mode in {"standard", "assured"} and verifier == builder:
        errors.append("final verifier identity matches builder identity")

    if errors:
        fail(errors)

    print(f"COMPLETION_RECORD_OK mode={mode}")


if __name__ == "__main__":
    main()
