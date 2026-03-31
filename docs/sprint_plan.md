# AgentRadar — Sprint Plan & Ticket Backlog
# Version: 1.0 | Owner: Jihoon | Status: ACTIVE
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
Status: DONE (2026-03-31)
Tools profiled (actual repos):
  - gh-github-mcp-server → github/github-mcp-server (active)
  - gh-mcp-filesystem → modelcontextprotocol/servers/src/filesystem (active)
  - gh-microsoft-playwright-mcp → microsoft/playwright-mcp (active)
  - gh-tavily-mcp → tavily-ai/tavily-mcp (active)
  - gh-korotovsky-slack-mcp → korotovsky/slack-mcp-server (active)
  - gh-atlassian-mcp-server → atlassian/atlassian-mcp-server (active)
  - gh-browsermcp-mcp → BrowserMCP/mcp (archived — last push Apr 2025)
  - gh-mcp-memory → modelcontextprotocol/servers/src/memory (active)
  - gh-makenotion-notion-mcp → makenotion/notion-mcp-server (active)
  - gh-jerhadf-linear-mcp → jerhadf/linear-mcp-server (archived — last push May 2025)
Acceptance:
- [x] All 10 YAML files exist in data/tools/
- [x] All 10 pass validate_yaml.py with zero errors
- [x] Scores are null on all 10 (no evaluations yet)
- [x] Status computed from actual last_commit date for each tool
- [x] Claude Code review: PASS

### P0-004 — Batch 2: 10 Claude Code Plugin/Orchestration profiles
Status: DONE (2026-03-31)
Tools profiled (actual repos — pivots noted):
  - gh-wshobson-agents → wshobson/agents (active, 32.6k stars)
  - gh-avifenesh-agentsys → avifenesh/AgentSys (active)
  - gh-gsd-build-get-shit-done → gsd-build/get-shit-done [PIVOT: plan said taches-dev/claude-code-resources — resolved to actual TÂCHES repo, 45.6k stars]
  - gh-gemini-cli-conductor → gemini-cli-extensions/conductor [PIVOT: plan said "claude-code-workflows repo" — resolved to original Conductor source, 3.3k stars]
  - gh-ayoubben18-ab-method → ayoubben18/ab-method (stale, 156 stars)
  - gh-ranaroussi-cc-bridge → ranaroussi/cc-bridge [PIVOT: plan said "Claude Code PM" — no PM tool found; used Ran Aroussi's most prominent Claude Code repo]
  - gh-jeffallan-claude-skills → Jeffallan/claude-skills (active, 7.5k stars)
  - gh-neolab-context-engineering-kit → NeoLabHQ/context-engineering-kit (active, 735 stars)
  - gh-undeadlist-claude-code-agents → undeadlist/claude-code-agents (active, 102 stars)
  - gh-ryanmac-code-conductor → ryanmac/code-conductor [PIVOT: plan said "ClaudoPro Directory (ghost)" — unverifiable; substituted verified alternative in same category]
Acceptance:
- [x] All 10 YAML files exist in data/tools/
- [x] All 10 pass validate_yaml.py with zero errors
- [x] Scores are null on all 10 (no evaluations yet)
- [x] Status computed from actual last_commit date for each tool
- [x] Claude Code review: PASS

### P0-005 — Batch 3: 10 Orchestration + CLAUDE.md Framework profiles
Status: DONE (2026-03-31)
Tools profiled (actual repos):
  - gh-crewai-crewai → crewAIInc/crewAI (active, 47.7k stars)
  - gh-microsoft-autogen → microsoft/autogen (active, 56.5k stars)
  - gh-langchain-langgraph → langchain-ai/langgraph (active, 28k stars)
  - gh-ruvnet-ruflo → ruvnet/ruflo (active, 28.8k stars, prev. claude-flow)
  - gh-openai-swarm → openai/swarm (archived, 21.3k stars)
  - gh-doriandarko-claude-engineer → Doriandarko/claude-engineer (archived, 11.2k stars)
  - gh-josix-awesome-claude-md → josix/awesome-claude-md (active, 184 stars)
  - gh-abhishekray07-claude-md-templates → abhishekray07/claude-md-templates (active, 116 stars)
  - gh-jrenaldi79-harness-engineering → jrenaldi79/harness-engineering (active, 51 stars)
  - gh-ithiria894-claude-code-workflows → ithiria894/awesome-claude-code-workflows (active, 59 stars)
Acceptance:
- [x] All 10 YAML files exist in data/tools/
- [x] All 10 pass validate_yaml.py with zero errors
- [x] Scores are null on all 10 (no evaluations yet)
- [x] Status computed from actual pushed_at via gh api
- [x] Claude Code review: PASS

### P0-006 — Batch 4: 10 Prompt Library + SDK Pattern profiles
Status: BACKLOG
Agent assignment: 5 Gemini Flash agents in parallel
Coverage: 5 prompt libraries + 5 SDK patterns
Acceptance: Same as P0-003

### P0-007 — Batch 5: 10 Evaluation + Complementary Tool profiles
Status: BACKLOG
Agent assignment: 5 Gemini Flash agents in parallel
Coverage: 5 eval/observability tools + 5 complementary tools (Playwright, E2B, Modal, Tavily extended, one more)
Acceptance: Same as P0-003

### P0-008 — 150 seed evaluations (3 per tool)
Status: BACKLOG
Note: These are founder-written evaluations. Each must be based on actual testing or
documented community reports. Do not invent evaluation data.
Agent assignment: Gemini Pro (not Flash — quality matters here)
Process: For each of the 50 tools, write 3 evaluations with different reporter_role values.
Acceptance:
- [ ] 150 YAML files in data/evaluations/
- [ ] All pass validate_evaluation.py
- [ ] No tool has a published score — evaluations exist but score computation runs after
- [ ] Claude review: evidence strings are specific, not generic

### P0-009 — Score computation — first run
Status: BACKLOG
Dependencies: P0-003 through P0-008 must be DONE
Acceptance:
- [ ] score_computation.py script runs without errors on full dataset
- [ ] All tools with 2+ clean evaluations have scores published
- [ ] All published scores include confidence level
- [ ] Score history entries created for all tools with published scores
- [ ] No tool has a score published from a CoI-flagged evaluation

### P0-010 — First 3 versus pages
Status: BACKLOG
Dependencies: P0-009 must be DONE
Target pairs (highest community interest):
  1. wshobson/agents vs AgentSys (orchestration: most common comparison)
  2. Playwright MCP vs Browser MCP (MCP: most searched comparison)
  3. TÂCHES vs Context Engineering Kit (CLAUDE.md: second most common)
Acceptance:
- [ ] All 3 versus pages pass validate_versus.py
- [ ] All 3 have valid_until set to 90 days from creation date
- [ ] All 3 have genuine "Neither when" bullets (not throwaway)
- [ ] All 3 reflect only data from actual evaluations (no invented verdicts)
- [ ] Claude review: PASS on anti-bias charter compliance

### P0-011 — Daily crawler implementation
Status: BACKLOG
Acceptance:
- [ ] GitHub Actions workflow runs daily at 06:00 UTC
- [ ] Crawls GitHub for topics: claude-code, mcp-server, claude-agent, llm-tools
- [ ] Auto-triage script runs on every new discovery
- [ ] Tools above threshold (4/5 checks) generate a PR to data/tools/
- [ ] Tools below threshold are logged but not added
- [ ] No false positives in first 7 days (verify manually)

### P0-012 — Launch: Make data repo public + newsletter
Status: BACKLOG
Dependencies: All P0 tickets DONE
Acceptance:
- [ ] agentRadar/data repo made public
- [ ] README.md explains the project, contribution process, and schema
- [ ] Buttondown account created with AgentRadar branding
- [ ] First digest written and sent manually
- [ ] Posted in Anthropic Discord #claude-code
- [ ] Posted in Reddit r/ClaudeAI
- [ ] Dev.to article published

---

## PHASE 1 — SIGNAL
**Goal:** CLI, Claude Code plugin, static web UI, Pro tier
**Exit criteria:** 200 CLI installs, 150 subscribers, 10 Pro subscribers

### P1-001 — Cloudflare Worker API (Phase 1 version — Git-backed)
Status: BACKLOG
Acceptance:
- [ ] Worker reads from GitHub raw content CDN
- [ ] GET /api/v1/tools returns all tools as JSON
- [ ] GET /api/v1/tools/:id returns single tool profile
- [ ] GET /api/v1/versus/:id1/:id2 returns versus page data
- [ ] Rate limiting via KV: 100K req/day (free), returns 429 on exceeded
- [ ] Deployed to production Cloudflare Worker URL
- [ ] Latency P95 <200ms from Melbourne (test location)

### P1-002 — CLI v0.1: search, show, compare, top
Status: BACKLOG
Acceptance:
- [ ] npm install -g agentRadar installs on macOS, Linux, Windows WSL
- [ ] agentRadar search [query] returns top 10 results in <2s
- [ ] agentRadar show [id] returns full profile with all 6 dimension scores
- [ ] agentRadar compare [id1] [id2] returns side-by-side with Quick Answer if versus page exists
- [ ] agentRadar top --category [c] --min-score [n] returns filtered ranked list
- [ ] Every score output includes confidence bracket [HIGH/MED/LOW]
- [ ] Stale/Aging scores show a warning indicator
- [ ] CLI works in offline mode with local cache (24-hour TTL)
- [ ] All commands have --json flag for machine-readable output
- [ ] vitest suite covers all commands: happy path + error path

### P1-003 — CLI v0.1: new and digest commands
Status: BACKLOG
Acceptance:
- [ ] agentRadar new --since [N]d returns tools discovered in last N days
- [ ] agentRadar digest returns latest weekly digest formatted for terminal
- [ ] agentRadar digest prompts for newsletter subscription after display

### P1-004 — Claude Code /radar plugin
Status: BACKLOG
Acceptance:
- [ ] /radar search [query] works inside Claude Code session
- [ ] /radar show [id] works inside Claude Code session
- [ ] /radar compare [id1] [id2] works inside Claude Code session
- [ ] /radar top [category] works inside Claude Code session
- [ ] Plugin installable via: npm install -g @agentRadar/claude-plugin
- [ ] Install instructions documented in agentRadar/claude-plugin/README.md

### P1-005 — Weekly processor automation
Status: BACKLOG
Acceptance:
- [ ] GitHub Actions workflow runs every Monday at 06:00 UTC
- [ ] Score recomputation runs over full dataset
- [ ] Stale status updated for all tools based on last_commit age
- [ ] Versus page staleness detection runs (flags pages with >1.0 score drift)
- [ ] Digest draft committed to data/digests/YYYY-MM-DD-draft.md
- [ ] Buttondown API call sends digest after maintainer approves draft

### P1-006 — Static web UI + Pagefind
Status: BACKLOG
Acceptance:
- [ ] GitHub Pages site builds from YAML + markdown via GitHub Actions
- [ ] All 50 tool profiles have individual pages with canonical URLs
- [ ] All versus pages have individual pages with canonical URLs
- [ ] Pagefind search returns results in <100ms (browser-side)
- [ ] Score freshness badges displayed on tool profile pages
- [ ] Mobile-responsive (test at 375px width)

### P1-007 — Score freshness display (all surfaces)
Status: BACKLOG
Acceptance:
- [ ] CLI, API, and web UI all show freshness_status on every score
- [ ] current: no badge modification
- [ ] aging: [AGING] indicator in amber
- [ ] stale: [STALE] indicator in orange, score visually de-emphasised
- [ ] historical: [HISTORICAL] indicator in grey, tool marked as archived/deprecated
- [ ] API response includes freshness_status field on every score object

### P1-008 — Pro tier: Stripe + watchlist + early digest
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
### P3-006 — agentRadar suggest command
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
### P5-003 — "For My Situation" adaptive scoring

---

## Velocity Notes

Expected delivery rate (solo founder, ~20 hrs/week):
- P0 tickets: 2–3 tickets per week (data work is labour-intensive)
- P1 tickets: 1–2 tickets per week (more technical, but tools help)
- P2+ tickets: depends on Phase 1 learnings

### Actual velocity log
| Date | Tickets completed | Notes |
|------|-------------------|-------|
| 2026-03-31 | P0-003, P0-004 | 2 batches (20 profiles) in one session with Claude Code |

Track actual velocity in tasks/completed/ and adjust here quarterly.