# TASK: p0-005-orchestration-claudemd-profiles
# Date: 2026-03-31 | Phase: 0
# Status: DONE

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-005 — 30 tools needed before score computation.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Nothing — additive batch.

### Rule 3 — Simplest implementation?
Same workflow as P0-003 and P0-004.

### Rule 4 — What slowed last time?
Sprint plan names approximate. Prevention: gh api search first.

### Rule 5 — What to automate?
Status field is now a known-repeatable lookup; tag for P1 auto-triage script.

---

## PIVOTS

| Sprint plan entry | Actual repo used | Reason |
|---|---|---|
| SPARC framework (ruvnet) | ruvnet/ruflo | Main ruvnet Claude repo is ruflo (prev. claude-flow); no standalone SPARC repo found |
| cursor-tools equivalent | (no exact match found) | category covered by josix/awesome-claude-md and harness-engineering |

## DECISIONS MADE THIS BATCH
- General orchestration frameworks (CrewAI, AutoGen, LangGraph) → `orchestration` category even when they have Claude integrations
- `claude-plugin` reserved for Claude Code–native tooling only

---

## DONE WHEN
- [x] 10 tool profiles in data/tools/
- [x] All 10 pass validate_yaml.py with zero errors
- [x] Claude review: PASS
- [x] /iterate run, AGENTS.md updated
- [x] TASK.md archived
- [x] Committed

## NEXT TASK
p0-006-prompt-library-sdk-profiles (tools 31-40)
