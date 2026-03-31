# AgentRadar Agent Constitution
# Version: 1.2 | Updated: 2026-03-31

## PRODUCT DIRECTION

AgentRadar reads your project and tells you what tools will help — without you asking.

Three commands map to the developer lifecycle:

1. **`agentRadar scan`** (starting a project or anytime)
   Reads package.json, requirements.txt, .claude/, CLAUDE.md, MCP config.
   Detects your stack, what tools you already use, and what gaps exist.
   Outputs: "You have X, you're missing Y, here's what fits your setup."

2. **`agentRadar suggest`** (hit a wall or want to improve)
   Context-aware — reads your project first, then matches.
   "I need browser testing" → checks your stack → recommends only tools compatible
   with what you already have. Shows setup friction score and dependency conflicts.

3. **`agentRadar check`** (maintenance — run periodically or via CI)
   Scans your installed tools against the dataset.
   Flags: stale tools, archived repos, better alternatives that won't break your setup.
   "Your browser-mcp is archived. playwright-mcp is actively maintained and compatible."

Inside Claude Code, `/radar` does all three — the agent can scan, suggest, and
set up tools without the developer leaving their session.

The tool should be opinionated. Show 1–3 recommendations with reasons, not 10 options.
Vibe coders want answers, not choices.

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
- API: Cloudflare Workers — no FastAPI, no server, no Fly.io
- Data: Git YAML — no SQLite, no Postgres, no database
- Search: Pagefind — browser-side, no server
- Email: Buttondown API — no Mailchimp, no SendGrid
- CLI: TypeScript + Commander.js
- Tests: pytest (Python) + vitest (TypeScript)

---

## SCHEMA (v1.0)

Every tool profile YAML must conform to `data/schema.yaml`. The validators in `scripts/` enforce this automatically — don't duplicate those checks manually.

---

## CODE STRUCTURE

- **One responsibility per file.** A file should be describable in one sentence without "and".
- **Split when a file serves multiple callers for different reasons** — not at an arbitrary line count.
- **Name by domain** — `crawlers/github.py`, `scores/compute.py`, not `utils.py` or `helpers.ts`.
- **No circular dependencies** between modules. Imports flow one direction.
- **When in doubt, keep it together.** A cohesive long file beats scattered fragments that constantly cross-import.

---

## CONSTRAINTS

- No new npm/pip dependency without checking if an existing one covers it.
- Tool authors cannot evaluate their own tools. CoI field is mandatory on every eval.
- Score changes >±0.5 require 3+ independent reports.
- Do not generate mock or placeholder evaluation scores — scores come from community reports only.
- Do not use `any` type in TypeScript.
- Do not catch errors silently — every error is logged or surfaced.

---

## FORBIDDEN PATTERNS

Added when something actually goes wrong. Each entry must include what happened.

_(Empty — nothing has gone wrong yet. Add entries as real issues arise.)_

---

## DECISIONS LOG

See `DECISIONS.md` for the full log. Check it before making any architectural decision.
