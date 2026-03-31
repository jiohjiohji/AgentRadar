---
issue: 1
title: "AgentRadar: the dataset that reads your project before making a recommendation"
date: 2026-03-31
status: draft
---

# AgentRadar: the dataset that reads your project before making a recommendation

Welcome to the first AgentRadar digest.

AgentRadar is a community dataset of Claude Code and MCP tools — and the foundation for a CLI that reads your project context before telling you what tools to use. Every score in this dataset was reported by a real developer who ran a specific task and wrote down what happened. No vendor benchmarks. No synthetic data.

The dataset is public on GitHub: github.com/jiohjiohji/AgentRadar

---

## What AgentRadar will do (the CLI, in active development)

```bash
agentRadar scan        # reads package.json, requirements.txt, .claude/, MCP config
                       # detects your stack, finds tool gaps, outputs 1-3 recommendations
agentRadar suggest "browser testing"  # matches against your existing setup
agentRadar check       # flags stale tools, suggests active replacements
```

The insight behind it: most tool lists require you to know what you're looking for. `scan` reads your project first, then tells you what you're missing — without you having to ask.

The CLI is Phase 1. The dataset is live now.

---

## Top 5 tools in the dataset

Ranked by composite score across 6 dimensions (p/q/c/r/x/f). All at medium confidence (3 evaluations each).

**1. Anthropic Python SDK — 8.19**
sdk-pattern · MIT · active
The baseline. Evaluators report it as the lowest-friction path to Claude API access. Predictable token behavior across 5-run reliability tests. If you're building anything with Claude, you're already using this.

**2. Filesystem MCP — 8.16**
mcp-server · MIT · active
Highest composability score (9.1) of any tool in the dataset. Three evaluators independently integrated it with other MCP tools without conflict. Setup under 5 minutes.

**3. Anthropic TypeScript SDK — 8.15**
sdk-pattern · MIT · active
Parallel to the Python SDK for TypeScript shops. Slightly lower cost-efficiency reflects the overhead of the type system on token counts in streaming scenarios — a minor tradeoff for type safety.

**4. Anthropic Cookbook — 8.01**
prompt-library · MIT · active
A reference library of patterns, not an installable tool. Evaluators used it to reduce time on prompt scaffolding by an average of 35 minutes per new use case.

**5. TÂCHES (Get Shit Done) — 7.97**
claudemd-framework · MIT · active
The highest-scoring CLAUDE.md framework in the dataset. Evaluators report it substantially reduces context drift in long Claude Code sessions — the problem it was designed for.

---

## Versus highlight

**Playwright MCP vs BrowserMCP**

| Dimension | Playwright MCP | BrowserMCP |
|-----------|----------------|------------|
| Productivity | 8.0 | 7.0 |
| Composability | 8.3 | 7.7 |
| Setup Friction | 7.7 | 8.3 |
| Composite | **7.9** | **7.5** |

Playwright MCP wins on productivity and composability; BrowserMCP wins on setup friction — it's the easier install if you want something working in under 10 minutes and don't need Playwright's full API surface.

This is the kind of tradeoff `suggest` will surface automatically: if your project already has Playwright installed, it won't recommend BrowserMCP.

[Full comparison →](https://github.com/jiohjiohji/AgentRadar/blob/main/data/versus/gh-microsoft-playwright-mcp-vs-gh-browsermcp-mcp.md)

---

## How scores work

Six dimensions, 0–10 each, reported by community evaluators:

| Key | Dimension |
|-----|-----------|
| p | Productivity — time saved on a real task |
| q | Quality — output accuracy vs a baseline |
| c | Cost Efficiency — token cost relative to benefit |
| r | Reliability — consistency across 5+ runs |
| x | Composability — integration with other tools |
| f | Setup Friction — time from install to working result |

Every score shows a confidence level (low / medium / high). Scores with fewer than 3 reports are explicitly labeled low-confidence.

---

## Contribute

If you've used a tool in this dataset on a real task, submit an evaluation. It takes about 10 minutes and directly improves the dataset that will power `scan` recommendations.

Submit via GitHub Issues: github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml

Star the repo to follow Phase 1 progress: github.com/jiohjiohji/AgentRadar

—
AgentRadar · Unsubscribe
