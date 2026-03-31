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
**Exit criteria:** 100 GitHub stars, 5 organic evaluations, newsletter launched
**Status:** 11/12 tickets DONE — P0-012 (launch) IN_PROGRESS

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

### P0-012 — Launch: Make data repo public + newsletter
Status: IN_PROGRESS (2026-04-01)
Dependencies: All P0 tickets DONE ✓
Acceptance:
- [x] README.md written — scan/suggest/check framing, badge, schema, versus links
- [x] data/CONTRIBUTING.md written — evaluation submission guide
- [x] First digest draft written — data/digests/launch-001.md
- [x] 3 community posts drafted — docs/launch/community-posts.md
- [ ] Repo made public — MANUAL: Jihoon must approve in GitHub UI
- [ ] Buttondown account created — MANUAL: account setup at buttondown.com
- [ ] Posted in Anthropic Discord #claude-code
- [ ] Posted in Reddit r/ClaudeAI
- [ ] Dev.to article published

---

## PHASE 1 — SIGNAL
**Goal:** A CLI that reads your project, finds gaps, and recommends tools that fit — no research needed
**Exit criteria:** 200 CLI installs, 50% of `scan` users adopt at least 1 recommended tool

### P1-001 — Cloudflare Worker API (Phase 1 version — Git-backed)
Status: BACKLOG
Acceptance:
- [ ] Worker reads from GitHub raw content CDN
- [ ] GET /api/v1/tools returns all tools as JSON
- [ ] GET /api/v1/tools/:id returns single tool profile
- [ ] GET /api/v1/tools/match?stack=X&need=Y returns context-aware ranked matches
- [ ] GET /api/v1/versus/:id1/:id2 returns versus page data
- [ ] Rate limiting via KV: 100K req/day (free), returns 429 on exceeded
- [ ] Deployed to production Cloudflare Worker URL

### P1-002 — CLI: `scan` (flagship — reads your project, finds gaps)
Status: BACKLOG
Why first: Vibe coders don't search for tools. They need the tool to come to them.
How it works:
  1. Reads: package.json, requirements.txt, pyproject.toml, .claude/, CLAUDE.md, MCP config
  2. Detects: language, framework, existing tools, Claude Code setup, MCP servers installed
  3. Compares against the AgentRadar dataset: what tools exist for your stack that you don't have?
  4. Filters out: archived tools, tools incompatible with your stack, tools you already have
  5. Outputs 1–3 recommendations with: what it does, why it fits YOUR setup, setup friction score
Acceptance:
- [ ] npm install -g agentRadar installs on macOS, Linux, Windows WSL
- [ ] `agentRadar scan` (no args) — scans current directory, outputs recommendations
- [ ] `agentRadar scan --path /other/project` — scan a different project
- [ ] Detects existing tools: reads package.json deps, pip deps, .claude/skills, MCP config
- [ ] Matches against dataset: category + tags + compatibility
- [ ] Output is opinionated: 1–3 tools max, each with a one-line "why this fits you"
- [ ] Shows setup friction score (f) prominently — vibe coders care most about "how hard is this?"
- [ ] Shows `[ARCHIVED]` / `[STALE]` warnings — never recommend dead tools
- [ ] Flags dependency conflicts: "this requires Python 3.12 but you're on 3.10"
- [ ] `--json` flag for machine-readable output (agents can consume this)
- [ ] vitest suite covers: project detection, matching logic, conflict detection

### P1-003 — CLI: `suggest` (hit a wall — describe your need, get a match)
Status: BACKLOG
Dependencies: P1-002 (scan) — shares the project detection and matching engine
How it works:
  The developer knows what they need but not which tool solves it.
  suggest reads the project context AND the developer's query, then matches.
Acceptance:
- [ ] `agentRadar suggest "browser testing"` — returns top 3 matches compatible with your stack
- [ ] `agentRadar suggest "cheaper alternative to X"` — finds tools in same category, weights cost
- [ ] Context-aware: if you have playwright installed, don't suggest playwright-mcp conflicts
- [ ] `--for solo` / `--for team` / `--for enterprise` — adjusts dimension weights
- [ ] If 2 results are close, shows the versus page instead of picking one
- [ ] Every result shows confidence bracket — never recommend without showing uncertainty

### P1-004 — CLI: `check` (maintenance — are your tools still healthy?)
Status: BACKLOG
Dependencies: P1-002 (scan) — reuses project detection
How it works:
  Run periodically (or add to CI). Scans what you have installed and checks each
  tool against the AgentRadar dataset for staleness, alternatives, and issues.
Acceptance:
- [ ] `agentRadar check` — scans installed tools, reports health
- [ ] Flags archived/stale tools: "browser-mcp last commit Apr 2025 — consider playwright-mcp"
- [ ] Flags better alternatives: "you use X (score 5.2), Y does the same thing (score 7.8)"
- [ ] Only recommends alternatives that are compatible with existing deps (no breaking changes)
- [ ] Exit code 0 = all healthy, exit code 1 = action needed (CI-friendly)
- [ ] `agentRadar check --fix` — outputs commands/config to switch to recommended alternatives
- [ ] Can run as GitHub Action: `.github/workflows/agentRadar-check.yml`

### P1-005 — Claude Code `/radar` plugin (all three commands inside the agent)
Status: BACKLOG
Dependencies: P1-002, P1-003, P1-004
Why this matters: Vibe coders live inside Claude Code. The agent should discover and
set up tools without the developer leaving the session.
Acceptance:
- [ ] `/radar scan` — scans current project, shows recommendations in Claude Code
- [ ] `/radar suggest [need]` — context-aware suggest inside the session
- [ ] `/radar check` — health check inside the session
- [ ] `/radar setup [tool-id]` — agent installs and configures the recommended tool
    (adds to MCP config, updates CLAUDE.md, installs deps — all within the session)
- [ ] Plugin installable via: npm install -g @agentRadar/claude-plugin

### P1-006 — CLI: `show`, `compare` (supporting — for when the dev wants detail)
Status: BACKLOG
Acceptance:
- [ ] `agentRadar show [id]` — full profile with all 6 scores + confidence
- [ ] `agentRadar compare [id1] [id2]` — side-by-side with Quick Answer if versus page exists
- [ ] `--json` flag on all commands
- [ ] CLI works in offline mode with local cache (24-hour TTL)

### P1-007 — Weekly processor automation
Status: BACKLOG
Acceptance:
- [ ] GitHub Actions workflow runs every Monday at 06:00 UTC
- [ ] Score recomputation runs over full dataset
- [ ] Stale status updated for all tools based on last_commit age
- [ ] Versus page staleness detection runs (flags pages with >1.0 score drift)
- [ ] Digest draft committed to data/digests/YYYY-MM-DD-draft.md
- [ ] Buttondown API call sends digest after maintainer approves draft

### P1-008 — Static web UI + Pagefind
Status: BACKLOG
Acceptance:
- [ ] GitHub Pages site builds from YAML + markdown via GitHub Actions
- [ ] All 50 tool profiles have individual pages with canonical URLs
- [ ] All versus pages have individual pages with canonical URLs
- [ ] Pagefind search returns results in <100ms (browser-side)
- [ ] Score freshness badges displayed on tool profile pages
- [ ] Mobile-responsive (test at 375px width)

### P1-009 — Score freshness display (all surfaces)
Status: BACKLOG
Acceptance:
- [ ] CLI, API, and web UI all show freshness_status on every score
- [ ] current: no badge modification
- [ ] aging: [AGING] indicator in amber
- [ ] stale: [STALE] indicator in orange, score visually de-emphasised
- [ ] historical: [HISTORICAL] indicator in grey, tool marked as archived/deprecated
- [ ] API response includes freshness_status field on every score object

### P1-010 — Pro tier: Stripe + watchlist + early digest
Status: BACKLOG
Acceptance:
- [ ] Stripe checkout creates Pro subscription ($9/month beta)
- [ ] Webhook writes Pro API key to Cloudflare KV within 5 minutes of payment
- [ ] agentRadar watch [id] prompts for API key if not set
- [ ] agentRadar watch [id] stores subscription in KV against API key
- [ ] Weekly processor sends email within 24 hours of score change >0.3 for watched tools
- [ ] Pro subscribers receive digest on Saturday (48 hours before public Monday release)
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

Pivot recorded on 2026-03-31: product direction shifted from passive dataset browser to project-aware CLI (scan/suggest/check). AGENTS.md, DECISIONS.md, and sprint_plan.md updated. P0-012 launch messaging updated to lead with CLI vision.

P0-012 remaining blockers are both manual (repo public + Buttondown account). All written deliverables done.