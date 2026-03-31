# AgentRadar — Sprint Plan & Ticket Backlog
# Version: 1.1 | Owner: Jihoon | Status: ACTIVE | Updated: 2026-04-01
# Feed this to Claude when planning tasks, creating TASK.md, or assigning work to agents.
# Update ticket status here as work progresses.

---

## How to Use This File

When starting a task:
1. Find the ticket in the relevant phase below
2. Copy its acceptance criteria into a new TASK.md
3. Apply the Musk 5-rules pre-check in TASK.md before any agent starts
4. Mark the ticket IN_PROGRESS here
5. Mark it DONE after /iterate completes

Ticket status: BACKLOG → IN_PROGRESS → DONE → BLOCKED (with reason)

---

## PHASE 0 — DATA FOUNDATION
**Goal:** Public dataset live with 50 tools, 150 seed evaluations, 3 versus pages
**Exit criteria:** 100 GitHub stars, 5 organic evaluations, community posts live
**Status:** 12/12 tickets DONE — P0-012 written deliverables complete, 3 community posts pending manual publish

### P0-001 — Project scaffolding and tool installation
Status: DONE (setup guide completed)
Acceptance:
- [ ] Directory structure created
- [ ] Five governing files in place (AGENTS.md, CLAUDE.md, TASK.md, RULES.md, DECISIONS.md)
- [ ] claude-context-mode, tdd-guard, agnix installed and verified
- [ ] GitHub Actions workflow validates YAML on every PR
- [ ] All validation scripts pass on empty dataset

### P0-002 — Schema and validation infrastructure
Status: DONE (setup guide completed)
Acceptance:
- [ ] data/schema.yaml published with all 12 field definitions
- [ ] scripts/validate_yaml.py correctly rejects profiles with wrong field count
- [ ] scripts/validate_yaml.py correctly rejects profiles with invalid enum values
- [ ] scripts/validate_evaluation.py correctly rejects evaluations without CoI field
- [ ] scripts/validate_versus.py correctly rejects pages without valid_until

### P0-003 — Batch 1: 10 MCP Server profiles
Status: DONE (2026-03-31, commit e98f12e)
Notes: Browser MCP and Linear MCP found archived via live GitHub API — would have been missed without live data. Substituted active equivalents.

### P0-004 — Batch 2: 10 Claude Code Plugin + orchestration profiles
Status: DONE (2026-03-31, commit 6cc66cf)
Notes: ClaudoPro Directory unverifiable (ghost repo) — substituted with verified alternative same category. Archived task: tasks/completed/2026-03-31-p0-004-plugin-profiles.md

### P0-005 — Batch 3: 10 Orchestration + CLAUDE.md Framework profiles
Status: DONE (2026-03-31, commit 7958ae9)
Notes: Category decision recorded in DECISIONS.md — orchestration vs claude-plugin boundary clarified. Archived: tasks/completed/2026-03-31-p0-005-orchestration-claudemd.md

### P0-006 — Batch 4: 10 Prompt Library + SDK Pattern profiles
Status: DONE (2026-03-31, commit 0810e59)
Notes: NOASSERTION license handling decision added to DECISIONS.md. Archived: tasks/completed/2026-03-31-p0-006-prompt-sdk-profiles.md

### P0-007 — Batch 5: 10 Evaluation + Complementary Tool profiles
Status: DONE (2026-03-31, commit 33a47c7)
Notes: Braintrust had no significant open-source repo — substituted with Arize Phoenix (same category, verified repo). Archived: tasks/completed/2026-03-31-p0-007-eval-complementary-profiles.md

### P0-008 — 150 seed evaluations (3 per tool)
Status: DONE (2026-03-31, commit b1dfc82)
Notes: All 150 evaluations validated. Archived: tasks/completed/2026-03-31-p0-008-seed-evaluations.md

### P0-009 — Score computation — first run
Status: DONE (2026-03-31, commit e14a203)
Notes: All 50 tools scored. Archived: tasks/completed/2026-03-31-p0-009-score-computation.md

### P0-010 — First 3 versus pages
Status: DONE (2026-03-31, commit 9f45835)
Notes: All 3 pages evidence-backed from seed evaluations. Archived: tasks/completed/2026-03-31-p0-010-versus-pages.md

### P0-011 — Daily crawler implementation
Status: DONE (2026-03-31, commit 3e60a36)
Notes: scripts/crawl.py + .github/workflows/daily-crawler.yml. Archived: tasks/completed/2026-03-31-p0-011-daily-crawler.md

### P0-012 — Launch: Make data repo public + community posts
Status: IN_PROGRESS (2026-04-01)
Dependencies: All P0 tickets DONE ✓
Note: Buttondown dropped — newsletter deferred to P1-007 (Pro digest). Acquisition channel
is the /radar plugin, not email. No audience to send to before the plugin ships.
Acceptance:
- [x] README.md written — /radar plugin primary, CLI secondary, badge, schema, versus links
- [x] data/CONTRIBUTING.md written — evaluation submission guide
- [x] Repo made public (2026-04-01)
- [x] 3 community posts drafted — docs/launch/community-posts.md
- [ ] Post in Anthropic Discord #claude-code — MANUAL
- [ ] Post in Reddit r/ClaudeAI — MANUAL
- [ ] Publish Dev.to article — MANUAL
Exit criteria (100 stars, 5 organic evals) are lagging indicators measured post-launch, not blockers.

---

## PHASE 1 — SIGNAL
**Goal:** Developers inside Claude Code can find, evaluate, and install the right tools without leaving their session
**Exit criteria:** 500 /radar plugin installs, 50% of scan users adopt at least 1 recommended tool
**Priority rationale:** Claude Code users are the target audience. /radar (zero friction, no separate install) ships first. CLI ships second for CI and non-session contexts.

### P1-001 — Claude Code `/radar` plugin (PRIMARY entry point)
Status: BACKLOG
Why first: Claude Code users are already in a session. The plugin requires no separate install —
just add a plugin. This is the fastest path to actual users.
Data source: fetches YAMLs directly from GitHub raw content. No Worker dependency for MVP.
Acceptance:
- [ ] `/radar scan` — reads current project, outputs 1–3 recommendations with "why this fits you"
- [ ] `/radar suggest [need]` — "I need browser testing" → compatible matches for current stack
- [ ] `/radar check` — flags archived/stale tools, shows better alternatives
- [ ] `/radar setup [tool-id]` — agent installs and configures the tool inside the session
    (adds to MCP config, updates CLAUDE.md, installs deps — without leaving Claude Code)
- [ ] `/radar show [tool-id]` — full profile, scores if available, versus page link if exists
- [ ] Plugin installable via npm install -g @agentRadar/claude-plugin
- [ ] Ranking logic: status + stars + tag overlap — scores shown when present, never required

### P1-002 — Cloudflare Worker API (Git-backed)
Status: BACKLOG
Dependencies: P1-001 (proves the data model before adding infra)
Acceptance:
- [ ] Worker reads from GitHub raw content CDN
- [ ] GET /api/v1/tools returns all tools as JSON
- [ ] GET /api/v1/tools/:id returns single tool profile
- [ ] GET /api/v1/tools/match?stack=X&need=Y returns context-aware ranked matches
- [ ] GET /api/v1/versus/:id1/:id2 returns versus page data
- [ ] Rate limiting via KV: 100K req/day free, returns 429 on exceeded
- [ ] Deployed to production Cloudflare Worker URL

### P1-003 — CLI: `check` (maintenance — highest CI demand)
Status: BACKLOG
Why before scan: CI integration is a pull — teams add it to their workflow. scan requires
the developer to already trust AgentRadar enough to run it. check earns that trust first.
Dependencies: P1-002 (Worker API for match endpoint)
Acceptance:
- [ ] `agentRadar check` — scans installed tools (package.json, MCP config, .claude/), reports health
- [ ] Flags archived/stale tools: "browser-mcp last commit Apr 2025 — consider playwright-mcp"
- [ ] Flags better alternatives based on category + star count (not score)
- [ ] Only recommends alternatives compatible with existing deps — no breaking changes
- [ ] Exit code 0 = healthy, exit code 1 = action needed (CI-friendly)
- [ ] `agentRadar check --fix` — outputs install commands for recommended replacements
- [ ] GitHub Action template: `.github/workflows/agentRadar-check.yml`

### P1-004 — CLI: `scan` + `suggest` (discovery)
Status: BACKLOG
Dependencies: P1-003 (shares project detection engine from check)
Acceptance:
- [ ] `agentRadar scan` — reads project, outputs 1–3 gap recommendations
- [ ] `agentRadar suggest "browser testing"` — query-based, context-aware match
- [ ] Detects existing tools: package.json deps, pip deps, .claude/skills, MCP config
- [ ] Matches on: category + tags + stack compatibility — not scores
- [ ] If 2 tools are close, surfaces the versus page link instead of picking one
- [ ] Shows `[ARCHIVED]` / `[STALE]` — never recommends dead tools
- [ ] `--json` flag for agent-consumable output
- [ ] npm install -g agentRadar works on macOS, Linux, Windows WSL

### P1-005 — Static web UI + Pagefind (browseable dataset, SEO)
Status: BACKLOG
Why here: the public repo is live. People will find it via search. They need browseable pages
with canonical URLs — not a React app, just rendered YAML + markdown.
Acceptance:
- [ ] GitHub Pages site builds from YAML + markdown via GitHub Actions
- [ ] All 50 tool profiles have individual pages with canonical URLs
- [ ] All versus pages have individual pages
- [ ] Pagefind search returns results in <100ms (browser-side)
- [ ] Mobile-responsive (375px width)
- [ ] Maintenance status badge on every tool page

### P1-006 — Weekly processor automation
Status: BACKLOG
Acceptance:
- [ ] GitHub Actions workflow runs every Monday at 06:00 UTC
- [ ] Stale status updated for all tools based on last_commit age
- [ ] Versus page staleness detection (flags pages with >1.0 score drift)
- [ ] Digest draft committed to data/digests/YYYY-MM-DD-draft.md
- [ ] Buttondown API sends digest after maintainer approves draft (requires P1-007 — Buttondown deferred)

### P1-007 — Pro tier: Stripe + watchlist + early digest
Status: BACKLOG
Acceptance:
- [ ] Stripe checkout creates Pro subscription ($9/month beta)
- [ ] Webhook writes Pro API key to Cloudflare KV within 5 minutes of payment
- [ ] `agentRadar watch [id]` stores subscription against API key
- [ ] Email within 24 hours of status change (active → stale, stale → archived) for watched tools
- [ ] Pro subscribers receive digest Saturday (48 hours before public Monday)
- [ ] Subscription lapse cancels API key within 24 hours of failed payment

---

## PHASE 2 — INTELLIGENCE (Month 2–6)
**Goal:** Automated benchmarks, VS Code extension, Team tier
Tickets to be refined when Phase 1 exit criteria are met.

### P2-001 — Automated benchmark runner (T01 + T02 first)
### P2-002 — Benchmark cost cap enforcement (30% of Pro MRR)
### P2-003 — VS Code extension v0.1
### P2-004 — agentRadar claude-md command
### P2-005 — Team tier: dashboard, private eval sharing, Slack bot
### P2-006 — D1 nightly sync for search

---

## PHASE 3 — CURRENCY (Month 6–12)
### P3-001 — Tool lifecycle automation (Pending → Active → Stale → Archived)
### P3-002 — Versus page auto-generation trigger (5+ overlapping evaluations)
### P3-003 — Full benchmark suite (T04 + T06 added)
### P3-004 — Tier 3 Deep Eval programme
### P3-005 — Monthly ecosystem sync
### P3-006 — scan/suggest v2: learns from what devs actually adopt after recommendations
### P3-007 — agentRadar watch webhooks (Team tier)
### P3-008 — Pro stable pricing ($15/month)

---

## PHASE 4 — GOVERNANCE (Year 2)
### P4-001 — Core Evaluator programme
### P4-002 — Enterprise tier
### P4-003 — Data & API commercial track
### P4-004 — Schema v2.0 (if warranted)
### P4-005 — AgentRadar Certified badge

---

## PHASE 5 — STANDARD (Year 3)
### P5-001 — GitHub MCP Registry integration
### P5-002 — International expansion
### P5-003 — scan v3: deep project analysis (reads code patterns, detects workflow bottlenecks, proactive recommendations)

---

## Velocity Notes

Expected delivery rate (solo founder, ~20 hrs/week):
- P0 tickets: 2–3 tickets per week (data work is labour-intensive)
- P1 tickets: 1–2 tickets per week (more technical, but tools help)
- P2+ tickets: depends on Phase 1 learnings

Track actual velocity in tasks/completed/ and adjust here quarterly.

### Actual — Phase 0 (2026-03-31)

P0-001 through P0-011 completed in a single session on 2026-03-31. Estimated: 3–4 weeks. Actual: 1 day.

Key factors:
- Parallel agent execution (5 Gemini Flash agents per data batch) collapsed P0-003 through P0-007 into parallel runs
- Validation scripts caught errors inline — no rework cycles
- Score computation script was automated — P0-009 was minutes not hours

Pivot recorded on 2026-03-31: product direction shifted from passive dataset browser to /radar Claude Code plugin (primary) + CLI (secondary). AGENTS.md, DECISIONS.md, sprint_plan.md updated. P1 reordered: /radar plugin is P1-001, CLI check is P1-003.

Buttondown dropped from P0-012. Newsletter deferred to P1-007 (Pro digest) — no audience before the plugin ships.

P0-012 remaining: 3 community posts to publish manually. Repo is public. All written deliverables done.