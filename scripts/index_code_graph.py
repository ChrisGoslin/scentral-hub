#!/usr/bin/env python3
"""
index_code_graph.py — Local-first AST and dependency graph generator for repos.
Inspired by code-review-graph architecture.

Scans project files (JS/TS, Python), builds a symbol & import dependency map,
enabling AI agents and PR review workflows to query exact dependency paths without
blowing context windows.

Usage:
    python scripts/index_code_graph.py --repo /path/to/repo --out graph.json
"""

import argparse
import json
import os
import re
from pathlib import Path

def scan_file_imports(file_path: Path):
    imports = []
    exports = []
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        
        # Match JS/TS imports
        if file_path.suffix in ('.ts', '.tsx', '.js', '.jsx', '.mjs'):
            for line in content.splitlines():
                imp_match = re.search(r'from\s+[\'"]([^\'"]+)[\'"]', line)
                if imp_match:
                    imports.append(imp_match.group(1))
                exp_match = re.search(r'export\s+(?:const|function|class|default|type|interface)\s+([a-zA-Z0-9_$]+)', line)
                if exp_match:
                    exports.append(exp_match.group(1))
                    
        # Match Python imports
        elif file_path.suffix == '.py':
            for line in content.splitlines():
                imp_match = re.search(r'^(?:from\s+([a-zA-Z0-9_.]+)\s+import|import\s+([a-zA-Z0-9_.]+))', line)
                if imp_match:
                    imports.append(imp_match.group(1) or imp_match.group(2))
                def_match = re.search(r'^(?:def|class)\s+([a-zA-Z0-9_]+)', line)
                if def_match:
                    exports.append(def_match.group(1))
    except Exception:
        pass
        
    return imports, exports

def build_graph(repo_path: Path):
    graph = {
        "repo": str(repo_path),
        "files": {},
        "summary": {"total_files": 0, "total_symbols": 0}
    }
    
    ignore_dirs = {'.git', 'node_modules', '.next', '.venv', '__pycache__', 'coverage', 'dist', 'build', '.worktrees'}
    
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for f in files:
            ext = os.path.splitext(f)[1]
            if ext in ('.ts', '.tsx', '.js', '.jsx', '.mjs', '.py'):
                full_path = Path(root) / f
                rel_path = str(full_path.relative_to(repo_path))
                imports, exports = scan_file_imports(full_path)
                graph["files"][rel_path] = {
                    "imports": imports,
                    "symbols": exports
                }
                graph["summary"]["total_files"] += 1
                graph["summary"]["total_symbols"] += len(exports)
                
    return graph

def main():
    parser = argparse.ArgumentParser(description="Generate Code Intelligence Graph.")
    parser.add_argument("--repo", required=True, type=Path, help="Path to repository root")
    parser.add_argument("--out", type=Path, default=Path("code_graph.json"), help="Output JSON graph path")
    args = parser.parse_args()

    print(f"🕸️  Building code intelligence graph for: {args.repo}...")
    graph = build_graph(args.repo)
    args.out.write_text(json.dumps(graph, indent=2), encoding='utf-8')
    print(f"✅ Generated {args.out} ({graph['summary']['total_files']} files, {graph['summary']['total_symbols']} symbols indexed).")

if __name__ == "__main__":
    main()
