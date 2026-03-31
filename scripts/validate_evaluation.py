#!/usr/bin/env python3
"""Validates community evaluation YAML files."""
import sys
import yaml
from pathlib import Path

REQUIRED_FIELDS = ['tool_id', 'reporter_role', 'date_evaluated',
                   'claude_code_version', 'platform', 'task_performed',
                   'scores', 'verdict', 'conflict_of_interest']

VALID_COI = ['none', 'contributor']
REQUIRED_SCORE_KEYS = ['p', 'q', 'c', 'r', 'x', 'f']

def validate_file(filepath: Path) -> list[str]:
    errors = []
    with open(filepath) as f:
        data = yaml.safe_load(f)

    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    if data.get('conflict_of_interest') not in VALID_COI:
        errors.append(f"conflict_of_interest must be 'none' or 'contributor'")

    scores = data.get('scores', {})
    for key in REQUIRED_SCORE_KEYS:
        if key not in scores:
            errors.append(f"scores missing key: {key}")
        elif not isinstance(scores.get(key), dict) or 'value' not in scores[key] or 'evidence' not in scores[key]:
            errors.append(f"scores.{key} must have 'value' and 'evidence' fields")

    return errors

def main():
    paths = sys.argv[1:] or list(Path('data/evaluations').glob('*.yaml'))
    all_passed = True
    for path in paths:
        errors = validate_file(Path(path))
        if errors:
            print(f"FAIL: {path}")
            for e in errors: print(f"  - {e}")
            all_passed = False
        else:
            print(f"PASS: {path}")
    sys.exit(0 if all_passed else 1)

if __name__ == '__main__':
    main()
