# TASK: p0-012-launch
# Date: 2026-03-31 | Phase: 0
# Status: BACKLOG

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-012 — the repo is private and no one can use the data yet.
What breaks without it: Phase 0 exit criteria (100 stars, 5 organic evals, newsletter launched) are all gated on the repo being public.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Launch is primarily configuration and writing tasks, not code. No new scripts needed.
Do NOT build a web UI, CLI, or API before making the data public — the data IS the product at launch.

### Rule 3 — Simplest implementation?
1. README.md — explains dataset, schema, contribution guide, link to schema.yaml
2. Make repo public (manual GitHub UI step — flag for Jihoon to approve)
3. Buttondown account + first digest draft
4. Post in 3 communities: Anthropic Discord #claude-code, Reddit r/ClaudeAI, Dev.to

### Rule 4 — What slowed last time?
Nothing blocked P0-011. Risk here: README quality — a poor README means no organic contributions. Write it to answer the three questions every developer asks first:
  1. What is this?
  2. How do I find a tool?
  3. How do I submit an evaluation?

### Rule 5 — What to automate?
Community posts are one-time manual actions. The only automation candidate is Buttondown digest publishing — wire up after first manual send confirms format.

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

### 3. Buttondown newsletter
- Account created at buttondown.com with AgentRadar branding
- Confirmed double-opt-in is enabled
- First digest draft written (top 5 tools by composite score, 1 versus highlight)

### 4. Community posts
- Anthropic Discord #claude-code
- Reddit r/ClaudeAI
- Dev.to article (title: "AgentRadar: Open dataset of 50 Claude Code tools with community scores")

---

## ACCEPTANCE CRITERIA
- [ ] README.md written and covers all 4 required sections
- [ ] validate.yml badge renders correctly in README
- [ ] data/CONTRIBUTING.md written (evaluation submission process)
- [ ] Repo made public (Jihoon approval required before this step)
- [ ] Buttondown account created, first digest draft written
- [ ] 3 community posts drafted (ready to post on launch day)
- [ ] Claude review: PASS on README clarity

## NEXT TASK
p1-001-cloudflare-worker (Phase 1 begins)
