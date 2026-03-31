# /new-versus command
# Usage: /new-versus [tool-id-1] [tool-id-2]
# Creates a validated versus page for two tools

1. Verify both tools have >=2 independent evaluations each
2. If not: report what is missing and stop
3. Load the versus-page skill
4. Read anti-bias-charter.md before writing
5. Generate the versus page
6. Run validation: python scripts/validate_versus.py
7. Report: PASS with file path, or FAIL with specific errors
