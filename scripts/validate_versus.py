#!/usr/bin/env python3
"""Validates versus page markdown files for required sections and valid_until."""
import sys
import re
from pathlib import Path

REQUIRED_SECTIONS = [
    'Quick Answer',
    'Score Comparison',
    'Community Verdicts',
    'Use Cases',
    'Methodology'
]

def validate_file(filepath: Path) -> list[str]:
    errors = []
    content = filepath.read_text()

    for section in REQUIRED_SECTIONS:
        if f'## {section}' not in content and f'# {section}' not in content:
            errors.append(f"Missing required section: {section}")

    if 'valid_until:' not in content:
        errors.append("Missing valid_until frontmatter field")

    valid_until_match = re.search(r'valid_until:\s*(\d{4}-\d{2}-\d{2})', content)
    if not valid_until_match:
        errors.append("valid_until must be in YYYY-MM-DD format")

    return errors

def main():
    paths = sys.argv[1:] or list(Path('data/versus').glob('*.md'))
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
