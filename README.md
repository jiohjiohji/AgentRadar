# AgentRadar

[![Validate](https://github.com/jiohjiohji/AgentRadar/actions/workflows/validate.yml/badge.svg)](https://github.com/jiohjiohji/AgentRadar/actions/workflows/validate.yml)

**AgentRadar reads your project and tells you what tools will help — without you having to search.**

Three commands, one workflow:

```bash
agentRadar scan        # reads your project, finds gaps in your current setup
agentRadar suggest "browser testing"   # describe a need, get compatible matches
agentRadar check       # flags stale or archived tools and suggests replacements
```

Inside Claude Code, `/radar` does all three without leaving your session.

> **Phase 0 — data foundation is live.** The CLI is in active development (Phase 1). This repo is the dataset that powers it: 50 community-scored tool profiles, 150 evaluations, zero synthetic scores.

---

## Why

Every week there are new MCP servers, Claude Code plugins, and orchestration frameworks. Most tool lists are curated by vendors. Most comparisons are vibes-based. Developers waste hours finding, evaluating, and configuring tools that may be stale, incompatible with their stack, or worse than what they already have.

AgentRadar solves this with a dataset of structured evaluations from developers who ran real tasks and reported what happened — and a CLI that reads your project context before making a recommendation.

---

## Quick start — browse the dataset

**Find a tool by category:**

```
data/tools/          ← 50 tool profiles (YAML)
data/versus/         ← head-to-head comparisons
data/evaluations/    ← raw community evaluation reports
```

**Read a score:**

Each tool has a `scores` block with six community-reported dimensions:

| Key | Dimension | What it measures |
|-----|-----------|-----------------|
| `p` | Productivity | Time saved on real tasks |
| `q` | Quality | Output accuracy vs baseline |
| `c` | Cost Efficiency | Token cost relative to benefit |
| `r` | Reliability | Consistency across 5+ runs |
| `x` | Composability | Ease of integrating with other tools |
| `f` | Setup Friction | Time from install to first working result |

Scores are `null` until 2 independent reports exist. `score_confidence` (low/medium/high) is always shown — a score without confidence is meaningless.

**Top tools by composite score (2026-03-31):**

| Tool | Category | Score | Confidence |
|------|----------|-------|------------|
| Anthropic Python SDK | sdk-pattern | 8.19 | medium |
| Filesystem MCP | mcp-server | 8.16 | medium |
| Anthropic TypeScript SDK | sdk-pattern | 8.15 | medium |
| Anthropic Cookbook | prompt-library | 8.01 | medium |
| Anthropic Prompt Engineering Tutorial | prompt-library | 8.00 | medium |

---

## Versus pages

Evidence-backed head-to-head comparisons:

- [wshobson/agents vs AgentSys](data/versus/gh-wshobson-agents-vs-gh-avifenesh-agentsys.md)
- [Playwright MCP vs BrowserMCP](data/versus/gh-microsoft-playwright-mcp-vs-gh-browsermcp-mcp.md)
- [TÂCHES (GSD) vs context-engineering-kit](data/versus/gh-gsd-build-get-shit-done-vs-gh-neolab-context-engineering-kit.md)

---

## Schema

Tool profiles conform to [`data/schema.yaml`](data/schema.yaml) — 12 fields, documented with types, examples, and constraints.

---

## How to contribute

Submit an evaluation via GitHub Issues. Takes ~10 minutes if you've used the tool on a real task in the last 30 days.

[New Issue → Evaluation Report](https://github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml)

The form asks for: tool ID, your scores (0–10 each) with one sentence of evidence per dimension, and a specific one-sentence verdict. Conflict of interest must be declared but does not disqualify your evaluation.

Full contribution guide: [`data/CONTRIBUTING.md`](data/CONTRIBUTING.md)

---

## Repository layout

```
data/
  schema.yaml          ← 12-field tool profile schema
  tools/               ← 50 tool profile YAMLs
  evaluations/         ← community evaluation reports
  versus/              ← head-to-head comparison pages
  CONTRIBUTING.md      ← evaluation submission guide
scripts/
  validate_yaml.py     ← schema validator (run after editing tools/)
  validate_evaluation.py
  validate_versus.py
.github/
  ISSUE_TEMPLATE/      ← evaluation-report.yml, tool-submission.yml
  workflows/           ← validate.yml (runs on every PR to main)
```

---

## Running validation locally

```bash
pip install pyyaml
python scripts/validate_yaml.py data/tools/
```

All PRs to `main` run validation automatically.
