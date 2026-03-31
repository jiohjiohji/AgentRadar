# TASK: p0-007-eval-observability-profiles
# Date: 2026-03-31 | Phase: 0
# Status: BACKLOG

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-007 — final batch to reach 50 tools.
What breaks without it: eval/observability and complementary categories have zero coverage.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Nothing — additive final batch.

### Rule 3 — Simplest implementation?
Same workflow: gh api search → write YAML → validate.

### Rule 4 — What slowed last time?
Nothing slowed P0-006 — all 10 mapped cleanly.
Prevention: Continue verifying with gh api before writing.

### Rule 5 — What to automate?
This is the last manual batch. After P0-007, automate status refresh via crawler (P0-011).

---

## TARGET TOOLS (verify all before profiling)

### Eval / Observability (5)
- Langfuse (popular open-source LLM observability platform)
- Helicone (LLM observability + caching)
- Braintrust (LLM eval platform)
- Weights & Biases / Weave (W&B's LLM eval layer)
- One more: PromptLayer or Arize Phoenix or similar

### Complementary tools (5)
- E2B (code sandbox for AI agents)
- Modal (serverless GPU/compute for AI)
- Playwright (already in MCP batch — use a different complementary tool)
- Browserbase (cloud browser for AI agents)
- One more active complementary tool (search: "ai agent sandbox cloud compute" by stars)

---

## ACCEPTANCE CRITERIA
- [ ] All 10 YAML files exist in data/tools/
- [ ] All 10 pass validate_yaml.py with zero errors
- [ ] Scores are null on all 10
- [ ] Status computed from actual pushed_at via gh api
- [ ] Claude Code review: PASS
- [ ] sprint_plan.md P0-007 updated with actual repos + pivots
- [ ] Velocity log updated (50/50 complete)
- [ ] /iterate run
- [ ] TASK.md archived
- [ ] Committed on feature branch

## NEXT TASK
p0-008-seed-evaluations (150 evaluations, 3 per tool)
