# TASK: p0-006-prompt-library-sdk-profiles
# Date: 2026-03-31 | Phase: 0
# Status: DONE

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-006 — 40 tools needed before scoring threshold.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Nothing — additive batch.

### Rule 3 — Simplest implementation?
Same workflow: gh api → write YAML → validate.

### Rule 4 — What slowed last time?
CLAUDE.md frameworks were thin category (small repos). Accepted small-but-legitimate repos.
Prevention: Same acceptance here if prompt library category is sparse.

### Rule 5 — What to automate?
40 profiles now in place. The status+license lookup is fully proven.
P1: build scripts/find_repo.py to automate sprint-plan-name → canonical-repo.

---

## PIVOTS
None. All 10 mapped cleanly to well-known repos.

## NOTES
- All 10 are active — highest quality batch so far.
- LiteLLM (41.6k stars) is the largest non-Anthropic repo in the dataset.
- Vercel AI SDK (23.1k stars) NOASSERTION license stored as null — confirmed pattern.
- gh-berriAI-litellm.yaml has mixed-case filename; id is correctly lowercase. Cosmetic only.

---

## DONE WHEN
- [x] 10 tool profiles in data/tools/
- [x] All 10 pass validate_yaml.py with zero errors
- [x] Claude review: PASS
- [x] /iterate run, sprint_plan.md + velocity log updated
- [x] TASK.md archived
- [x] Committed

## NEXT TASK
p0-007-eval-observability-profiles (tools 41-50)
