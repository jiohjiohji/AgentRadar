# Community Post Drafts — AgentRadar Launch

Status: DRAFT — post on launch day after repo is made public.

---

## 1. Anthropic Discord — #claude-code

**Format:** Plain text message, no markdown headers

---

Hey everyone — I've been quietly building something for the past few weeks and it's finally at a point where it's worth sharing.

**AgentRadar** is an open dataset of 50 Claude Code and MCP tools, scored by community evaluations. The idea: every number traces to a real developer who ran a specific task and reported scores on 6 dimensions (productivity, quality, cost efficiency, reliability, composability, setup friction). No synthetic benchmarks.

What's in there right now:
- 50 tool profiles with schema-validated YAML
- 150 seed evaluations (3 per tool)
- 3 versus pages (head-to-head comparisons with evidence-backed verdicts)
- A daily crawler that flags when tools go stale or archived

The data is on GitHub: github.com/jiohjiohji/AgentRadar

If you've used any of these tools on a real task and want to submit an evaluation, there's a GitHub issue form that takes about 10 minutes. The more reports a tool has, the more reliable its scores become — right now everything is at "medium" confidence (3 evals each).

Happy to answer questions here or in the GitHub discussions.

---

## 2. Reddit — r/ClaudeAI

**Title:** AgentRadar: open dataset of 50 Claude Code tools with community evaluation scores

**Format:** Standard Reddit post

---

I've been building a dataset for the past month and wanted to share it with this community since it's directly relevant to Claude Code users.

**What it is:** AgentRadar is an open YAML dataset of 50 Claude Code and MCP tools. Every tool has a profile with 6 community-reported scores:

- **p** — Productivity (time saved on real tasks)
- **q** — Quality (output accuracy vs baseline)
- **c** — Cost Efficiency (token cost relative to benefit)
- **r** — Reliability (consistency across 5+ runs)
- **x** — Composability (how well it plays with other tools)
- **f** — Setup Friction (time from install to working result)

**What makes it different from other tool lists:** All scores come from structured evaluation reports submitted via GitHub Issues. Scores are `null` until 2 independent reports exist. Every score shows a confidence level (low/medium/high). Tool authors can submit evaluations for their own tools but must declare the conflict of interest — their reports are weighted separately.

**Current state:**
- 50 tools profiled
- 150 evaluations in the dataset
- 3 versus pages (head-to-head comparisons)
- Daily crawler that checks GitHub for stale/archived tools

**GitHub:** github.com/jiohjiohji/AgentRadar

The top tools right now are the Anthropic Python SDK (8.19), Filesystem MCP (8.16), and Anthropic TypeScript SDK (8.15) — though these will shift as more community evaluations come in.

If you've used any of these tools recently, submitting an evaluation takes ~10 minutes: github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml

---

## 3. Dev.to article

**Title:** AgentRadar: Open dataset of 50 Claude Code tools with community scores

**Tags:** claudeai, mcp, devtools, opensource

---

I built a thing and it's now public: [AgentRadar](https://github.com/jiohjiohji/AgentRadar) is an open dataset of 50 Claude Code and MCP tools, where every score comes from a structured community evaluation.

### The problem it solves

Every week there are new MCP servers, Claude Code plugins, and orchestration frameworks. Most tool comparisons are either vendor marketing or vibes-based. If you want to know whether Playwright MCP or BrowserMCP is better for your workflow, you either find a Reddit thread or you spend 3 hours testing both yourself.

AgentRadar is an attempt to make that community knowledge persistent and queryable.

### How it works

Each tool has a YAML profile with 6 scored dimensions:

```yaml
scores:
  p: 8.3   # Productivity
  q: 7.7   # Quality
  c: 7.0   # Cost Efficiency
  r: 8.0   # Reliability
  x: 9.0   # Composability
  f: 8.0   # Setup Friction
```

Scores are computed from community evaluation reports. An evaluation requires:
- A specific task you performed (not "I used it for coding")
- A 0–10 score for each dimension with one sentence of evidence
- A one-sentence verdict that is specific and opinionated
- Your Claude Code version, platform, and whether you have a conflict of interest

Tools start with `scores: null` and gain scores only after 2 independent reports. The `score_confidence` field (low/medium/high) is always shown — a score without confidence is meaningless.

### What's in the dataset today

- **50 tool profiles** spanning 9 categories: mcp-server, claude-plugin, claudemd-framework, orchestration, prompt-library, sdk-pattern, ide-integration, eval-observability, complementary
- **150 evaluations** (3 per tool — seed evaluations to establish baselines)
- **3 versus pages** with score tables and evidence-backed verdicts
- **Daily crawler** via GitHub Actions that checks `pushed_at` dates and flags tools that have gone stale or archived

### Top 5 tools by composite score

| Tool | Category | Score | Confidence |
|------|----------|-------|------------|
| Anthropic Python SDK | sdk-pattern | 8.19 | medium |
| Filesystem MCP | mcp-server | 8.16 | medium |
| Anthropic TypeScript SDK | sdk-pattern | 8.15 | medium |
| Anthropic Cookbook | prompt-library | 8.01 | medium |
| Anthropic Prompt Eng. Tutorial | prompt-library | 8.00 | medium |

### The data is the product

The repo is pure YAML + Python validation scripts. No database, no API at this stage — just structured files you can grep, fork, or build on. The schema is documented in `data/schema.yaml`.

### How to contribute

If you've used one of the 50 tools on a real task in the last 30 days, submit an evaluation via GitHub Issues. It takes about 10 minutes.

[Evaluation Report issue form →](https://github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml)

If you want to add a tool that isn't in the dataset yet, there's a Tool Submission form too.

**GitHub:** [jiohjiohji/AgentRadar](https://github.com/jiohjiohji/AgentRadar)

Feedback welcome — especially on the scoring dimensions. I've been debating whether `f` (Setup Friction) should be inverted in the composite (lower friction = better) but kept it consistent for now since the evaluators understood the framing.
