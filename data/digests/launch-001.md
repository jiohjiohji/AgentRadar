---
issue: 1
title: "AgentRadar is live — 50 tools, 150 evaluations, zero synthetic scores"
date: 2026-03-31
status: draft
---

# AgentRadar is live — 50 tools, 150 evaluations, zero synthetic scores

Welcome to the first AgentRadar digest.

AgentRadar is a community dataset of Claude Code and MCP tools. Every number you see here was reported by a real developer who ran a specific task and wrote down what happened — time saved, token cost, failure rate, setup friction. No vendor benchmarks. No synthetic scores.

The dataset is public on GitHub: github.com/jiohjiohji/AgentRadar

---

## Top 5 tools this week

Ranked by composite score across 6 dimensions (p/q/c/r/x/f). All confidence: medium (3 evaluations each).

**1. Anthropic Python SDK — 8.19**
Category: sdk-pattern · License: MIT
The baseline against which everything else is measured. Evaluators consistently report it as the lowest-friction path to Claude API access, with predictable token behavior across 5-run tests.

**2. Filesystem MCP — 8.16**
Category: mcp-server · License: MIT
Highest composability score (9.1) of any MCP server in the dataset. Three independent evaluators integrated it with other MCP tools without conflict. Setup is under 5 minutes for anyone who has configured an MCP server before.

**3. Anthropic TypeScript SDK — 8.15**
Category: sdk-pattern · License: MIT
Parallel to the Python SDK but for TypeScript shops. Slightly lower cost-efficiency score reflects the overhead of the type system on token counts in streaming scenarios — evaluators flagged this as a minor tradeoff for the type safety.

**4. Anthropic Cookbook — 8.01**
Category: prompt-library · License: MIT
Not a tool — a reference library of patterns. Evaluators used it to reduce time spent on prompt scaffolding by an average of 35 minutes per new use case.

**5. Anthropic Prompt Engineering Tutorial — 8.00**
Category: prompt-library · License: MIT
The only entry in the dataset with a perfect reliability score (10.0) — it's documentation, so it doesn't break. Evaluators rated it the fastest path from "I know Claude exists" to "I have a working prompt."

---

## Versus highlight

**wshobson/agents (8.0) vs AgentSys (6.2)**

Two orchestration frameworks, very different tradeoffs.

wshobson/agents wins on composability (9.0 vs 6.3) because it's designed around Claude Code's existing tool call patterns — you extend it rather than learn a new model. AgentSys has a richer pre-built skill catalog but requires learning its plugin manifest format before you can modify anything.

Verdict from the versus page: choose wshobson/agents if you're already in Claude Code and want multi-agent without a framework tax; choose AgentSys if you want pre-built skills and are willing to invest 2–3 hours upfront.

[Full comparison →](https://github.com/jiohjiohji/AgentRadar/blob/main/data/versus/gh-wshobson-agents-vs-gh-avifenesh-agentsys.md)

---

## How scores work

Six dimensions, 0–10 each:

- **p** Productivity — time saved on a real task
- **q** Quality — output accuracy vs a baseline
- **c** Cost Efficiency — token cost relative to benefit
- **r** Reliability — consistency across 5+ runs
- **x** Composability — ease of integrating with other tools
- **f** Setup Friction — time from install to first working result

Every score has a confidence level (low / medium / high). We never show a score without showing the confidence. Low-confidence scores (fewer than 3 reports) are clearly labeled.

---

## Contribute

If you've used a tool in this dataset on a real task in the last 30 days, your evaluation takes about 10 minutes and directly improves the dataset.

Submit via GitHub Issues: github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml

—
AgentRadar · Unsubscribe
