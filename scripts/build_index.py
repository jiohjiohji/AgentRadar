#!/usr/bin/env python3
"""
build_index.py — Generate data/tools-index.json from all tool YAMLs.

Run after any tool profile changes:
  python scripts/build_index.py

The index is fetched by the /radar plugin in a single HTTP request.
It contains only the fields needed for scan/suggest/check ranking.
"""
import json
import sys
from datetime import date
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).parent.parent
TOOLS_DIR = REPO_ROOT / "data" / "tools"
OUTPUT = REPO_ROOT / "data" / "tools-index.json"
BASE_URL = "https://raw.githubusercontent.com/jiohjiohji/AgentRadar/main/data/tools/"


def load_tool(path: Path) -> dict:
    with path.open() as f:
        profile = yaml.safe_load(f)

    scores = profile.get("scores") or {}
    versus = profile.get("versus_refs") or []

    return {
        "id": profile["id"],
        "name": profile["name"],
        "category": profile["category"],
        "status": profile["status"],
        "tags": profile.get("tags") or [],
        "pricing": profile["pricing"],
        "composite": scores.get("composite"),
        "eval_count": scores.get("eval_count", 0),
        "confidence": profile.get("score_confidence"),
        "versus_refs": [v["id"] for v in versus],
    }


def main() -> None:
    tool_files = sorted(TOOLS_DIR.glob("*.yaml"))
    if not tool_files:
        print("ERROR: No tool YAMLs found in data/tools/", file=sys.stderr)
        sys.exit(1)

    tools = []
    errors = []
    for path in tool_files:
        try:
            tools.append(load_tool(path))
        except Exception as exc:
            errors.append(f"{path.name}: {exc}")

    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    index = {
        "schema_version": "1.0",
        "generated": str(date.today()),
        "count": len(tools),
        "base_url": BASE_URL,
        "tools": tools,
    }

    OUTPUT.write_text(json.dumps(index, indent=2) + "\n")
    print(f"OK: wrote {len(tools)} tools → {OUTPUT.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
