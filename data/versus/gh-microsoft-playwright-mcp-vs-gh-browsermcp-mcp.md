---
id: gh-microsoft-playwright-mcp-vs-gh-browsermcp-mcp
tool_a: gh-microsoft-playwright-mcp
tool_b: gh-browsermcp-mcp
category: mcp-server
valid_until: 2026-06-29
created: 2026-03-31
---

# Playwright MCP vs BrowserMCP

## Quick Answer

**Choose Playwright MCP** for any new browser automation work. It is actively maintained by Microsoft and has a 7.0 composite score across reliability, quality, and productivity.

**Do not use BrowserMCP** for new projects. It was archived in April 2025, has a 3.1 composite score, fails on 15 of 18 tested sites, and has no migration path or active maintenance.

## Score Comparison

| Dimension | Playwright MCP | BrowserMCP |
|-----------|---------------|------------|
| Productivity (p) | 8.0 | 2.3 |
| Quality (q) | 7.3 | 3.3 |
| Cost Efficiency (c) | 5.7 | 4.3 |
| Reliability (r) | 7.0 | 2.3 |
| Composability (x) | 7.3 | 3.3 |
| Setup Friction (f) | 6.7 | 3.0 |
| **Composite** | **7.0** | **3.1** |
| Confidence | medium (3 evals) | medium (3 evals) |

## Community Verdicts

**Playwright MCP** — 3 evaluations (developer, team-lead, researcher):
- Manual QA time cut from 3 hours to 30 minutes per release using AI-driven checkout flow testing
- 96% price extraction accuracy across 400 product rows in a weekly scraping job
- 50-site accessibility audit completed in hours vs 2 full workdays manually; axe-core counts matched manual auditor on 44 of 50 sites
- Main limitations: token cost spikes on screenshot-heavy loops; anti-scraping measures on 1 of 3 tested competitor sites caused stalls
- Linux headless setup requires additional system deps (libgbm, libasound2)

**BrowserMCP** — 3 evaluations (developer, student, team-lead):
- Archived April 2025; Puppeteer dependency unmaintained and increasingly incompatible with modern Node.js and OS versions
- Failed on 15 of 18 test sites; macOS Sonoma security changes block the browser automation approach used
- Student: "lost two hours attempting to resolve dependency conflicts on Ubuntu before discovering the tool is archived"
- Team lead evaluation was a tooling audit to identify deprecated tools for removal from team configurations

## Use Cases

**Prefer Playwright MCP when:**
- You need AI-driven browser automation: E2E testing, scraping dynamic JS-heavy pages, accessibility auditing at scale
- You want a maintained, Microsoft-backed MCP server that receives security updates
- Your target sites use modern JavaScript frameworks (React, Next.js, Vue) — Playwright handles these reliably

**Prefer BrowserMCP when:**
- There is no scenario where BrowserMCP should be chosen for new projects
- If you have existing BrowserMCP configurations: migrate to Playwright MCP; the MCP protocol interface is compatible and Playwright MCP is a direct functional replacement

**Choose neither when:**
- Your automation task involves only static HTML pages and you need zero external dependencies — a direct `fetch` + HTML parser is simpler and cheaper
- You need browser automation at very high scale (1,000+ pages/hour) where a dedicated scraping service (Firecrawl, etc.) will be more cost-efficient than Playwright MCP token usage

## Methodology

Scores computed from 6 independent evaluations (3 per tool) submitted 2026-03-04 through 2026-03-23.
All evaluators disclosed no conflict of interest. No tool author evaluations included.
Evidence strings are task-specific; see `data/evaluations/gh-microsoft-playwright-mcp-*.yaml` and
`data/evaluations/gh-browsermcp-mcp-*.yaml` for raw data.
Score confidence: **medium** (3 evaluations each; 10+ required for high confidence).
Note: BrowserMCP's low scores reflect its archived status, not a deficiency in its original design.
