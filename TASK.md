# TASK: p0-008-seed-evaluations
# Date: 2026-03-31 | Phase: 0
# Status: BACKLOG

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-008 — no scores exist until evaluations are written.
What breaks without it: Score computation (P0-009) cannot run. The dataset is profiles only.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Write 3 evaluations per tool × 50 tools = 150. Start with 10 tools (30 evals), validate quality, then batch the rest.
Do NOT write evaluations for tools where you have no actual usage data. Flag these as needing community contribution.

### Rule 3 — Simplest implementation?
Use validate_evaluation.py to gate every batch. Write in groups of 10 tools (30 evals), validate, then continue.

### Rule 4 — What slowed last time?
Profiles were the easy part — data came from GitHub API.
Evaluations require actual usage evidence. This is harder. Do not invent.

### Rule 5 — What to automate?
Evaluation ingestion (community PRs → auto-validate → queue for review) is the P1 automation target.

---

## PROCESS

### Per evaluation file: data/evaluations/[tool-id]-[N].yaml
Required fields (check validate_evaluation.py for exact schema):
- tool_id (must match a profile in data/tools/)
- reporter_role (developer / team-lead / researcher / student / etc.)
- coi_declared (boolean — conflict of interest disclosure)
- evidence (specific, not generic — "increased PR review speed by 40%" not "very useful")
- date_tested (YYYY-MM-DD)
- dimensions (p, q, c, r, x, f — scores 0-10 or null if untested)

### Quality gate (from AGENTS.md + PRD)
- evidence strings must be specific — reject generic claims
- coi_declared must be present on every eval
- Tool authors cannot evaluate their own tool
- Scores must come from actual testing, not reputation

### Priority order for first 30 evals (10 tools × 3 each)
Start with the 10 highest-star active tools across all categories:
  1. Firecrawl (101.6k) — complementary
  2. Fabric (40.3k) — prompt-library
  3. CrewAI (47.7k) — orchestration
  4. wshobson/agents (32.6k) — orchestration
  5. Anthropic Cookbook (36.8k) — prompt-library
  6. AutoGen (56.5k) — orchestration
  7. LangGraph (28k) — orchestration
  8. TÂCHES (45.6k) — claudemd-framework
  9. LiteLLM (41.6k) — sdk-pattern
  10. Ruflo/claude-flow (28.8k) — orchestration

---

## ACCEPTANCE CRITERIA
- [ ] scripts/validate_evaluation.py exists and catches missing CoI field
- [ ] First 30 evaluations (10 tools) pass validate_evaluation.py
- [ ] All 150 evaluations pass validate_evaluation.py
- [ ] Evidence strings reviewed: no generic claims
- [ ] No tool has evaluations from its own author
- [ ] Claude review: PASS
- [ ] Committed

## NEXT TASK
p0-009-score-computation
