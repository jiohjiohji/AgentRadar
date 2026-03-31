# Community Post Drafts — AgentRadar Launch

Status: READY TO POST — repo is public, posts updated 2026-04-01.
Product framing: /radar Claude Code plugin is the primary entry point. Dataset is live now. CLI is secondary (CI/non-session contexts).
Note: Do NOT lead with scores or ranking tables — scores are tiebreaker signal, not the product.

---

## 1. Anthropic Discord — #claude-code

**Format:** Plain text, no markdown headers. Keep it short.

---

Hey — built something that might be useful here.

**AgentRadar** — add the plugin to Claude Code, then:

```
/radar scan          reads your project, tells you what tools you're missing
/radar suggest "browser testing"   compatible matches for your stack
/radar check         flags archived/stale tools in your current setup
/radar setup [id]    agent installs and configures the tool for you
```

No separate install. You're already in Claude Code.

The dataset powering it is live now: 50 tool profiles, 150 community evaluations, 3 head-to-head comparison pages. The plugin is Phase 1 (in active development).

GitHub: github.com/jiohjiohji/AgentRadar

If you've used any of these tools on a real task and want to add an evaluation, takes about 10 minutes: github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml

---

## 2. Reddit — r/ClaudeAI

**Title:** AgentRadar: /radar plugin for Claude Code — reads your project, finds what tools you're missing

---

Built something for the Claude Code ecosystem.

**The problem:** Finding the right MCP server or Claude Code plugin means searching Reddit threads, reading vibes-based comparisons, and manually testing tools that might be stale or incompatible with your setup.

**AgentRadar** solves this by reading your project first. Add the plugin to Claude Code:

```
/radar scan
```

Reads your `package.json`, `requirements.txt`, `.claude/`, MCP config. Detects your stack and what's already installed. Outputs 1–3 recommendations with "why this fits your setup" — not a ranked list of 50 tools.

```
/radar suggest "I need browser testing"
```

Context-aware: if you already have Playwright installed, it won't recommend something that conflicts.

```
/radar check
```

Run periodically or add to CI. Flags archived repos and tools with active maintained replacements. Exit code 0 = healthy, exit code 1 = action needed.

```
/radar setup [id]
```

Agent installs and configures the tool inside your Claude Code session — adds to MCP config, updates CLAUDE.md, installs deps.

**Current state:**
- Dataset live now: 50 tool profiles, 150 community evaluations, 3 versus pages (head-to-head comparisons)
- `/radar` plugin in active development (Phase 1)
- Matching logic based on category, tags, stack compatibility, and maintenance status — not averaged scores

**GitHub:** github.com/jiohjiohji/AgentRadar

---

## 3. Dev.to article

**Title:** I built a /radar plugin for Claude Code that reads your project before recommending tools

**Tags:** claudeai, mcp, devtools, opensource

---

I built [AgentRadar](https://github.com/jiohjiohji/AgentRadar) — a `/radar` plugin for Claude Code that reads your project and tells you what tools you're missing, without you having to search.

### The problem

Every week there are new MCP servers, Claude Code plugins, and orchestration frameworks. The standard way to find the right one:

1. Search Reddit/Discord for comparisons
2. Try to figure out if it's still maintained
3. Check whether it conflicts with what you already have
4. Install it and find out 45 minutes later that setup is broken on your platform

Most tool lists require you to already know what you're looking for. AgentRadar reads your project first.

### How /radar works

Add the plugin to Claude Code. Then, inside any session:

```
/radar scan
```

Reads `package.json`, `requirements.txt`, `pyproject.toml`, `.claude/`, `CLAUDE.md`, your MCP config. Detects your language, framework, existing tools, and which MCP servers are installed. Outputs 1–3 recommendations — each with a one-line reason specific to your setup.

```
/radar suggest "I need browser testing"
```

Context-aware: reads your project first, then matches your query. If you already have Playwright installed, it filters out anything that conflicts. If two tools are genuinely close, it surfaces the head-to-head comparison page instead of picking arbitrarily.

```
/radar check
```

Maintenance mode. Scans your installed tools and flags:
- Archived repos: "browser-mcp last commit Apr 2025 — playwright-mcp is actively maintained"
- Better-fit alternatives in the same category

CI-friendly: exit code 0 = healthy, exit code 1 = action needed. Drop it in a GitHub Actions workflow and get notified when your Claude Code setup goes stale.

```
/radar setup [id]
```

The part I'm most excited about: the agent installs and configures the recommended tool inside your session. Adds it to MCP config, updates CLAUDE.md, installs deps. You don't leave Claude Code.

### The dataset behind it

The plugin is Phase 1 (in active development). What's live now is the dataset it uses: 50 tool profiles across 9 categories — mcp-server, claude-plugin, claudemd-framework, orchestration, prompt-library, sdk-pattern, ide-integration, eval-observability, complementary.

Each profile has category, tags, maintenance status (active/stale/archived), pricing, license, and community evaluation scores where available. The matching logic uses category + tag overlap + maintenance status — scores are a tiebreaker, not the ranking mechanism.

The dataset is plain YAML in the repo. No API required to use it directly.

### 3 head-to-head comparisons already in the dataset

- [Playwright MCP vs BrowserMCP](https://github.com/jiohjiohji/AgentRadar/blob/main/data/versus/gh-microsoft-playwright-mcp-vs-gh-browsermcp-mcp.md) — BrowserMCP is archived; Playwright MCP is the only viable choice
- [wshobson/agents vs AgentSys](https://github.com/jiohjiohji/AgentRadar/blob/main/data/versus/gh-wshobson-agents-vs-gh-avifenesh-agentsys.md) — different tradeoffs on composability vs pre-built skills
- [TÂCHES vs context-engineering-kit](https://github.com/jiohjiohji/AgentRadar/blob/main/data/versus/gh-gsd-build-get-shit-done-vs-gh-neolab-context-engineering-kit.md)

### Contribute

If you've used any of the 50 tools on a real task, submit an evaluation. The form asks for specific scores with evidence sentences and a one-sentence verdict — not "great tool, would recommend."

[Evaluation Report →](https://github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml)

**GitHub:** [jiohjiohji/AgentRadar](https://github.com/jiohjiohji/AgentRadar)

Happy to hear feedback on the `/radar setup` command — specifically whether having the agent handle the full install (not just recommend) is actually useful or whether it creates more problems than it solves.
