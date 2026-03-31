# AgentRadar — Product Requirements Document
# Version: 1.1 | Owner: Jihoon | Status: APPROVED
# Last updated: 2026-04-01 — pivot: /radar plugin PRIMARY, CLI secondary, scores as tiebreaker
# Feed this to Claude at session start for any product, feature, or UI work.

---

## 1. Executive Summary

AgentRadar is the open source intelligence layer for Claude Code and agentic workflow
tools. It continuously discovers, evaluates, and compares tools, delivering honest
signal where developers actually work — inside their terminal, Claude Code sessions,
and IDE.

**The core value proposition in one sentence:**
When a developer finds two tools that look identical, AgentRadar gives them an honest,
evidence-backed answer in under 60 seconds without leaving their terminal.

**What makes it different from existing solutions:**
Every existing solution (GitHub MCP Registry, awesome-claude-code, mcp-gateway-registry)
solves the discovery problem — what tools exist. AgentRadar solves the signal problem —
which tool to pick, why, and what it will cost in tokens.

---

## 2. Problem Statement

### 2.1 The Developer's Experience Today

A developer building with Claude Code needs a multi-agent orchestration tool.
They search GitHub. They find six tools with similar READMEs and varying star counts.
No comparison exists. No reliability data. No token cost data. No versus page.
They pick the one with the most stars. It is frequently not the right choice.
They discover this 90 minutes later after failing to get it working for their stack.

This is **choice paralysis at Phase 3** of the tool search — the highest-leverage
intervention point. It costs developers hours weekly across the ecosystem.

### 2.2 The Five-Phase Search Pattern

Every developer tool search follows this pattern. Understanding it drives every
product decision.

| Phase | What Happens | Time | Our Intervention |
|---|---|---|---|
| 1 — Trigger | Hit friction in workflow. Begin searching. | — | SEO on versus pages |
| 2 — Quick Scan | Google, Discord, Reddit. Scan top 3–4 results. | 2–5 min | Weekly digest |
| 3 — Choice Paralysis ★ | Two tools look equivalent. No comparison. | Minutes to days | Versus page → **HIGHEST LEVERAGE** |
| 4 — Trial | Install and try first choice. Often fails. | 30–120 min | `/radar suggest` + `/radar setup` |
| 5 — Lock-in | Tool adopted for months regardless of quality. | Permanent | `/radar check` + `agentRadar watch` alerts |

**Every feature must clearly state which phase it addresses.**

### 2.3 Problems We Do NOT Solve

These are explicit non-goals. Any feature that addresses these is out of scope.

- We do not build or host MCP servers
- ~~We do not provide tool installation or configuration assistance~~ **UPDATED 2026-04-01:** `/radar setup [id]` installs and configures tools inside Claude Code sessions. This is a core feature, not a non-goal.
- We do not offer security scanning or vulnerability detection
- We do not replace the tools we evaluate
- We do not generate synthetic reviews or AI-authored evaluations
- We do not enforce tool quality standards on tool authors

---

## 3. User Personas

### Persona A — The Daily Builder (Primary)
**Name:** Sam, 29, software engineer at a 12-person startup
**Uses Claude Code:** Daily, for feature development and refactoring
**Problem:** Spends 2–3 hours/week evaluating tools that might improve their workflow
**Goal:** Find the right tool for a specific task in under 10 minutes without leaving the terminal
**Frustration:** "GitHub stars tell me nothing about whether it works with my stack"
**Willingness to pay:** $9–15/month for watchlist alerts and early digest access
**Success metric:** `agentRadar compare` gives a confident answer in their first session

### Persona B — The Team Lead (Secondary)
**Name:** Maya, 35, senior engineer at a 40-person company
**Uses Claude Code:** Oversees 8 developers using it; makes tooling decisions
**Problem:** Each team member has their own tool list; no shared reference; decisions
made by whoever discovered a tool first
**Goal:** A single reference the whole team uses; alerts when tools go stale
**Willingness to pay:** $59/month for team dashboard and shared evaluations
**Success metric:** Team's tooling decisions are traceable and justified with data

### Persona C — The Tool Author (Community)
**Name:** Alex, builds open source MCP servers
**Uses Claude Code:** Dogfoods their own MCP tools
**Problem:** No visibility into whether their tool is being adopted or how it compares
**Goal:** Fair, independent evaluation; certification they can point users to
**Willingness to pay:** $0 to submit; possible commercial interest in evaluation feed
**Success metric:** Their tool has an honest AgentRadar score they can display in their README

### Persona D — The Enterprise Architect (Tertiary)
**Name:** Priya, 42, principal engineer at a 500-person company
**Uses Claude Code:** Evaluating adoption across multiple teams
**Problem:** Internal MCP tools have no structured evaluation; no comparison to
external alternatives; compliance team asks about security and governance
**Goal:** Private evaluation of internal tools; governance evidence for leadership
**Willingness to pay:** $499/month for private evals, SSO, audit logs
**Success metric:** Can present an evaluation report to their CISO with confidence

---

## 4. User Stories

### Phase 0 — Data Foundation

**US-001** As a developer, I want to browse tool profiles for Claude Code tools so that
I can discover what exists without leaving GitHub.
- Acceptance: 50 tool profiles publicly accessible in agentRadar/data repo
- Acceptance: Each profile has all 12 required schema fields
- Acceptance: Scores are null (not invented) until evaluations exist

**US-002** As a developer, I want to submit a tool for evaluation so that tools I
discover are included in the dataset.
- Acceptance: GitHub issue template takes under 5 minutes to complete
- Acceptance: Submission is acknowledged and triaged within 24 hours
- Acceptance: Auto-triage score is computed within 1 hour of submission

### Phase 1 — Signal

**US-003** As a developer, I want my tools to be discovered automatically so that I
don't have to know what I'm missing.
- Acceptance: `/radar scan` reads project context and outputs 1–3 gap recommendations
- Acceptance: Ranking uses status + stars + tag overlap — not scores
- Acceptance: Tools with no evaluations are surfaced when category/tags match

**US-004** As a developer, I want to describe a need and get compatible matches so that
I can find the right tool without manual research.
- Acceptance: `/radar suggest "browser testing"` returns context-aware matches in under 2 seconds
- Acceptance: Results are filtered by stack compatibility; scores used as tiebreaker only
- Acceptance: If two tools are close, the versus page is surfaced instead of picking one

**US-005** As a developer, I want to install a recommended tool without leaving Claude Code
so that the agent handles everything end-to-end.
- Acceptance: `/radar setup [id]` adds tool to MCP config, updates CLAUDE.md, installs deps
- Acceptance: `/radar scan`, `/radar suggest`, `/radar check` all work inside Claude Code
- Acceptance: Plugin is installable in one command

**US-006** As a developer, I want to subscribe to score change alerts for tools I use
so that I know when a tool I depend on improves or degrades.
- Acceptance: `agentRadar watch [id]` subscribes to alerts (requires Pro)
- Acceptance: Email alert sent within 24 hours of a score change >0.3
- Acceptance: Alert includes what changed, by how much, and a link to the updated profile

### Phase 2 — Intelligence

**US-007** As a developer, I want to see automated benchmark scores alongside
community scores so that I can distinguish subjective opinions from objective measurements.
- Acceptance: Tools with automated benchmark scores show a distinct [BENCHMARK] badge
- Acceptance: Benchmark version is displayed alongside scores
- Acceptance: Community scores and benchmark scores are shown separately

**US-008** As a team lead, I want a dashboard of my team's tool stack so that I can
see health signals without asking each developer individually.
- Acceptance: Team dashboard shows all tools tagged as "in use" by team members
- Acceptance: Stale tools (last evaluated >90 days) are highlighted in amber
- Acceptance: Archived tools are highlighted in red with a "find alternative" link

### Phase 3 — Currency (Freshness)

**US-009** As a developer, I want to see how current a score is so that I never make
a decision based on outdated data.
- Acceptance: Every score shows one of four freshness states: Current / Aging / Stale / Historical
- Acceptance: Stale scores are visually de-emphasised (greyed out in CLI, lower opacity on web)
- Acceptance: `agentRadar show [id]` explicitly shows "Last evaluated: [date]"

**US-010** As a developer, I want versus pages to warn me when they are out of date
so that I do not make decisions based on a comparison that no longer reflects reality.
- Acceptance: Versus pages show a "REVIEW PENDING" banner when either tool's score has
changed >1.0 since the page was written
- Acceptance: The valid_until date is visible on every versus page
- Acceptance: Expired versus pages are still accessible but clearly labelled

### Phase 4 — Governance

**US-011** As a community contributor, I want my contributions to be acknowledged so
that I am motivated to continue evaluating tools over time.
- Acceptance: Every merged evaluation report lists the contributor's role and month/year
- Acceptance: Top contributors are featured in the weekly digest
- Acceptance: Contributions are permanently attributed in the public record

**US-012** As an enterprise customer, I want to evaluate internal tools privately so
that competitive tooling information does not become public.
- Acceptance: Private evaluations are stored in a separate, access-controlled namespace
- Acceptance: Private evaluation results are never visible in public APIs or search
- Acceptance: Enterprise customers can compare private tools against public tools

---

## 5. Feature Prioritisation

### Priority Framework

Each feature is scored on three axes:
- **Value** (1–5): Impact on the primary persona's core problem
- **Effort** (1–5): Implementation complexity
- **Phase**: Which phase it belongs to

Only features with Value ≥ 4 AND Effort ≤ 3 are in Phase 0–1. Others wait.

### Feature Matrix

| Feature | Value | Effort | Phase | Decision |
|---|---|---|---|---|
| Public YAML dataset (50 tools) | 5 | 1 | 0 | BUILD NOW |
| Claude Code /radar plugin (scan, suggest, check, setup) | 5 | 2 | 1 | BUILD NOW — PRIMARY |
| CLI: check (CI), scan, suggest | 4 | 2 | 1 | BUILD NOW — SECONDARY |
| Score freshness badges | 5 | 2 | 3 | Phase 3 |
| Versus page staleness detection | 4 | 2 | 3 | Phase 3 |
| Automated benchmarks | 4 | 4 | 2 | Phase 2 |
| Static web UI + Pagefind | 3 | 2 | 1 | Phase 1 |
| VS Code extension | 4 | 3 | 2 | Phase 2 |
| Team dashboard | 4 | 3 | 2 | Phase 2 |
| Private evaluations | 4 | 4 | 4 | Phase 4 |
| Enterprise SSO + audit logs | 3 | 5 | 4 | Phase 4 |
| `agentRadar suggest` (task-based, standalone CLI) | 5 | 3 | 1 | Phase 1 (P1-004) |
| `agentRadar watch` (Pro alerts) | 4 | 2 | 1 | Phase 1 (Pro) |
| Monthly ecosystem sync | 4 | 2 | 3 | Phase 3 |

---

## 6. Non-Functional Requirements

### Performance
- CLI commands return in under 2 seconds (P95) on a standard internet connection
- API endpoints return in under 200ms (P95) — Cloudflare edge guarantee
- Static web UI loads in under 1.5 seconds (P95) on a 10Mbps connection
- Pagefind search returns results in under 100ms (browser-side, no network)

### Reliability
- GitHub Actions crawlers: 99% success rate on daily runs
- Cloudflare Workers API: 99.9% uptime (Cloudflare SLA)
- Data integrity: all YAML profiles pass validation before merge (enforced by CI)

### Data Accuracy
- Scores are never displayed without a confidence level
- Scores are never published with fewer than 2 independent reports
- Conflict-of-interest evaluations are excluded from score computation at the API layer
- Score history is append-only — no score entry is ever deleted or modified

### Security
- No user PII is stored in the public dataset
- Stripe handles all payment data — we never touch card numbers
- Pro API keys are stored in Cloudflare KV, not in the Git repo
- No secrets in any committed file — enforced by agnix and pre-commit hooks

### Compliance
- All community contributions are under CC BY-SA 4.0
- All code is under MIT license
- Evaluation reports explicitly request CoI disclosure
- GDPR: no cookies on web UI beyond functional necessity

---

## 7. Success Metrics

### Phase 0 (Day 10)
- 100 GitHub stars on agentRadar/data
- 5+ organic evaluation reports submitted without prompting
- 3 versus pages published and accessible

### Phase 1 End (Week 8)
- 500+ /radar plugin installs
- 50+ organic evaluations
- 10 paying Pro subscribers ($90 MRR)

### Phase 2 End (Month 6)
- 400+ tools in dataset
- 20 tools with automated benchmark scores
- 5 Team accounts ($295/month from teams alone)
- CLI install to first useful output: <90 seconds

### Year 1 (Month 12)
- $64K ARR
- 1,000+ community evaluations
- 25+ versus pages
- AgentRadar mentioned in at least one Anthropic community post

### Year 3
- ~$1M ARR
- 2,000+ evaluated tools
- 500+ versus pages indexed by Google
- AgentRadar scores embedded in at least one major registry

---

## 8. Out of Scope (Explicit Non-Goals)

The following will be raised repeatedly. They are out of scope.

| Suggestion | Why It's Out of Scope |
|---|---|
| "Add AI-generated reviews" | Destroys the trust model; community evaluations from practitioners is the product |
| "Rate tools with stars instead of scores" | Stars hide dimensional differences; 6-dimension scores are the differentiator |
| "Build a tool marketplace" | Scope creep; we evaluate tools, we don't distribute them |
| "Add social features (likes, follows)" | Not the use case; gamification reduces signal quality |
| "Support non-agentic tools" | Diffuses focus; we cover Claude Code and MCP ecosystem specifically |
| "Add a forum" | GitHub Discussions covers this; we do not need to build community infrastructure |
| "Display ads" | Destroys trust; digest sponsorships are the only commercial content |