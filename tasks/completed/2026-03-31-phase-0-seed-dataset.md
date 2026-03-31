# TASK: phase-0-seed-dataset
# Date: 2026-03-31 | Phase: 0
# Status: DONE

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Phase 0 plan (the data is the product)
What breaks without it: Nothing exists to evaluate, compare, or discover. Zero value.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Remove nothing — this is the first task. Start clean.
Minimum viable version: 10 tool profiles (not 50). Start with 10 and validate quality before scaling.

### Rule 3 — Simplest implementation?
First instinct: write all 50 profiles in one session
Simpler approach: write 10 profiles, validate all 10, then write 10 more in batches
Chosen approach: batches of 10. Quality over speed.

### Rule 4 — What slowed last time?
No history yet. First task.
Prevention: N/A

### Rule 5 — What to automate?
After writing 10 profiles manually, identify any fields that can be auto-populated from GitHub API.
This will become the auto-triage script (Phase 1).

---

## TASK BREAKDOWN

### Gemini Agent Jobs (run in parallel)
- [x] Agent 1: Generate profiles for GitHub MCP, Filesystem MCP | Acceptance: validate_yaml.py PASS
- [x] Agent 2: Generate profiles for Playwright MCP, Tavily MCP | Acceptance: validate_yaml.py PASS
- [x] Agent 3: Generate profiles for Slack MCP, Atlassian MCP | Acceptance: validate_yaml.py PASS
- [x] Agent 4: Generate profiles for Browser MCP, Memory MCP | Acceptance: validate_yaml.py PASS
- [x] Agent 5: Generate profiles for Notion MCP, Linear MCP | Acceptance: validate_yaml.py PASS

### tdd-guard Gate
- Validation: python scripts/validate_yaml.py data/tools/
- All 10 profiles pass with zero errors

### Claude Code Review
Review files: data/tools/ (all 10 profiles)
Quality gate: All 12 fields present; scores are null (not invented); status computed from real last-commit dates
Update AGENTS.md: YES — add any patterns found in the first batch

---

## DONE WHEN
- [x] 10 tool profiles in data/tools/
- [x] All 10 pass validate_yaml.py with zero errors
- [x] Claude review: PASS
- [x] /iterate command run and AGENTS.md updated
- [x] TASK.md archived
- [x] Committed

## NEXT TASK
phase-0-seed-dataset-batch-2 (tools 11-20)
