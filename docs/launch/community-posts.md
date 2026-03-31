# Community Post Drafts — AgentRadar Launch

Status: DRAFT — post on launch day after repo is made public.
Product framing: CLI that reads your project (scan/suggest/check) — dataset is the foundation, CLI is Phase 1.

---

## 1. Anthropic Discord — #claude-code

**Format:** Plain text, no markdown headers

---

Hey everyone — I've been building something for the past month and it's now public.

**AgentRadar** is two things:

First, an open dataset of 50 Claude Code and MCP tools, community-scored on 6 dimensions (productivity, quality, cost efficiency, reliability, composability, setup friction). Every score comes from a structured evaluation report — real tasks, real numbers, no vendor data.

Second — and this is the point — a CLI that reads your project before making a recommendation:

```
agentRadar scan        → reads your stack, finds tool gaps you haven't noticed
agentRadar suggest "browser testing"  → matches against what you already have
agentRadar check       → flags archived/stale tools, suggests active replacements
```

The `scan` command is the flagship: it reads your package.json, requirements.txt, .claude/ config, and MCP setup, then tells you what you're missing for your specific stack. Not 10 options — 1–3 recommendations with "why this fits your setup."

The dataset is live now. The CLI is Phase 1 (in development). I'm launching the data first so the community can contribute evaluations that will make `scan` recommendations trustworthy before the CLI ships.

GitHub: github.com/jiohjiohji/AgentRadar

If you've used any of the 50 tools in the dataset recently, submitting an evaluation takes about 10 minutes: github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml

Happy to answer questions here.

---

## 2. Reddit — r/ClaudeAI

**Title:** AgentRadar: open dataset of 50 Claude Code tools + a CLI that reads your project before recommending

**Format:** Standard Reddit post

---

I've been building a tool for the Claude Code ecosystem and wanted to share it here.

**The problem:** Most Claude Code / MCP tool lists require you to know what you're looking for. You find a Reddit thread, read some vibes-based comparison, spend 3 hours testing tools yourself. The ones you pick might be stale, incompatible with your stack, or duplicating something you already have.

**What I built:** AgentRadar — a community dataset + CLI.

The CLI reads your project first:

```bash
agentRadar scan
# reads package.json, requirements.txt, .claude/, MCP config
# detects your stack, existing tools, and what gaps exist
# outputs: "You have X. You're missing Y. Here's what fits your setup."

agentRadar suggest "I need browser testing"
# matches against your existing deps — won't suggest conflicts
# shows setup friction score prominently (vibe coders care most about "how hard is this?")

agentRadar check
# scans your installed tools
# flags archived repos, stale tools, and better alternatives
# "Your browser-mcp is archived. playwright-mcp is actively maintained and scores 7.9."
```

Inside Claude Code, `/radar` does all three without leaving your session.

**Current state:**
- Dataset is live now: 50 tool profiles, 150 evaluations, 3 versus pages
- CLI is in active development (Phase 1)
- All scores come from structured community evaluation reports — no synthetic data

**Top tools by composite score today:**

| Tool | Score | Category |
|------|-------|----------|
| Anthropic Python SDK | 8.19 | sdk-pattern |
| Filesystem MCP | 8.16 | mcp-server |
| Anthropic TypeScript SDK | 8.15 | sdk-pattern |
| Anthropic Cookbook | 8.01 | prompt-library |
| TÂCHES (GSD) | 7.97 | claudemd-framework |

**GitHub:** github.com/jiohjiohji/AgentRadar

If you've used any of the 50 tools on a real task recently, submitting an evaluation takes ~10 minutes and directly improves what `scan` will recommend: github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml

---

## 3. Dev.to article

**Title:** AgentRadar: the Claude Code tool that reads your project before making a recommendation

**Tags:** claudeai, mcp, devtools, opensource

---

I built a thing: [AgentRadar](https://github.com/jiohjiohji/AgentRadar).

The short version: it's a CLI that reads your project context before telling you what tools to use, backed by a community dataset of structured evaluations.

### The problem

Every week there are new MCP servers, Claude Code plugins, and orchestration frameworks. Finding the right one for your project means:

1. Searching through GitHub, Reddit, and Discord for comparisons
2. Evaluating whether the tool is still maintained
3. Checking if it conflicts with what you already have
4. Testing it manually for an hour to get a real sense of the friction

AgentRadar automates that research and makes it project-aware.

### How it works

```bash
agentRadar scan
```

Reads your project: `package.json`, `requirements.txt`, `pyproject.toml`, `.claude/`, `CLAUDE.md`, MCP config.

Detects: your language, framework, existing tools, Claude Code setup, and which MCP servers you have installed.

Outputs 1–3 recommendations — not 10 options. Each recommendation includes what the tool does, why it fits *your* setup specifically, and its setup friction score (how long until first working result, reported by community evaluators).

```bash
agentRadar suggest "I need browser testing"
```

Context-aware: reads your project first, then matches against your query. If you already have Playwright installed, it won't recommend a tool that conflicts. Shows the versus page if two results are close.

```bash
agentRadar check
```

Maintenance mode. Scans your installed tools against the dataset. Flags:
- Archived repos: "browser-mcp last commit Apr 2025 — consider playwright-mcp"
- Better alternatives: "you use X (score 5.2), Y does the same thing (score 7.8)"

Exit code 0 = all healthy, exit code 1 = action needed. CI-friendly.

### The dataset behind it

The CLI is Phase 1. What's live right now is the dataset it will use: 50 tool profiles, each scored on 6 community-reported dimensions.

```yaml
scores:
  p: 8.3   # Productivity — time saved on a real task
  q: 7.7   # Quality — output accuracy vs baseline
  c: 7.0   # Cost Efficiency — token cost relative to benefit
  r: 8.0   # Reliability — consistency across 5+ runs
  x: 9.0   # Composability — integration with other tools
  f: 8.0   # Setup Friction — time from install to first working result
```

An evaluation requires:
- A specific task you performed (not "I used it for coding")
- Scores 0–10 with one sentence of evidence per dimension
- A specific, opinionated one-sentence verdict
- Conflict of interest declaration (required, doesn't disqualify)

Tools start with `scores: null`. Scores appear after 2 independent reports. `score_confidence` (low/medium/high) is always shown. A score without confidence is meaningless.

### Top tools today

| Tool | Category | Score | Confidence |
|------|----------|-------|------------|
| Anthropic Python SDK | sdk-pattern | 8.19 | medium |
| Filesystem MCP | mcp-server | 8.16 | medium |
| Anthropic TypeScript SDK | sdk-pattern | 8.15 | medium |
| Anthropic Cookbook | prompt-library | 8.01 | medium |
| TÂCHES (Get Shit Done) | claudemd-framework | 7.97 | medium |

All at medium confidence (3 evals each). Scores will shift as more community reports come in.

### Why launch the dataset before the CLI?

The CLI is only as good as the data it uses. I want the evaluations to be trustworthy before `scan` starts making recommendations to developers. Launching the data first means the community can add evaluations while I build the CLI — instead of shipping recommendations backed by thin data.

### Contribute

If you've used one of the 50 tools on a real task in the last 30 days, submit an evaluation.

[Evaluation Report issue form →](https://github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml)

**GitHub:** [jiohjiohji/AgentRadar](https://github.com/jiohjiohji/AgentRadar)

The `scan` command is the one I'm most interested in feedback on — specifically whether the framing ("reads your project first, then recommends") actually changes which tools people adopt vs. a ranked list. If you have thoughts on that, open a discussion.
