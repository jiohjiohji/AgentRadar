# TASK: p0-005-orchestration-claudemd-profiles
# Date: 2026-03-31 | Phase: 0
# Status: BACKLOG

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-005 — 30 tools needed before score computation (P0-009) can run.
What breaks without it: Orchestration and CLAUDE.md categories have zero coverage.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Remove nothing — additive batch.
Minimum viable version: 10 profiles validated.

### Rule 3 — Simplest implementation?
Same workflow: gh api to get pushed_at → write YAML → validate_yaml.py.
Do not create a new automation script mid-batch; log the pattern for P1.

### Rule 4 — What slowed last time?
Sprint plan tool names were approximate — 4 of 10 P0-004 entries needed pivots.
Prevention: GitHub-search first for every entry, before writing any profile.

### Rule 5 — What to automate?
The lookup step (sprint plan name → canonical repo) is now clearly repeatable.
Note for P1: add a `scripts/find_repo.py` that resolves a tool name to its top GitHub match.

---

## TARGET TOOLS (verify all before profiling)

### Orchestration frameworks (5)
- CrewAI (any official Claude Code integration or standalone)
- AutoGen / AG2 (Microsoft multi-agent framework)
- LangGraph (LangChain orchestration layer)
- OpenAI Swarm or equivalent lightweight orchestration
- One more active orchestration framework (search: "agent orchestration claude-code" by stars)

### CLAUDE.md frameworks (5)
- SPARC framework (ruvnet or equivalent)
- Claude Engineer (a prominent CLAUDE.md-driven dev framework)
- cursor-tools or equivalent CLAUDE.md + tools combo
- One prominent RULES.md / AGENTS.md template repo
- One more CLAUDE.md best-practices repo

---

## ACCEPTANCE CRITERIA
- [ ] All 10 YAML files exist in data/tools/
- [ ] All 10 pass validate_yaml.py with zero errors
- [ ] Scores are null on all 10 (no evaluations yet)
- [ ] Status computed from actual pushed_at via gh api
- [ ] Claude Code review: PASS
- [ ] Pivots documented in sprint_plan.md
- [ ] /iterate run: AGENTS.md + DECISIONS.md updated
- [ ] TASK.md archived to tasks/completed/
- [ ] Committed on feature branch

## NEXT TASK
p0-006-prompt-library-sdk-profiles (tools 31-40)
