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
**Goal:** Public dataset live with 50 tool profiles, curated scores, 3 versus pages
**Exit criteria:** 100 GitHub stars, community posts live
**Status:** DONE — all 12 tickets complete. 3 community posts pending manual publish (Discord/Reddit/Dev.to).

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
Exit criteria (100 stars) are lagging indicators measured post-launch, not blockers.

---

## PHASE 1 — SIGNAL
**Goal:** Developers inside Claude Code can find, evaluate, and install the right tools without leaving their session
**Exit criteria:** 500 /radar plugin installs, 50% of scan users adopt at least 1 recommended tool
**Status:** 7/7 tickets DONE — pending manual deploy steps (wrangler, Stripe, Buttondown, community posts)
**Priority rationale:** Claude Code users are the target audience. /radar (zero friction, no separate install) ships first. CLI ships second for CI and non-session contexts.

### P1-001 — Claude Code `/radar` plugin (PRIMARY entry point)
Status: DONE (2026-04-01)
Notes: tools-index.json generated (50 tools, one fetch). Ranking is style-adaptive: inferStyle() classifies user as vibe/agent/balanced, fitBonus rewards high f_score (vibe) or x_score (agent). Intent signals extracted from markdown when no deps found. Single radar.md routes all subcommands via $ARGUMENTS. postinstall.js auto-installs to ~/.claude/commands/. CI enforces index stays current.
Acceptance:
- [x] `/radar scan` — reads current project, outputs 1–3 recommendations with "why this fits you"
- [x] `/radar suggest [need]` — "I need browser testing" → compatible matches for current stack
- [x] `/radar check` — flags archived/stale tools, shows better alternatives
- [x] `/radar setup [tool-id]` — agent installs and configures the tool inside the session
- [x] `/radar show [tool-id]` — full profile, scores if available, versus page link if exists
- [x] Plugin installable via npm install -g @agentRadar/claude-plugin
- [x] Ranking logic: style-adaptive fitBonus (f_score for vibe, x_score for agent) + status + tag overlap + intent signals

### P1-002 — Cloudflare Worker API (Git-backed)
Status: DONE (2026-04-01, pending manual wrangler deploy by Jihoon)
Notes: api/src/index.ts + ranking.ts + types.ts. 12/12 tests pass. deploy-worker.yml wires CI deploy on push to main (after CLOUDFLARE_API_TOKEN secret is added). KV namespace ID is a placeholder — Jihoon must run `wrangler kv:namespace create RATE_LIMIT` and paste IDs into wrangler.toml.
Acceptance:
- [x] Worker reads from GitHub raw content CDN
- [x] GET /api/v1/tools returns all tools as JSON
- [x] GET /api/v1/tools/:id returns single tool profile
- [x] GET /api/v1/tools/match?stack=X&need=Y returns context-aware ranked matches
- [x] GET /api/v1/versus/:id1/:id2 returns versus page data
- [x] Rate limiting via KV: 100K req/day free, returns 429 on exceeded
- [ ] Deployed to production Cloudflare Worker URL — MANUAL (Jihoon)

### P1-003 — CLI: `check` (maintenance — highest CI demand)
Status: DONE (2026-04-01)
Notes: cli/src/{detect,check,format,fetch,index}.ts. 17/17 tests pass. Falls back to GitHub raw if Worker not deployed. templates/agentRadar-check.yml for drop-in CI integration.
Acceptance:
- [x] `agentRadar check` — scans installed tools (package.json, requirements.txt, MCP config, .claude/), reports health
- [x] Flags archived/stale tools with alternatives
- [x] Flags better alternatives (active, composite >= current + 1.5)
- [x] Exit code 0 = healthy, exit code 1 = action needed
- [x] `agentRadar check --json` — machine-readable output
- [x] `agentRadar check --fix` — prints install commands, no side effects
- [x] GitHub Actions template: templates/agentRadar-check.yml

### P1-004 — CLI: `scan` + `suggest` (discovery)
Status: DONE (2026-04-01)
Notes: cli/src/{scan,ranking}.ts. 27/27 tests pass (17 check + 10 scan). detect.ts shared across check/scan/suggest. Versus link surfaced when top two are within 1 score point and a versus page exists.
Acceptance:
- [x] `agentRadar scan` — reads project, outputs 1–3 gap recommendations
- [x] `agentRadar suggest "browser testing"` — query-based, context-aware match
- [x] Detects existing tools: package.json deps, pip deps, .claude/skills, MCP config
- [x] Matches on category + tags — scores shown as tiebreaker only
- [x] If 2 tools are close, surfaces the versus page link
- [x] Shows [ARCHIVED] / [STALE] — never recommends dead tools
- [x] --json flag for agent-consumable output
- [ ] npm install -g agentRadar cross-platform — deferred until CLI is published to npm

### P1-005 — Static web UI + Pagefind (browseable dataset, SEO)
Status: DONE (2026-04-01)
Notes: scripts/build_site.py → web/dist/ (50 tool pages, 3 versus pages, homepage). Pagefind runs as post-build step in CI. build-site.yml deploys to gh-pages on push. web/dist/ gitignored.
Acceptance:
- [x] GitHub Pages site builds from YAML + markdown via GitHub Actions (build-site.yml)
- [x] All 50 tool profiles have individual pages with canonical URLs
- [x] All versus pages have individual pages
- [x] Pagefind search (browser-side, runs post-build in CI)
- [x] Mobile-responsive (375px width, CSS min-width constraint)
- [x] Maintenance status badge on every tool page

### P1-006 — Weekly processor automation
Status: DONE (2026-04-01)
Notes: scripts/weekly_processor.py. No last_commit in schema — processor fetches pushed_at live from GitHub API (no schema change). Rebuilds index if any status changed. weekly-processor.yml runs Mondays 06:00 UTC and commits changes. Buttondown send deferred to P1-007.
Acceptance:
- [x] GitHub Actions workflow runs every Monday at 06:00 UTC
- [x] Stale status updated for all tools (fetches GitHub pushed_at, no schema field needed)
- [x] Versus page staleness detection (flags pages with >1.0 score drift from score_history[0])
- [x] Digest draft committed to data/digests/YYYY-MM-DD-draft.md
- [ ] Buttondown API sends digest — deferred to P1-007

### P1-007 — Pro tier: Stripe + watchlist + early digest
Status: DONE (2026-04-01, pending manual Stripe + Buttondown setup by Jihoon)
Notes: api/src/pro.ts handles checkout/webhook/watchlist. cli/src/watch.ts adds `agentRadar watch`. weekly_processor.py sends Buttondown digest (Saturday=Pro, Monday=public). 20/20 api tests, 27/27 cli tests. KV namespace IDs are placeholders — Jihoon must run `wrangler kv:namespace create PRO_KEYS`.
Acceptance:
- [x] Stripe checkout creates Pro subscription ($9/month beta)
- [x] Webhook writes Pro API key to Cloudflare KV within 5 minutes of payment
- [x] `agentRadar watch [id]` stores subscription against API key
- [x] Email within 24 hours of status change for watched tools (via weekly processor)
- [x] Pro subscribers receive digest Saturday (48h before public Monday send)
- [x] Subscription lapse cancels API key (customer.subscription.deleted webhook)
- [ ] Live deployment — MANUAL (Jihoon: Stripe account + Buttondown account + wrangler secrets)

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

### Actual — Phase 1 (2026-04-01)

P1-001 through P1-007 completed in a single session on 2026-04-01. Estimated: 3–4 weeks. Actual: 1 day.

Key factors:
- Phase 0 data foundation (50 tools, 150 evals, validated YAML) meant Phase 1 had zero data setup
- ranking.ts written once in api/, ported to cli/ — no re-derivation of the algorithm
- detect.ts written once for check (P1-003), shared by scan/suggest (P1-004) with no changes
- Static site generator (P1-005) reused pyyaml already installed — zero new deps
- weekly_processor.py (P1-006) fetches pushed_at live — avoided schema migration entirely
- Pro tier (P1-007) used Web Crypto API for Stripe HMAC — no npm dep, no SDK

Total tests: 47 (20 api + 27 cli). Zero test failures after initial threshold bug fixed in matchTool.

Post-P1 addition: style-adaptive ranking (intent.ts, fitBonus in ranking.ts). Added intent extraction from markdown, developer style inference (vibe/agent/balanced), and f_score/x_score to tools-index.json. Tests grew to 69 (49 cli + 20 api).

Manual steps remaining (Jihoon): wrangler deploy + Stripe + Buttondown + CLOUDFLARE_API_TOKEN secret + 3 community posts.