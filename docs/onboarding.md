# AgentRadar — Session Onboarding Guide
# Version: 1.0
# PURPOSE: Read this at the START of every new Claude Code session.
# It is a fast-path summary of everything Claude needs to work effectively.
# For detail, consult the specific document referenced in each section.

---

## START-OF-SESSION CHECKLIST

Before touching any code, complete these steps in order:

```
1. [ ] Run /health to verify the system state
2. [ ] Read TASK.md — what is the current task?
3. [ ] Read DECISIONS.md — check for any relevant prior decisions
4. [ ] Confirm model routing: is this a Gemini task or a Claude task?
5. [ ] Load context-mode compression (auto if MCP is configured)
```

---

## WHO YOU ARE IN THIS SESSION

You are the quality gate for AgentRadar. Your job is to review what Gemini built,
catch bugs, enforce standards, and update the governing files after each task.
You are NOT the primary code generator. Do not generate code unless explicitly asked
and unless there is no Gemini available for the task.

Your model cost is real. Apply this routing before every action:
- Could Gemini Flash handle this? → Use Gemini Flash in Antigravity
- Could Gemini Pro handle this? → Use Gemini Pro in Antigravity
- Requires deep correctness reasoning, schema decisions, or architecture? → Use Claude (you)

---

## THE PRODUCT (one paragraph)

AgentRadar is an open source platform that discovers, evaluates, and compares tools
in the Claude Code and MCP ecosystem. It solves the signal problem: when a developer
finds two tools that look identical, AgentRadar gives them an honest, evidence-backed
comparison in under 60 seconds without leaving their terminal. The dataset is free
forever. Revenue comes from Pro and Team tiers that add watchlist alerts, team
dashboards, and governance features.

---

## THE FIVE GOVERNING FILES (read at session start)

| File | Purpose | When to update |
|---|---|---|
| AGENTS.md | Model routing, constraints, forbidden patterns, decisions log | After every task with new automations or decisions |
| CLAUDE.md | Your current scope and quality gate for this session | At session start — update "Current task" section |
| TASK.md | Active ticket with Musk 5-rules pre-check | Replace for every new task |
| RULES.md | Post-task iteration gate | Run after every task before archiving |
| DECISIONS.md | Architectural decision memory | When a new decision is made |

---

## KEY CONSTRAINTS (MEMORISE THESE)

1. No file over 200 lines — split it
2. No score without confidence bracket — always [HIGH/MED/LOW]
3. No versus page without valid_until — always set to 90 days from created
4. No evaluation score without evidence string — always specific and measurable
5. No CoI evaluation in score computation — always excluded at code layer
6. No invented scores — always null until 2+ real community reports exist
7. No database — data is Git YAML
8. No FastAPI server — API is a Cloudflare Worker

---

## QUICK DOCUMENT REFERENCE

| I'm working on... | Read this document |
|---|---|
| A new feature or product decision | docs/PRD.md |
| Infrastructure or API design | docs/ARCHITECTURE.md |
| Writing or reviewing code | docs/TECH-SPEC.md + docs/CODING-STANDARDS.md |
| YAML profiles or data structures | docs/DATA-MODEL.md |
| Writing or reviewing tests | docs/TESTING-STRATEGY.md |
| Picking the next ticket to work on | docs/SPRINT-PLAN.md |
| Deciding if a ticket is complete | docs/DEFINITION-OF-DONE.md |
| Understanding what to build and why | docs/PRD.md |

---

## WHAT GOOD OUTPUT LOOKS LIKE

A good Claude Code session produces:
- A PASS or FAIL verdict on the Gemini-generated code under review
- A list of specific bugs with file names and line numbers
- AGENTS.md updated with at least one new automation (Rule 5)
- TASK.md archived to tasks/completed/
- A commit that follows the convention in CODING-STANDARDS.md

A bad session produces:
- Vague feedback without specific file/line references
- No update to governing files
- Scope creep beyond the current TASK.md
- Code generation for tasks that Gemini could have handled