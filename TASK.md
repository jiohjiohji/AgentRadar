# TASK: p0-006-prompt-library-sdk-profiles
# Date: 2026-03-31 | Phase: 0
# Status: BACKLOG

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-006 — 40 tools needed to reach scoring threshold.
What breaks without it: Prompt library and SDK pattern categories have zero coverage.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Nothing — additive batch.

### Rule 3 — Simplest implementation?
Same workflow: gh api search → write YAML → validate.

### Rule 4 — What slowed last time?
CLAUDE.md frameworks are a thin category — many repos under 200 stars.
Prevention: Accept smaller repos where the category is genuinely sparse.

### Rule 5 — What to automate?
After 40 profiles, the lookup pattern is fully proven.
P1 ticket: build scripts/find_repo.py to automate sprint-plan-name → canonical-repo resolution.

---

## TARGET TOOLS (verify all before profiling)

### Prompt libraries (5)
- Anthropic cookbook (official Anthropic prompt/recipe collection)
- Fabric (danielmiessler/fabric — prompt patterns framework)
- LangChain Hub or equivalent community prompt library
- Promptflow (Microsoft prompt engineering framework)
- One more active prompt library (search: "prompt library claude" by stars)

### SDK patterns (5)
- Anthropic Python SDK (anthropics/anthropic-sdk-python)
- Anthropic TypeScript SDK (anthropics/anthropic-sdk-typescript)
- Vercel AI SDK (vercel/ai — includes Claude support)
- One prominent SDK wrapper or adapter pattern
- One Claude-specific SDK extension or utility

---

## ACCEPTANCE CRITERIA
- [ ] All 10 YAML files exist in data/tools/
- [ ] All 10 pass validate_yaml.py with zero errors
- [ ] Scores are null on all 10 (no evaluations yet)
- [ ] Status computed from actual pushed_at via gh api
- [ ] Claude Code review: PASS
- [ ] Pivots documented in sprint_plan.md
- [ ] /iterate run: AGENTS.md + DECISIONS.md updated if needed
- [ ] TASK.md archived to tasks/completed/
- [ ] Committed on feature branch

## NEXT TASK
p0-007-eval-observability-profiles (tools 41-50)
