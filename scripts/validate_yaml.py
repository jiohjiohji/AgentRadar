#!/usr/bin/env python3
"""
Validates tool profile YAML files against the AgentRadar schema.
Called by tdd-guard on every YAML commit.
Called by GitHub Actions on every PR.
"""
import sys
import yaml
import json
from pathlib import Path

REQUIRED_FIELDS = ['id', 'name', 'source_url', 'category', 'pricing',
                   'license', 'status', 'scores', 'score_confidence',
                   'score_history', 'tags', 'versus_refs']

VALID_CATEGORIES = ['mcp-server', 'claude-plugin', 'claudemd-framework',
                    'orchestration', 'prompt-library', 'sdk-pattern',
                    'ide-integration', 'eval-observability', 'complementary']

VALID_PRICING = ['free', 'freemium', 'paid']
VALID_STATUS = ['active', 'stale', 'archived']
VALID_CONFIDENCE = ['low', 'medium', 'high', None]
SCORE_KEYS = ['p', 'q', 'c', 'r', 'x', 'f']


def validate_file(filepath: Path) -> list[str]:
    errors = []

    try:
        with open(filepath) as f:
            data = yaml.safe_load(f)
    except yaml.YAMLError as e:
        return [f"YAML parse error: {e}"]

    if not isinstance(data, dict):
        return ["Root element must be a YAML object/dict"]

    # Check field count
    actual_count = len(data.keys())
    if actual_count != 12:
        errors.append(f"Must have exactly 12 fields, found {actual_count}: {list(data.keys())}")

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    # Check enums
    if data.get('category') not in VALID_CATEGORIES:
        errors.append(f"Invalid category: {data.get('category')}. Must be one of: {VALID_CATEGORIES}")

    if data.get('pricing') not in VALID_PRICING:
        errors.append(f"Invalid pricing: {data.get('pricing')}")

    if data.get('status') not in VALID_STATUS:
        errors.append(f"Invalid status: {data.get('status')}")

    if data.get('score_confidence') not in VALID_CONFIDENCE:
        errors.append(f"Invalid score_confidence: {data.get('score_confidence')}")

    # Check scores structure (if not null)
    scores = data.get('scores')
    if scores is not None:
        if not isinstance(scores, dict):
            errors.append("scores must be an object or null")
        else:
            for key in SCORE_KEYS:
                if key not in scores:
                    errors.append(f"scores missing key: {key}")
                elif scores[key] is not None:
                    if not isinstance(scores[key], (int, float)):
                        errors.append(f"scores.{key} must be a number or null")
                    elif not (0 <= scores[key] <= 10):
                        errors.append(f"scores.{key} must be between 0 and 10")

    # Check versus_refs have valid_until
    versus_refs = data.get('versus_refs', [])
    if versus_refs:
        for ref in versus_refs:
            if not ref.get('valid_until'):
                errors.append(f"versus_ref for {ref.get('id')} missing valid_until field")

    return errors


def main():
    paths = sys.argv[1:]
    if not paths:
        # Validate all files if no specific file given
        paths = list(Path('data/tools').glob('*.yaml'))

    all_passed = True
    for path in paths:
        p = Path(path)
        if not p.exists():
            print(f"ERROR: {path} does not exist")
            all_passed = False
            continue

        errors = validate_file(p)
        if errors:
            print(f"\nFAIL: {path}")
            for error in errors:
                print(f"  - {error}")
            all_passed = False
        else:
            print(f"PASS: {path}")

    sys.exit(0 if all_passed else 1)


if __name__ == '__main__':
    main()
