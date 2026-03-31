---
id: gh-gsd-build-get-shit-done-vs-gh-neolab-context-engineering-kit
tool_a: gh-gsd-build-get-shit-done
tool_b: gh-neolab-context-engineering-kit
category: claudemd-framework
valid_until: 2026-06-29
created: 2026-03-31
---

# TÂCHES vs NeoLab Context Engineering Kit

## Quick Answer

**Choose TÂCHES** for spec-driven feature development and complex refactoring where planning discipline compounds into fewer rework cycles.

**Choose NeoLab Context Engineering Kit** for establishing a shared Claude Code context structure across a team, particularly for standardising conventions and reducing per-session re-explanation.

## Score Comparison

| Dimension | TÂCHES | NeoLab CEK |
|-----------|--------|------------|
| Productivity (p) | **8.7** | 6.0 |
| Quality (q) | **8.7** | 6.0 |
| Cost Efficiency (c) | **8.7** | 7.0 |
| Reliability (r) | 8.3 | 7.3 |
| Composability (x) | **9.0** | 6.0 |
| Setup Friction (f) | 8.7 | 7.0 |
| **Composite** | **8.7** | **6.5** |
| Confidence | medium (3 evals) | medium (3 evals) |

## Community Verdicts

**TÂCHES** — 3 evaluations (developer, team-lead, small-team):
- 8 features in 3 weeks vs team average of 5–6; zero features required major rework after spec sign-off
- Team PR cycle time dropped 31% in a 1-month pilot (4-person team); rework frequency halved
- Migration of monolithic Express API to microservices: dependency mapping phase identified 14 hidden couplings in 2 hours that would have been discovered mid-migration otherwise; zero regressions
- All 3 evaluators gave composability 9/10: framework drops into existing Claude Code workflows with no CLAUDE.md changes, no shared infrastructure
- "The spec discipline compounds over time — teams that stick with it get progressively better at scoping" — team-lead eval

**NeoLab Context Engineering Kit** — 3 evaluations (developer, small-team, researcher):
- Time spent re-explaining project conventions per session dropped measurably after kit adoption (5-person team)
- Code consistency across team members improved; shared context produced outputs that matched project style guides more reliably
- Developer: skills are "surface-level for Go microservices" — kit is optimised for web product development, not all domains
- Researcher: required "meaningful adaptation" for data science context; domain-specific skills took 2–3 hours to adapt
- NeoLab CEK's higher cost efficiency (7.0 vs TÂCHES 8.7) reflects structured prompts that reduce per-session token use for convention re-explanation

## Use Cases

**Prefer TÂCHES when:**
- You are building features or running complex refactors where scope definition is the highest-risk phase
- You want spec-first discipline to reduce late-stage rework — the planning overhead pays back on features with 2+ hours of implementation
- You work solo or in a small team and want a lightweight framework with zero infrastructure or licensing cost
- Your team is already Claude Code–native; TÂCHES assumes familiarity with Claude Code conventions

**Prefer NeoLab Context Engineering Kit when:**
- You need to standardise Claude Code usage across a team that currently has inconsistent prompting practices
- Your goal is reducing per-session context re-establishment (conventions, project structure, naming patterns) rather than improving planning discipline
- You are onboarding new developers to an existing Claude Code workflow and want a structured starting point they can follow

**Choose neither when:**
- Your Claude Code use is already well-structured and you are looking for automation (crawlers, test runners, score computation) rather than methodology — both are process frameworks, not execution tools
- Your domain has strong non-web conventions (ML research, embedded systems, data engineering) where both kits require significant adaptation before delivering their claimed value; consider writing a minimal CLAUDE.md from scratch instead

## Methodology

Scores computed from 6 independent evaluations (3 per tool) submitted 2026-03-08 through 2026-03-29.
All evaluators disclosed no conflict of interest. No tool author evaluations included.
Evidence strings are task-specific; see `data/evaluations/gh-gsd-build-get-shit-done-*.yaml` and
`data/evaluations/gh-neolab-context-engineering-kit-*.yaml` for raw data.
Score confidence: **medium** (3 evaluations each; 10+ required for high confidence).
