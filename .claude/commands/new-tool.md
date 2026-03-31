# /new-tool command
# Usage: /new-tool [source-url]
# Creates a new validated tool profile in data/tools/

1. Load the yaml-profile skill
2. Research the tool at the provided source URL
3. Generate the YAML profile using the skill
4. Run validation: python scripts/validate_yaml.py
5. Report: PASS with file path, or FAIL with specific errors
