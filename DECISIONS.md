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

### Product
2026-03-31 | `suggest` is the flagship command, not `top`/`search` | Phase 1 | AgentRadar's value is matching tools to developer needs, not ranking globally. Leaderboards are commodity — contextual matching is the differentiator | Leaderboard-first: makes us another awesome-list with numbers
2026-03-31 | `suggest` v1 uses structured filtering, no AI | Phase 1 | Filter by constraints (category, pricing, status) → tag matching → dimension-weighted ranking. Existing schema supports this | AI-powered matching: premature — need usage data first to know what patterns emerge

### Tooling
2026-03-29 | tdd-guard enforces tests before Claude review | Phase 0 | Eliminates an entire class of Claude review failures; saves Claude tokens on trivially broken code | Manual test enforcement: forgets; prompt-based enforcement: ignored when under time pressure
2026-03-31 | claude-context-mode deferred — package does not exist on npm | Phase 0 | Originally planned for 98% context reduction; not available as published package | Will revisit when a real context compression tool is available

### Data Curation (added 2026-03-31 after P0-003 + P0-004)
2026-03-31 | GitHub API `pushed_at` is the canonical source for `status` | P0-003 | Only live data prevents silently wrong active/archived flags; Browser MCP and Linear MCP would have been wrong without it | Manual estimation: unacceptably error-prone at scale
2026-03-31 | Sprint plan tool names are directional, not exact | P0-004 | Four of ten P0-004 entries resolved to different repos than listed: TÂCHES → gsd-build/get-shit-done; Conductor → gemini-cli-extensions/conductor; ClaudoPro → unverifiable (substituted ryanmac/code-conductor); Claude Code PM (Ran Aroussi) → ranaroussi/cc-bridge | Always GitHub-search first; never assume the listed name is the canonical repo
2026-03-31 | Unverifiable tools are substituted, never invented | P0-004 | ClaudoPro Directory could not be found on GitHub; inventing a profile would violate the no-invented-data constraint | Leaving a gap: breaks the batch-of-10 contract; using invented data: violates core trust guarantee. Substitute rule: same category, verified repo, note pivot in commit and sprint_plan.md
2026-03-31 | `orchestration` for general frameworks, `claude-plugin` for Claude Code–native only | P0-005 | CrewAI, AutoGen, LangGraph support Claude but were not built for it; mixing them into claude-plugin pollutes search and versus page matching | One combined category: breaks discovery — users searching for Claude Code plugins don't want general LLM frameworks
2026-03-31 | GitHub NOASSERTION license stored as null | P0-006 | GitHub returns NOASSERTION when it detects a license file but cannot match a known SPDX ID; null is the correct schema value — do not invent an SPDX string | Storing "NOASSERTION" as-is: not a valid SPDX string, breaks any downstream license filtering
2026-03-31 | Versus pages are markdown files, not YAML | P0-010 | validate_versus.py checks for markdown sections (## Quick Answer, ## Score Comparison, etc.) and YAML frontmatter valid_until field; the format is `.md` with frontmatter, stored in data/versus/ | YAML-only: harder to read and write for human contributors; markdown renders directly on GitHub

---

## DEFERRED DECISIONS (do not implement — document why)
VS Code extension | Deferred Phase 2 | CLI must prove the data model first
Automated benchmark runner | Deferred Phase 2 | Community reports must establish baseline first
Enterprise tier | Deferred Phase 4 | Need 10+ Team accounts as reference customers first
Multi-agent orchestration framework | Deferred Phase 3 | Simpler Claude Code subagents sufficient until then
