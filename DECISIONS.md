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
2026-03-31 | `scan` is the flagship — reads your project, finds tool gaps automatically | Phase 1 | Vibe coders don't search for tools. The tool should come to them. scan reads package.json/.claude/MCP config and recommends what's missing | Query-based suggest alone: still requires the dev to know what they need
2026-03-31 | Three lifecycle commands: scan (setup), suggest (mid-project), check (maintenance) | Phase 1 | Maps to how developers actually interact with tools over time, not just at discovery | Single suggest command: misses the maintenance and proactive discovery stages
2026-03-31 | `/radar setup [id]` lets the agent install tools inside Claude Code | Phase 1 | Vibe coders want the agent to handle everything. Recommending without installing is half a solution | Manual setup after recommendation: friction kills adoption
2026-03-31 | Opinionated output: 1–3 recommendations max, not 10 options | Phase 1 | Vibe coders want answers, not choices. More options = more paralysis | Long result lists: recreates the problem we're solving

### Tooling
2026-03-29 | tdd-guard enforces tests before Claude review | Phase 0 | Eliminates an entire class of Claude review failures; saves Claude tokens on trivially broken code | Manual test enforcement: forgets; prompt-based enforcement: ignored when under time pressure
2026-03-31 | claude-context-mode deferred — package does not exist on npm | Phase 0 | Originally planned for 98% context reduction; not available as published package | Will revisit when a real context compression tool is available

---

## DEFERRED DECISIONS (do not implement — document why)
VS Code extension | Deferred Phase 2 | CLI must prove the data model first
Automated benchmark runner | Deferred Phase 2 | Community reports must establish baseline first
Enterprise tier | Deferred Phase 4 | Need 10+ Team accounts as reference customers first
Multi-agent orchestration framework | Deferred Phase 3 | Simpler Claude Code subagents sufficient until then
