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
   When no deps exist, reads root .md files (PRD, README) to infer what the developer is building.
   Infers development style (vibe/agent/balanced) from project structure.
   Outputs: "You have X, you're missing Y, here's what fits your setup and style."
   Ranking: status + tag overlap + intent signals from markdown + **style-adaptive fitBonus**.

2. **`suggest`** (hit a wall or want to improve)
   Context-aware — reads your project first, then matches your query.
   "I need browser testing" → checks your stack → recommends compatible tools only.
   Same style-adaptive ranking: vibe coders get low-friction tools, agent architects get composable tools.

3. **`check`** (maintenance — run periodically or via CI)
   Scans your installed tools against the dataset.
   Flags: archived repos, stale tools, better alternatives that won't break your setup.
   CI-friendly: exit code 0 = healthy, exit code 1 = action needed.

**On ranking — style-adaptive, not one-size-fits-all:**
The ranking formula adapts to the developer's inferred style:
- **Vibe coders** (few deps, no agent patterns): bonus for high `f` score (setup friction — how fast can I get this working?)
- **Agent architects** (3+ MCP servers, agent patterns in CLAUDE.md): bonus for high `x` score (composability — will this integrate with my other tools?)
- **Balanced** (moderate deps): equal weight to both `f` and `x`
A newer tool with fewer stars but better fit for the user's style beats an established tool that doesn't fit.

**On scores:**
Scores are curated signal, not a gate. A tool with no scores is immediately useful
in scan — its category, tags, and maintenance status are what determine fit. The `f` and `x`
dimension scores drive the style-adaptive ranking. Never block on missing scores.

---

## PROJECT ARCHITECTURE

### Repository Layout
- `data/`            → Git-native YAML dataset (THE product)
  - `tools/`         → One YAML per tool (50 profiles)
  - `evaluations/`   → Evaluation backing data (scores derived from these)
  - `versus/`        → Head-to-head comparison markdown files
  - `tools-index.json` → Auto-generated compact index (run `scripts/build_index.py`)
- `scripts/`         → Python: crawl.py, score_computation.py, build_index.py, build_site.py, weekly_processor.py, validate_*.py
- `api/`             → Cloudflare Worker (TypeScript): tools/match/versus/pro routes + rate limiting
  - `src/index.ts`   → Route dispatcher
  - `src/ranking.ts` → Authoritative ranking logic (status + tag overlap + style-adaptive fitBonus from f/x scores)
  - `src/pro.ts`     → Stripe checkout, webhook, KV watchlist
- `cli/`             → TypeScript CLI (`npm install -g agentRadar`)
  - `src/detect.ts`  → Project detection (package.json, MCP config, .claude/)
  - `src/intent.ts`  → Intent extraction from markdown + inferStyle (vibe/agent/balanced)
  - `src/check.ts`   → check command logic (match + classify + report)
  - `src/scan.ts`    → scan + suggest command logic (threads intent signals + style)
  - `src/ranking.ts` → CLI copy of api/src/ranking.ts — keep in sync (style-adaptive fitBonus)
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
- Do not generate mock or placeholder scores — scores are curated and backed by evaluation data.
- Do not use `any` type in TypeScript.
- Do not catch errors silently — every error is logged or surfaced.

---

## FORBIDDEN PATTERNS

Added when something actually goes wrong. Each entry must include what happened.

_(Empty — nothing has gone wrong yet. Add entries as real issues arise.)_

---

## DECISIONS LOG

See `DECISIONS.md` for the full log. Check it before making any architectural decision.
