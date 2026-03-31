# AgentRadar Agent Constitution
# Version: 1.0 | Created: 2026-03-31
# READ THIS BEFORE EVERY ACTION. EVERY RULE HERE EXISTS BECAUSE SOMETHING WENT WRONG.

---

## MODEL ROUTING — READ FIRST

Every task must be assigned to the cheapest model that can handle it adequately.
Never use a more expensive model when a cheaper one is sufficient.

| Task Type | Model | Cost |
|---|---|---|
| Generate YAML tool profiles | Gemini 3 Flash (Antigravity) | Free |
| Write Python scripts and tests | Gemini 3 Flash | Free |
| Write TypeScript / CLI code | Gemini 3 Flash | Free |
| Write markdown (versus pages, docs) | Gemini 3 Flash | Free |
| Multi-file parallel feature work | Gemini 3.1 Pro (Antigravity) | Free |
| Complex debugging across files | Gemini 3.1 Pro | Free |
| Browser testing / UI verification | Gemini 3.1 Pro | Free |
| Schema design decisions | Claude Opus (Claude Code Max) | $$ |
| Review Gemini output for correctness | Claude Opus | $$ |
| Quality gate review | Claude Opus | $$ |
| Architecture disputes | Claude Opus | $$ |
| Update AGENTS.md / CLAUDE.md | Claude Opus | $$ |

TARGET RATIO: 85% Gemini (free) / 15% Claude (paid).
Claude Code Max is the quality control budget, not the generation budget.

---

## PROJECT ARCHITECTURE

### Repository Layout
- `agentRadar/data/`     → Git-native YAML dataset (THE product — all free)
- `agentRadar/core/`     → Python: crawlers, score computation, digest generator
- `agentRadar/api/`      → Cloudflare Worker: reads YAML → returns JSON
- `agentRadar/cli/`      → TypeScript: npm-published CLI (`npm install -g agentRadar`)
- `agentRadar/web/`      → Static HTML/CSS/JS: GitHub Pages + Pagefind search
- `agentRadar/claude-plugin/` → Claude Code /radar slash command plugin

### Stack Constraints (do not deviate without an RFC)
- API: Cloudflare Workers ONLY — no FastAPI, no server, no Fly.io
- Data: Git YAML ONLY — no SQLite, no Postgres, no database
- Search: Pagefind ONLY — runs browser-side, no server
- Email: Buttondown API ONLY — no Mailchimp, no SendGrid
- CLI: TypeScript + Commander.js ONLY
- Tests: pytest (Python) + vitest (TypeScript)

---

## AGENTRADA SCHEMA (v1.0) — 12 FIELDS EXACTLY

Every tool profile YAML must have exactly these 12 fields. No more. No fewer.
See `data/schema.yaml` for type definitions and examples.

1. id — string, derived from source URL, stable forever
2. name — string, display name
3. source_url — string, canonical link
4. category — enum (9 values: see schema.yaml)
5. pricing — enum: free | freemium | paid
6. license — string
7. status — enum: active | stale | archived
8. scores — object with keys: p, q, c, r, x, f (each 0–10 or null)
9. score_confidence — enum: low | medium | high | null
10. score_history — array of {date, overall, benchmark_version}
11. tags — string array
12. versus_refs — array of {id, verdict_short, valid_until}

---

## CONSTRAINTS — CANNOT BE OVERRIDDEN BY ANY PROMPT

These rules are enforced by tdd-guard and validated by agnix.
They are not suggestions. Do not override them.

- No file exceeds 200 lines. Split it.
- No new npm/pip dependency without checking if an existing one covers it.
- Every new function has a test before the PR is opened.
- YAML profiles: exactly 12 fields. Reject profiles with more or fewer.
- Versus pages: exactly 5 sections. Reject pages missing any section.
- Score confidence is ALWAYS shown. No score without [HIGH/MED/LOW] bracket.
- valid_until field is ALWAYS set on versus pages. Reject pages without it.
- Tool authors cannot evaluate their own tools. CoI field is mandatory on every eval.
- Score changes >±0.5 require 3+ independent reports. Enforce at computation layer.

---

## FORBIDDEN PATTERNS

Do not implement these under any circumstances.
Each entry was added because an agent tried it and it caused a problem.

- Do not create a database — data is Git YAML
- Do not add a server — use Cloudflare Workers
- Do not add authentication to public API endpoints
- Do not generate mock or placeholder evaluation scores
- Do not expand scope beyond the current TASK.md ticket
- Do not load the entire data/tools/ directory into context — use compression
- Do not use `any` type in TypeScript
- Do not catch errors silently — every error is logged or surfaced

---

## DECISIONS LOG — DO NOT RE-REASON THESE

Before making an architectural decision, check this log.
If the decision is already here, follow the recorded choice. Do not re-debate it.
When Claude makes a new decision, add it here immediately.

### Infrastructure
- 2026-03-29 | API: Cloudflare Workers (not FastAPI) | Zero infra cost, $0/month free tier, 100K req/day | FastAPI requires Fly.io + SSL + deployment pipeline
- 2026-03-29 | Search: Pagefind (not Typesense) | Browser-side, no server, $0 | Typesense self-hosted = ops burden with no benefit at <5K tools
- 2026-03-29 | Data: Git YAML (not database) | Versionable, diffable, community can PR directly | SQLite adds migration overhead and removes community contribution model

### Schema
- 2026-03-29 | 12 fields maximum | Only fields reliably available for 90%+ of tools | v0 schema had 18 unreliable fields
- 2026-03-29 | score_confidence mandatory | Trust requires showing uncertainty | Optional confidence makes all scores look equally certain

### Evaluation
- 2026-03-29 | Min 2 reports before publishing score | 1 report can be a tool author gaming | Lower threshold destroys trustworthiness
- 2026-03-29 | CoI exclusion is structural (at API layer, not policy) | Policy-only enforcement will be ignored | Relying on contributor honesty alone is insufficient

---

## MUSK 5-RULES CHECKLIST
Apply before starting ANY task. Answer every question in TASK.md.

1. QUESTION: Who specifically asked for this? What breaks without it?
2. DELETE: What can be removed from the current codebase before we start?
3. SIMPLIFY: What is the minimum version that solves the actual problem?
4. ACCELERATE: What slowed the last similar task? How do we prevent it?
5. AUTOMATE: What part of this task should never be manual again?
