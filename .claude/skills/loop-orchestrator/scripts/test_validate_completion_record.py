#!/usr/bin/env python3
"""Regression tests for the loop completion-record validator."""

from __future__ import annotations

import subprocess
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("validate_completion_record.py")


def record(mode: str, reviewer_1: str = "Reviewer A", reviewer_2: str = "Reviewer B") -> str:
    sections = [
        """## Task Contract
- Requested outcome: Deliver the requested bounded change
- Builder identity: Builder A
- Acceptance criteria: Requested behavior exists and checks pass
- Non-goals and authority boundary: No commit or deployment
- Bounded stretch: declined because it would widen scope
- Mode: `{mode}`
- Mode rationale: Selected from documented risk criteria
- Coordination budget: One reviewer per required critique

## Orientation Evidence
- Repository and branch: example repository on test branch
- HEAD: abc1234
- Dirty-tree boundary: only declared test paths
- Canonical sources read: AGENTS.md and docs index

## Version 1
- Material delta: implemented requested behavior
- Verification evidence: targeted test passed
- Reusable lesson: none
""".format(mode=mode)
    ]

    if mode in {"standard", "assured"}:
        sections.append(
            f"""## Critique 1
- Reviewer identity: {reviewer_1}
- Accepted findings: one missing edge case
- Rejected findings and reasons: none
- Unresolved findings: none

## Version 2
- Material delta or `no patch required`: patched edge case
- Verification evidence: regression test passed
- Reusable lesson: none
"""
        )

    if mode == "assured":
        sections.append(
            f"""## Critique 2
- Reviewer identity: {reviewer_2}
- Accepted findings: none
- Rejected findings and reasons: none
- Unresolved findings: none

## Version 3
- Material delta or `no patch required`: no patch required
- Verification evidence: final checks passed
- Reusable lesson: none
"""
        )

    sections.append(
        """## Final Verification
- Final verifier identity: Independent verifier
- Checks run and exact outcomes: targeted test passed
- Completion claims directly proved: bounded behavior and clean validation
- Claims still unverified: none
- Remaining risk: none identified
- Next smallest safe action: human review
"""
    )
    return "\n".join(sections)


def validate(mode: str, content: str) -> subprocess.CompletedProcess[str]:
    with tempfile.NamedTemporaryFile(mode="w", suffix=".md", encoding="utf-8") as handle:
        handle.write(content)
        handle.flush()
        return subprocess.run(
            ["python3", str(SCRIPT), mode, handle.name],
            check=False,
            capture_output=True,
            text=True,
        )


class CompletionRecordValidatorTests(unittest.TestCase):
    def test_accepts_each_complete_mode(self) -> None:
        for mode in ("quick", "standard", "assured"):
            with self.subTest(mode=mode):
                self.assertEqual(validate(mode, record(mode)).returncode, 0)

    def test_rejects_blank_template(self) -> None:
        template = Path(__file__).parents[1] / "references" / "completion-record.md"
        result = subprocess.run(
            ["python3", str(SCRIPT), "assured", str(template)],
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)

    def test_rejects_declared_mode_mismatch(self) -> None:
        self.assertNotEqual(validate("assured", record("quick")).returncode, 0)

    def test_rejects_self_review(self) -> None:
        self.assertNotEqual(validate("standard", record("standard", reviewer_1="self-review")).returncode, 0)

    def test_rejects_same_assured_reviewer_twice(self) -> None:
        self.assertNotEqual(validate("assured", record("assured", "Reviewer A", "Reviewer A")).returncode, 0)

    def test_rejects_reviewer_matching_builder_identity(self) -> None:
        self.assertNotEqual(validate("standard", record("standard", reviewer_1="Builder A")).returncode, 0)

    def test_rejects_verifier_matching_builder_identity(self) -> None:
        content = record("standard").replace(
            "- Final verifier identity: Independent verifier",
            "- Final verifier identity: Builder A",
        )
        self.assertNotEqual(validate("standard", content).returncode, 0)

    def test_rejects_missing_populated_field(self) -> None:
        content = record("quick").replace("- HEAD: abc1234", "- HEAD:")
        self.assertNotEqual(validate("quick", content).returncode, 0)

    def test_rejects_out_of_order_sections(self) -> None:
        content = record("standard")
        first = content.index("## Critique 1")
        second = content.index("## Version 2")
        final = content.index("## Final Verification")
        reordered = content[:first] + content[second:final] + content[first:second] + content[final:]
        self.assertNotEqual(validate("standard", reordered).returncode, 0)


if __name__ == "__main__":
    unittest.main()
