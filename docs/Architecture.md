# AgentRadar — System Architecture
# Version: 1.0 | Owner: Jihoon | Status: APPROVED
# Feed this to Claude for any infrastructure, API, or system design work.

---

## 1. Architecture Philosophy

Three rules govern every architecture decision. When these conflict, they resolve
in this order.

**Rule 1 — Data is Git.**
The YAML dataset is the product. It lives in Git. It is the source of truth. No
database replicates it. No cache is authoritative over it. If the Git repo exists,
the product exists. If the repo is deleted, everything is deleted. This is correct.
It means anyone can fork, clone, and self-host AgentRadar in under 5 minutes.

**Rule 2 — No server until forced.**
Every component that can be serverless, is. Cloudflare Workers instead of FastAPI.
GitHub Actions instead of a cron server. GitHub Pages instead of a web server.
Pagefind instead of a search API. The infrastructure cost at launch is $0/month.
A server is introduced only when a specific, measurable bottleneck cannot be solved
without one.

**Rule 3 — Automate last.**
No process is automated until it has been run manually at least twice and proven
correct. Automation bakes in mistakes permanently. Manual-first means the process
is understood before it is automated.

---

## 2. System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER (Git)                                   │
│                                                                              │
│  agentRadar/data (public GitHub repo)                                        │
│  ├── data/tools/*.yaml          12-field tool profiles                       │
│  ├── data/evaluations/*.yaml    Community evaluation reports                │
│  ├── data/versus/*.md           Head-to-head comparison pages               │
│  ├── data/benchmarks/           Task definitions + gold outputs             │
│  └── data/digests/*.md          Weekly intelligence digest archive          │
│                                                                              │
└──────────────────────────────────────────┬───────────────────────────────────┘
                                           │ Git raw content / nightly D1 sync
                    ┌──────────────────────▼──────────────────────┐
                    │          INTELLIGENCE LAYER                  │
                    │       (GitHub Actions — $0)                  │
                    │                                              │
                    │  ┌────────────────┐ ┌──────────────────┐   │
                    │  │ Daily Crawler  │ │ Weekly Processor │   │
                    │  │ GitHub API     │ │ Score compute    │   │
                    │  │ MCP Registry   │ │ Stale detection  │   │
                    │  │ HuggingFace    │ │ Digest compiler  │   │
                    │  └────────────────┘ └──────────────────┘   │
                    │                                              │
                    │  ┌────────────────┐ ┌──────────────────┐   │
                    │  │ Benchmark      │ │ Ecosystem Sync   │   │
                    │  │ Runner         │ │ (Monthly)        │   │
                    │  │ (Phase 2)      │ │ MCP spec check   │   │
                    │  └────────────────┘ └──────────────────┘   │
                    └──────────────────────┬───────────────────────┘
                                           │
            ┌──────────────────────────────┼─────────────────────────────┐
            │                             │                              │
┌───────────▼────────┐    ┌──────────────▼──────────┐   ┌──────────────▼─────┐
│   API LAYER         │    │   SURFACE LAYER          │   │ NEWSLETTER (P1-007)│
│ Cloudflare Worker   │    │ /radar plugin (PRIMARY)  │   │ Buttondown         │
│ + KV (rate limit)  │    │ GitHub Pages + Pagefind  │   │ ($0 → $9/mo)       │
│ + D1 (search idx)  │    │                          │   │                    │
│ $0 → $5/mo         │    │   agentRadar CLI (CI)    │   │ Weekly digest      │
│                     │    │   VS Code ext (Phase 2)  │   │ Score alerts (Pro) │
│ All public APIs     │    │                          │   │                    │
└─────────────────────┘    └──────────────────────────┘   └────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Data Layer (agentRadar/data)

**Technology:** Git (GitHub public repository)
**Cost:** $0
**Purpose:** Single source of truth. Everything reads from here.

**Directory layout:**
```
data/
  schema.yaml               Schema definition (v1.0) — read before any YAML work
  tools/                    One file per tool: [id].yaml
  evaluations/              One file per evaluation: [tool-id]-[date]-[n].yaml
  versus/                   One file per comparison: [id1]-vs-[id2].md
  benchmarks/
    tasks/                  Benchmark task definitions (T01–T06)
    gold-outputs/           Reference outputs for automated scoring
  digests/
    YYYY-MM-DD.md           Weekly digest archive
```

**Access patterns:**
- GitHub Actions reads/writes during automation
- Cloudflare Worker reads via GitHub raw content CDN
- Community contributes via PR
- D1 database is populated nightly from YAML files (Phase 2+)

**Integrity guarantees:**
- CI validates every YAML against schema.yaml on every PR
- Score history is append-only — no modification of existing entries allowed
- Valid_until field enforced on all versus pages by CI
- CoI field enforced on all evaluations by CI

### 3.2 Intelligence Layer (GitHub Actions)

**Technology:** GitHub Actions + Python 3.12
**Cost:** $0 (public repos have unlimited Actions minutes)
**Repository:** agentRadar/core

**Daily Crawler** (runs 06:00 UTC)
```
Input:  GitHub API, MCP Registry API, HuggingFace API, Anthropic changelog RSS
Output: New tools above triage threshold → PRs to agentRadar/data
        Discord webhook notification for maintainers
Logic:  search GitHub for topics: claude-code, mcp-server, claude-agent, llm-tools
        filter by: stars ≥10, README ≥500 chars, last_commit <180 days
        dedup against existing data/tools/ IDs
        generate YAML stub → open PR with auto-triage metadata
```

**Weekly Processor** (runs Monday 06:00 UTC)
```
Input:  All data/tools/*.yaml, all data/evaluations/*.yaml
Output: Updated scores in tool YAML files (if changed), stale status updates,
        digest draft committed to data/digests/YYYY-MM-DD-draft.md
Logic:  for each tool: recompute scores from evaluations (excluding CoI-flagged)
        compute score_confidence from report count
        check last_commit age → update status if changed
        compare new score to previous → if delta ≥0.01, append to score_history
        compile digest: new tools, movers, stale alerts, spotlight
        send digest via Buttondown API after maintainer review (Phase 1-007+)
```

**Score Computation Rules:**
```python
# These rules are enforced in code, not by prompt
def compute_score(tool_id: str) -> Score | None:
    reports = load_evaluations(tool_id)
    reports = [r for r in reports if r.conflict_of_interest == 'none']
    if len(reports) < 2:
        return None  # Never publish a score with fewer than 2 clean reports
    
    # Score change gate: prevent gaming via single-report spike
    new_scores = average_scores(reports)
    if tool_has_existing_score(tool_id):
        delta = abs(new_scores.overall - existing_score.overall)
        if delta > 0.5 and len(reports) < 3:
            return None  # Hold until 3rd report confirms the change
    
    confidence = classify_confidence(len(reports))  # <3: low, 3-9: medium, 10+: high
    return Score(dimensions=new_scores, confidence=confidence, report_count=len(reports))
```

**Benchmark Runner** (Phase 2 — runs on-demand, triggered by community nomination)
```
Input:  Tool ID + benchmark task IDs to run
Output: Tier 2 benchmark scores appended to tool YAML
Cost:   Claude API tokens — hard-capped at 30% of Pro MRR for the month
Logic:  Spawn Docker container with tool installed
        Execute T01, T02, T04, T06 in sequence
        Measure wall time and token count for each task
        Score output against gold standard in data/benchmarks/gold-outputs/
        Append result to tool YAML with benchmark_version tag
        If benchmark cost would exceed monthly cap: queue for next month
```

### 3.3 API Layer (Cloudflare Worker)

**Technology:** Cloudflare Workers + KV + D1
**Cost:** $0 (free tier) → $5/month (paid tier at >100K req/day sustained)
**Repository:** agentRadar/api

**Architecture:**
```
Request → Cloudflare Edge (334 locations)
         → KV lookup: rate limit check (free: 100K/day, Pro: 500K/day)
         → Route to handler:
              /tools/* → D1 query (Phase 2) OR GitHub raw content (Phase 1)
              /versus/* → GitHub raw content for markdown
              /search → D1 full-text search index
              /suggest → keyword index lookup (no LLM call for basic)
              /crawl/trigger → GitHub Actions dispatch API call
              /webhooks → KV CRUD for Team/Enterprise subscriptions
```

**Phase 1 (Git-backed):** Worker fetches from `raw.githubusercontent.com`. No database.
Zero setup. Works immediately after deployment.

**Phase 2 (D1-backed):** Nightly GitHub Action syncs YAML → D1. Worker queries D1
for search and list endpoints. Raw Git fallback for specific profile fetches.
Migration is transparent to API consumers.

**Rate Limiting (Cloudflare KV):**
```javascript
// Implemented in the Worker — not in any middleware or framework
async function checkRateLimit(apiKey, limit) {
  const key = `ratelimit:${apiKey}:${getDayBucket()}`;
  const count = await env.KV.get(key) ?? 0;
  if (count >= limit) return { allowed: false, remaining: 0 };
  await env.KV.put(key, count + 1, { expirationTtl: 86400 });
  return { allowed: true, remaining: limit - count - 1 };
}
// Free: 100K/day | Pro: 500K/day | Team: 2M/day | Enterprise: custom
```

### 3.4 CLI (agentRadar npm package)

**Technology:** TypeScript + Commander.js + axios
**Cost:** $0 (npm registry is free)
**Repository:** agentRadar/cli

**Architecture decisions:**
- TypeScript strict mode — no `any`, no implicit casts
- All API calls through a single `ApiClient` class — makes mocking trivial
- Local cache (`~/.agentRadar/cache/`) for offline support and speed
- Cache TTL: 24 hours for scores (staleness acceptable), 1 hour for new-tools list
- No global state — every command gets a fresh client

**Command routing:**
```
search → ApiClient.searchTools(query) → format as table
show   → ApiClient.getTool(id) → format as profile
compare → ApiClient.getTool(id1) + getTool(id2) + getVersus(id1,id2) → format
top    → ApiClient.listTools(filters) → format as table (ranked by status + stars, not scores)
new    → ApiClient.listTools({since: N days}) → format
watch  → check Pro key → ApiClient.addWebhook(toolId, email) → confirm
suggest → keyword index (local) → filter by category + tags + stack compatibility → rank by status + stars → format
```

**Offline behaviour:**
```
if (network unavailable AND cache exists):
  serve from cache with [CACHED] indicator
  cache age displayed: "Data from 6 hours ago"
if (network unavailable AND no cache):
  return error: "No network and no local cache. Run 'agentRadar sync' when online."
```

### 3.5 Surface Layer

**Web UI:** GitHub Pages + Pagefind
- Static HTML generated from YAML + markdown by a GitHub Actions build step
- Pagefind indexed at build time — search is fully browser-side, no API call needed
- No JavaScript framework — plain HTML/CSS + minimal JS for Pagefind integration
- Deploy trigger: any push to agentRadar/data that passes CI

**Claude Code Plugin (PRIMARY entry point):** npm package published to `@agentRadar/claude-plugin`
- Commands: `/radar scan`, `/radar suggest`, `/radar check`, `/radar setup [id]`, `/radar show [id]`
- Reads project context (package.json, .claude/, MCP config) before recommending
- Ranking: status + stars + tag overlap — scores shown when present, never required
- `/radar setup` installs and configures the tool inside the session (MCP config, CLAUDE.md, deps)
- Installed once per machine, applies to all Claude Code sessions

**VS Code Extension (Phase 2):**
- Score badges in `mcp.json` and `CLAUDE.md` files (hover for full profile)
- Sidebar panel: searchable tool browser
- Extension calls the same public API as the CLI

---

## 4. Data Flow Diagrams

### Community Evaluation Flow
```
Developer submits evaluation via GitHub issue
  → GitHub issue template validates required fields
  → Maintainer reviews within 48 hours:
      CoI declared? → Flag, do not exclude
      Schema valid? → Merge as data/evaluations/[id].yaml
      Evidence vague? → Request revision before merge
  → Merge triggers GitHub Actions:
      Score recomputed for affected tool
      If score delta ≥0.01: score_history updated
      If score delta ≥0.3 AND Pro watchlist subscriber: email queued
      If score_confidence changes: API cache invalidated
  → Next digest compilation includes score movement
```

### Versus Page Staleness Flow
```
Every Monday (weekly processor):
  For each versus page in data/versus/:
    Load tool_a score and tool_b score from current YAML
    Compare to scores recorded in versus page frontmatter
    If either score changed >1.0: set page status = REVIEW_PENDING
    If page age > 180 days: flag in digest "Needs Review"
    If either tool status = archived: set page status = ARCHIVED
  
  In digest compilation:
    List all REVIEW_PENDING pages as "Needs Human Review"
    
  In API response:
    Include page status in /versus/{id1}/{id2} response
    Frontend renders REVIEW PENDING banner if status ≠ current
```

---

## 5. Architecture Decision Log

### ADR-001: Git YAML over database
**Date:** 2026-03-29 | **Status:** ACCEPTED
**Decision:** Tool profiles, evaluations, and versus pages are stored as YAML/markdown
files in a public Git repository, not in a database.
**Context:** Need a data store for ~2,000 tool profiles. Considering SQLite, Postgres,
or Git-native files.
**Consequences:**
- Positive: Zero cost. Community can submit directly via PR. Fully versionable.
Auditable. Forkable. Works without any infrastructure.
- Negative: Search requires a nightly D1 sync (Phase 2). No real-time updates.
Not suitable for user-generated content at high frequency.
**Alternatives rejected:**
- SQLite: migration complexity, breaks the PR-contribution model
- Postgres: server cost, ops burden, overkill at this scale

### ADR-002: Cloudflare Workers over FastAPI
**Date:** 2026-03-29 | **Status:** ACCEPTED
**Decision:** API is a Cloudflare Worker, not a Python/FastAPI service.
**Context:** Need a public REST API for the CLI and web UI.
**Consequences:**
- Positive: $0/month (free tier covers 100K req/day). No server to manage.
Globally distributed — <50ms response anywhere. Zero deployment complexity.
- Negative: Worker size limit (10MB). No Python. Limited CPU time per request.
**Alternatives rejected:**
- FastAPI on Fly.io: $15–30/month, deployment pipeline, SSL, scaling decisions
- Vercel Functions: vendor lock-in, more complexity than needed

### ADR-003: Pagefind over Typesense for search
**Date:** 2026-03-29 | **Status:** ACCEPTED
**Decision:** Use Pagefind (browser-side static search) for the web UI search.
**Context:** Need full-text search across tool profiles and versus pages.
**Consequences:**
- Positive: Runs entirely in the browser. $0. No server. No index to sync.
Sub-100ms search with zero network latency.
- Negative: Index must be rebuilt at deploy time. Limited to static content.
Cannot support faceted search without custom JS.
**Alternatives rejected:**
- Typesense self-hosted: ops burden, no clear benefit at <5K tools
- Algolia: costs money, external dependency for core functionality

### ADR-004: tdd-guard before Claude review
**Date:** 2026-03-29 | **Status:** ACCEPTED
**Decision:** All generated code passes tdd-guard (automated test enforcement) before
Claude Code reviews it.
**Context:** Claude Code Max is the quality gate. Using it to catch trivially broken
code is expensive and slow.
**Consequences:**
- Positive: Claude only sees code that has already passed mechanical checks.
Claude review sessions are shorter and cheaper. Enforces test discipline.
- Negative: Setup overhead. Requires test infrastructure before writing features.
**Alternatives rejected:**
- Prompt-based test enforcement: ignored under time pressure
- Manual test enforcement: inconsistent, forgets under pressure