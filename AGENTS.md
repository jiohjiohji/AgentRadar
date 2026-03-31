# AgentRadar Agent Constitution
# Version: 1.3 | Updated: 2026-04-01

## PRODUCT DIRECTION

AgentRadar reads your project and tells you what tools will help — without you asking.

**Primary entry point: `/radar` inside Claude Code.**
Claude Code users are already in an agentic session. The plugin requires no separate install.
`/radar setup [id]` installs and configures the recommended tool without leaving the session.
This is the highest-demand path — meet developers where they are.

**Secondary entry point: standalone CLI for non-session contexts (CI, onboarding).**

Three commands map to the developer lifecycle:

1. **`scan`** (starting a project or anytime)
   Reads package.json, requirements.txt, .claude/, CLAUDE.md, MCP config.
   Detects your stack, what tools you already use, and what gaps exist.
   Outputs: "You have X, you're missing Y, here's what fits your setup."
   Ranking: status (active/stale/archived) + tag overlap + composite score (proxy until stars in schema).

2. **`suggest`** (hit a wall or want to improve)
   Context-aware — reads your project first, then matches your query.
   "I need browser testing" → checks your stack → recommends compatible tools only.
   Scores used only as tiebreaker when two tools are equally compatible.

3. **`check`** (maintenance — run periodically or via CI)
   Scans your installed tools against the dataset.
   Flags: archived repos, stale tools, better alternatives that won't break your setup.
   CI-friendly: exit code 0 = healthy, exit code 1 = action needed.

**On community evaluations:**
Scores are optional signal, not a gate. A tool with no evaluations is immediately useful
in scan — its category, tags, and maintenance status are what determine fit. Scores appear
in suggest (tiebreaker) and versus pages (evidence-backed verdicts). Never block on them.

---

## PROJECT ARCHITECTURE

### Repository Layout
- `data/`            → Git-native YAML dataset (THE product)
  - `tools/`         → One YAML per tool (50 profiles)
  - `evaluations/`   → Community evaluation reports
  - `versus/`        → Head-to-head comparison markdown files
  - `tools-index.json` → Auto-generated compact index (run `scripts/build_index.py`)
- `scripts/`         → Python: crawl.py, score_computation.py, build_index.py, build_site.py, weekly_processor.py, validate_*.py
- `api/`             → Cloudflare Worker (TypeScript): tools/match/versus/pro routes + rate limiting
  - `src/index.ts`   → Route dispatcher
  - `src/ranking.ts` → Authoritative ranking logic (status + tag overlap + composite)
  - `src/pro.ts`     → Stripe checkout, webhook, KV watchlist
- `cli/`             → TypeScript CLI (`npm install -g agentRadar`)
  - `src/detect.ts`  → Project detection (package.json, MCP config, .claude/)
  - `src/check.ts`   → check command logic (match + classify + report)
  - `src/scan.ts`    → scan + suggest command logic
  - `src/ranking.ts` → CLI copy of api/src/ranking.ts — keep in sync
  - `src/watch.ts`   → watch command (Pro watchlist)
- `web/`             → Static HTML/CSS/JS: `scripts/build_site.py` → `web/dist/` → GitHub Pages
- `claude-plugin/`   → Claude Code /radar slash command plugin
  - `commands/radar.md` → Single file handles all 5 subcommands via $ARGUMENTS
- `templates/`       → Drop-in GitHub Actions templates for users (agentRadar-check.yml)

### Stack Constraints (do not deviate without an RFC)
- API: Cloudflare Workers — no FastAPI, no server, no Fly.io
- Data: Git YAML — no SQLite, no Postgres, no database
- Pro API keys: Cloudflare KV (PRO_KEYS namespace) — no Redis, no Fauna
- Payments: Stripe — no Paddle, no LemonSqueezy
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
