# TASK: p0-012-launch
# Date: 2026-03-31 | Phase: 0
# Status: IN PROGRESS

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-012 — the repo is private and no one can use the data yet.
What breaks without it: Phase 0 exit criteria (100 stars, 5 organic evals, community posts live) are all gated on the repo being public.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Launch is primarily configuration and writing tasks, not code. No new scripts needed.
Do NOT build a web UI, CLI, or API before making the data public — the data IS the product at launch.

### Rule 3 — Simplest implementation?
1. README.md — explains dataset, schema, contribution guide, link to schema.yaml
2. Make repo public (manual GitHub UI step — flag for Jihoon to approve)
3. Post in 3 communities: Anthropic Discord #claude-code, Reddit r/ClaudeAI, Dev.to

### Rule 4 — What slowed last time?
Nothing blocked P0-011. Risk here: README quality — a poor README means no organic contributions. Write it to answer the three questions every developer asks first:
  1. What is this?
  2. How do I find a tool?
  3. How do I submit an evaluation?

### Rule 5 — What to automate?
Community posts are one-time manual actions. No automation needed for P0-012. Buttondown digest deferred to P1-007.

---

## DELIVERABLES

### 1. README.md (root)
Required sections:
- What is AgentRadar (2 sentences)
- Quick start: how to find a tool / read a score
- Schema overview: link to data/schema.yaml and Data_Model.md
- How to contribute: evaluation submission process, PR template
- Scoring dimensions (p/q/c/r/x/f) — one-line each
- Link to versus pages
- Badge: validate status from GitHub Actions

### 2. Make repo public
This is a manual step — Jihoon must approve before proceeding.
Flag this step explicitly in the launch checklist.

### 3. Community posts
- Anthropic Discord #claude-code
- Reddit r/ClaudeAI
- Dev.to article (title: "I built a /radar plugin for Claude Code that reads your project before recommending tools")

_Buttondown newsletter deferred to P1-007 — no audience before the /radar plugin ships._

---

## ACCEPTANCE CRITERIA
- [x] README.md written and covers all 4 required sections — updated for scan/suggest/check framing
- [x] validate.yml badge renders correctly in README
- [x] data/CONTRIBUTING.md written (evaluation submission process)
- [x] Repo made public (2026-04-01)
- [x] Digest draft written — data/digests/launch-001.md (Buttondown account deferred to P1-007)
- [x] First digest draft written — data/digests/launch-001.md
- [x] 3 community posts drafted — docs/launch/community-posts.md
- [ ] Claude review: PASS on README clarity

## NEXT TASK
p1-001-radar-plugin (Phase 1 begins — /radar Claude Code plugin)
