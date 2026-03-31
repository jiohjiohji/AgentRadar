# /health command
# Usage: /health
# Runs a full system health check before starting work

1. Run: agnix --fix (fix config issues)
2. Run: python -m pytest tests/ --tb=short -q (check tests pass)
3. Run: python scripts/validate_yaml.py data/tools/ (check all profiles)
4. Check context-mode is running (look for MCP server in settings)
5. Check tdd-guard is configured (.tdd-guard.yml exists)
6. Report: summary of all checks with PASS/WARN/FAIL status
