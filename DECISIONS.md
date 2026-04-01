# Architectural Decisions Log
# Purpose: prevent re-reasoning the same questions. Claude reads this before every review.
# Format: Date | Decision | Context | Reasoning | Alternatives rejected

---

## HOW TO USE THIS FILE
Before making any architectural decision:
1. Search this file for the topic
2. If found: follow the recorded decision. Do not re-debate it.
3. If not found: make the decision, then add it here immediately.
Claude: if you find yourself reasoning about a topic already in this log, stop and follow the log.

---

## ACTIVE DECISIONS

### Infrastructure
2026-03-29 | API: Cloudflare Workers | Phase 0 | Zero infra cost; $0/month; 100K req/day free tier | FastAPI: requires Fly.io $15/mo + SSL + deployment pipeline + scaling decisions
2026-03-29 | Search: Pagefind | Phase 0 | Browser-side JS library; no server; $0; instant setup | Typesense: self-hosted = ops burden; Algolia: costs money; Elasticsearch: wildly overengineered
2026-03-29 | Data store: Git YAML | Phase 0 | Versionable; diffable; community can submit PRs directly; zero cost | SQLite: adds migration complexity; Postgres: requires a server; JSON: harder to diff

### Schema
2026-03-29 | 12-field maximum | Phase 0 | All 12 fields are reliably available for ≥90% of tools | 30-field schema: 18 fields had no reliable source; fields with null values in 50%+ of profiles are useless
2026-03-29 | score_confidence is mandatory, never null | Phase 0 | Trust requires displaying uncertainty; hiding confidence makes all scores look equally certain | Optional confidence: leads users to over-trust low-sample scores

### Evaluation
2026-03-29 | Minimum 2 reports before publishing score | Phase 0 | 1 report can be a tool author gaming the system | 1 report: too easily gamed; 3 reports: too slow to build dataset
2026-03-29 | CoI exclusion at API layer, not policy layer | Phase 0 | Code-enforced rules cannot be bypassed; policy-only rules will be ignored under pressure | Policy-only: relies on contributor honesty; insufficient for a trust-critical system
2026-04-01 | Drop community evaluation submission flow — scores are curated, not crowd-sourced | Phase 1 | No users exist to submit evaluations. Promoting "community evaluations" when all 150 are seed data is a trust liability. The product is the matching engine (/radar), not the evaluation platform. Scores stay as curated signal. | Keeping eval submission: puts the cart before the horse; invites scrutiny of seed data provenance

### Product
2026-03-31 | `scan` is the flagship — reads your project, finds tool gaps automatically | Phase 1 | Vibe coders don't search for tools. The tool should come to them. scan reads package.json/.claude/MCP config and recommends what's missing | Query-based suggest alone: still requires the dev to know what they need
2026-03-31 | Three lifecycle commands: scan (setup), suggest (mid-project), check (maintenance) | Phase 1 | Maps to how developers actually interact with tools over time, not just at discovery | Single suggest command: misses the maintenance and proactive discovery stages
2026-03-31 | `/radar setup [id]` lets the agent install tools inside Claude Code | Phase 1 | Vibe coders want the agent to handle everything. Recommending without installing is half a solution | Manual setup after recommendation: friction kills adoption
2026-03-31 | Opinionated output: 1–3 recommendations max, not 10 options | Phase 1 | Vibe coders want answers, not choices. More options = more paralysis | Long result lists: recreates the problem we're solving
2026-04-01 | `/radar` plugin is P1-001, not P1-005 | Phase 1 | Claude Code users are already in a session. The plugin requires zero separate install — just add a plugin. Standalone CLI requires discovery + npm install first. Primary users are Claude Code users, so meet them where they are. | CLI-first: forces users to leave their session; adds an install step that most won't complete
2026-04-01 | Scores are a tiebreaker, not a gate | Phase 1 | For scan/check, gap detection + maintenance status + adoption (stars) determine recommendations — not averaged scores. Scores only matter when two tools are equally compatible (suggest tiebreaker). Tools with no scores are immediately useful in scan. | Score-gated tools: a new tool with no scores is invisible to scan, which is wrong — the tool's category and tags are what matter for gap detection
2026-04-01 | scan/check ranking uses: status + stars + tag overlap — not scores | Phase 1 | Status (active/stale/archived) and adoption (GitHub stars, already crawled) are objective signals that don't require any human input. Score is shown when available, ignored when absent. | Score-ranked lists: meaningless for personalized recommendations since a tool's fitness is determined by project compatibility, not average community rating

### API / Worker
2026-04-01 | tools-index.json is the plugin's data source — not individual YAMLs | Phase 1 | One HTTP fetch gives the plugin all 50 tools for scan/suggest/check. Fetching 50 individual YAMLs per command would be 50× slower with no benefit. | Per-profile fetches: high latency, rate-limit risk, no caching benefit inside a single session
2026-04-01 | ~~MVP ranking proxy: composite score~~ → SUPERSEDED by style-adaptive fitBonus | Phase 1 | See decision below (style-adaptive ranking)
2026-04-01 | Style-adaptive ranking: fitBonus replaces compositeBonus | Phase 1 | Vibe coders (few deps, no agent patterns) need low-friction tools → bonus for high f_score. Agent architects (3+ MCP servers, agent keywords) need composable tools → bonus for high x_score. Balanced users get both. A newer tool with fewer stars but better fit for the user's style beats an established tool that doesn't fit. | compositeBonus: rewards popularity, not fit; same recommendation for vibe coders and agent architects
2026-04-01 | Intent signals extracted from markdown when no deps exist | Phase 1 | Scan reads PRD.md, README.md, CLAUDE.md to understand what the developer is building. Extracts keywords matching the 136-tag vocabulary + synonym expansion. Without this, empty projects get generic top-3-by-category — useless at the highest-value moment (project kickoff). | Deps-only detection: fails for greenfield projects with just a PRD
2026-04-01 | inferStyle classifies users as vibe/agent/balanced from project structure | Phase 1 | 3+ MCP servers or claude commands or agent patterns in CLAUDE.md → agent. 0 deps or < 5 deps → vibe. Otherwise → balanced. Style is inferred, not asked — the project structure reveals how the developer works. | Asking the user: adds friction; most users don't know which style they are
2026-04-01 | tools-index.json includes f_score and x_score (not just composite) | Phase 1 | fitBonus needs per-tool f and x dimension scores to personalize ranking. Adding them to the index avoids fetching full YAML profiles. Index stays compact (2 fields per tool). | Fetching full profiles: 50 HTTP requests per scan, no caching benefit
2026-04-01 | Single radar.md routes all subcommands via $ARGUMENTS | Phase 1 | One file = one install, one update surface, one place to read. Sub-command routing is trivial in a prompt. | Separate md files per subcommand: more install surface, more drift risk if one file gets stale
2026-04-01 | Worker ranking logic extracted to ranking.ts — shared with tests | Phase 1 | Pure TypeScript with no Worker API dependencies = fully unit-testable. radar.md prompt and ranking.ts must stay in sync when logic changes. | Inline in index.ts: untestable; prompt-only: no authoritative server-side implementation
2026-04-01 | /api/v1/tools/match route checked before /api/v1/tools/:id | Phase 1 | "match" is a valid string that would match the :id pattern — literal path check must come first to prevent accidental routing. | Regex-only routing: "match" would be treated as a tool id
2026-04-01 | CLI matching threshold is score >= 1 (any token overlap) | Phase 1 | Single-word package names (e.g. "playwright", "@anthropic-ai/sdk") must match their dataset counterpart on one token. Threshold >= 2 was too strict and produced false negatives. | Exact match only: too brittle for npm scoped packages and shortened names
2026-04-01 | Weekly processor fetches pushed_at live from GitHub API — no last_commit schema field | Phase 1 | Schema stays at 12 fields (Phase 0 decision preserved). The processor has GH_TOKEN in CI; fetching live is always accurate and avoids a stale cached field. | Adding last_commit to schema: requires RFC + re-crawl of all 50 profiles; adds a 13th field that ages instantly
2026-04-01 | Static site generator is a Python script (no SSG framework) | Phase 1 | Zero new dependencies. pyyaml already installed. The output is 50+3 HTML files — a framework would be massive overkill. Pagefind handles search client-side. | Jekyll/Hugo/Eleventy: adds Ruby/Go/Node dep + config + theme; build time scales with framework overhead
2026-04-01 | Stripe for Pro payments — not Paddle or LemonSqueezy | Phase 1 | Stripe has the best Cloudflare Workers integration (no SDK needed, raw API over fetch). Webhook signature verification uses only Web Crypto API (available in Workers). | Paddle: opaque pricing; LemonSqueezy: smaller ecosystem + less Workers tooling
2026-04-01 | Pro API keys stored in Cloudflare KV (PRO_KEYS namespace) — not JWT | Phase 1 | KV lookup is O(1), revocable instantly, works in Workers without external DB. JWTs can't be revoked without a blocklist (which needs storage anyway). | JWT: irrevocable without blocklist; DB: requires external server
2026-04-01 | CLI stores Pro API key in ~/.agentRadar/config.json | Phase 1 | Simple JSON file, same pattern as npm/gh CLI config. User can inspect and edit it. | Keychain/OS credential store: adds OS-specific code; env var: lost on shell restart

### Tooling
2026-03-29 | tdd-guard enforces tests before Claude review | Phase 0 | Eliminates an entire class of Claude review failures; saves Claude tokens on trivially broken code | Manual test enforcement: forgets; prompt-based enforcement: ignored when under time pressure
2026-03-31 | claude-context-mode deferred — package does not exist on npm | Phase 0 | Originally planned for 98% context reduction; not available as published package | Will revisit when a real context compression tool is available

---

## DEFERRED DECISIONS (do not implement — document why)
VS Code extension | Deferred Phase 2 | CLI must prove the data model first
Automated benchmark runner | Deferred Phase 2 | Community reports must establish baseline first
Enterprise tier | Deferred Phase 4 | Need 10+ Team accounts as reference customers first
Multi-agent orchestration framework | Deferred Phase 3 | Simpler Claude Code subagents sufficient until then
