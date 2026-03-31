# TASK: p0-009-score-computation
# Date: 2026-03-31 | Phase: 0
# Status: BACKLOG

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-009 — 150 evaluations exist but no scores are published.
What breaks without it: The entire value proposition of AgentRadar (ranked, comparable scores) is blocked.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Do not build a complex scoring engine. A simple aggregation script (mean of dimension values,
confidence from eval count, CoI filtering) is sufficient. No ML, no weighting algorithms yet.

### Rule 3 — Simplest implementation?
scripts/score_computation.py reads data/evaluations/*.yaml, groups by tool_id, computes:
  - dimension means (p, q, c, r, x, f) across all clean evals
  - composite score (mean of 6 dimensions)
  - confidence: LOW (<3 evals), MED (3–9 evals), HIGH (10+ evals)
  - Writes scores to each tool profile in data/tools/[tool-id].yaml

### Rule 4 — What slowed last time?
Profile write collisions — evaluation writing conflicted when multiple agents shared state.
For score computation: run as a single sequential script, not distributed.

### Rule 5 — What to automate?
Score recomputation should run in GitHub Actions on every merged evaluation PR.
Implement the local script first; wire up Actions in P0-011.

---

## PROCESS

### Score computation logic
Input: data/evaluations/*.yaml (150 files, 3 per tool)
Output: scores block in each data/tools/[tool-id].yaml

1. Load all evaluations, group by tool_id
2. Filter: discard any eval where conflict_of_interest is not "none" (CoI filtering)
3. For each tool, compute per-dimension mean (values 0–10, null scores excluded from mean)
4. Compute composite = mean(p, q, c, r, x, f)
5. Assign confidence:
   - LOW: 1–2 clean evals
   - MED: 3–9 clean evals
   - HIGH: 10+ clean evals
6. Write scores block to tool profile:
   ```yaml
   scores:
     p: 8.3
     q: 7.7
     c: 6.0
     r: 8.0
     x: 8.3
     f: 6.3
     composite: 7.4
     confidence: MED
     eval_count: 3
     last_computed: "2026-03-31"
   ```

### Quality gate
- Validate all tool profiles still pass validate_yaml.py after scores are written
- Confirm no tool has scores from CoI-flagged evaluations
- Spot-check: manually verify 5 tool score computations match expected values

---

## ACCEPTANCE CRITERIA
- [ ] scripts/score_computation.py exists and runs without errors
- [ ] All 50 tools with 3+ evaluations have scores written to their profiles
- [ ] All published scores include confidence level (LOW/MED/HIGH)
- [ ] Score history: last_computed date present on every scored tool
- [ ] No tool has scores from CoI-flagged evaluations
- [ ] All 50 tool profiles still pass validate_yaml.py after score write
- [ ] Spot-check: 5 manually verified computations match script output
- [ ] Claude review: PASS
- [ ] Committed on feature/p0-009-score-computation branch

## NEXT TASK
p0-010-versus-pages
