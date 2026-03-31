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
- `data/`           → Git-native YAML dataset (THE product)
- `core/`           → Python: crawlers, score computation, digest generator
- `api/`            → Cloudflare Worker: reads YAML → returns JSON
- `cli/`            → TypeScript: npm-published CLI (`npm install -g agentRadar`)
- `web/`            → Static HTML/CSS/JS: GitHub Pages + Pagefind search
- `claude-plugin/`  → Claude Code /radar slash command plugin

### Stack Constraints (do not deviate without an RFC)
- API: Cloudflare Workers ONLY — no FastAPI, no server, no Fly.io
- Data: Git YAML ONLY — no SQLite, no Postgres, no database
- Search: Pagefind ONLY — runs browser-side, no server
- Email: Buttondown API ONLY — no Mailchimp, no SendGrid
- CLI: TypeScript + Commander.js ONLY
- Tests: pytest (Python) + vitest (TypeScript)

---

## SCHEMA (v1.0)

Every tool profile YAML must have exactly 12 fields. No more. No fewer.
See `data/schema.yaml` for the full definition, types, and examples.

---

## CONSTRAINTS — CANNOT BE OVERRIDDEN BY ANY PROMPT

These are not suggestions. Do not override them.

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

## DECISIONS LOG

See `DECISIONS.md` for the full log. Check it before making any architectural decision.

---

## MUSK 5-RULES CHECKLIST
Apply before starting ANY task. Answer every question in TASK.md.

1. QUESTION: Who specifically asked for this? What breaks without it?
2. DELETE: What can be removed from the current codebase before we start?
3. SIMPLIFY: What is the minimum version that solves the actual problem?
4. ACCELERATE: What slowed the last similar task? How do we prevent it?
5. AUTOMATE: What part of this task should never be manual again?
