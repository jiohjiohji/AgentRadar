# TASK: p0-004-plugin-profiles
# Date: 2026-03-31 | Phase: 0
# Status: DONE

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-004 (20 tools needed before scoring can run)
What breaks without it: Evaluation coverage is MCP-only; no representation of orchestration/plugin ecosystem.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Remove nothing — additive batch.
Minimum viable version: 10 profiles. Same batch discipline as P0-003.

### Rule 3 — Simplest implementation?
Reuse the same YAML template and validation workflow from P0-003. No new tooling.

### Rule 4 — What slowed last time?
P0-003: Browser MCP and Linear MCP status wrong until live GitHub API check.
Prevention: Query `pushed_at` via `gh api` before writing any profile.

### Rule 5 — What to automate?
Sprint plan tool names are approximate — a lookup script that maps sprint plan entries to
canonical GitHub repos (by star count + description match) would prevent manual pivots.
Flag for P1 crawler work.

---

## PIVOTS

| Sprint plan entry | Actual repo used | Reason |
|---|---|---|
| TÂCHES (taches-dev/claude-code-resources) | gsd-build/get-shit-done | Actual TÂCHES repo — 45.6k stars, description confirms it |
| Conductor (claude-code-workflows repo) | gemini-cli-extensions/conductor | Original Conductor source — 3.3k stars |
| Claude Code PM (Ran Aroussi) | ranaroussi/cc-bridge | No PM tool found; cc-bridge is Ran Aroussi's most prominent Claude Code repo |
| ClaudoPro Directory (ghost) | ryanmac/code-conductor | Unverifiable; substituted verified alternative in same category |

---

## DONE WHEN
- [x] 10 tool profiles in data/tools/
- [x] All 10 pass validate_yaml.py with zero errors
- [x] Claude review: PASS
- [x] /iterate run and AGENTS.md + DECISIONS.md updated
- [x] TASK.md archived
- [x] Committed

## NEXT TASK
p0-005-orchestration-claudemd-profiles (tools 21-30)
