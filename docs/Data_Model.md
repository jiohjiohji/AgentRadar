# AgentRadar — Data Model Reference
# Version: 1.0 | Owner: Jihoon | Status: APPROVED
# Feed this to Claude for any work involving data structures, schema, or storage.

---

## 1. Overview

All data is stored as human-readable text files in Git. No database is required
to read or contribute data. The data model has five primary entities.

```
ToolProfile         Core entity. One per tool. Lives in data/tools/[id].yaml
EvaluationReport    Submitted by practitioners. Lives in data/evaluations/[tool-id]-[date]-[n].yaml
VersusPage          Head-to-head comparison. Lives in data/versus/[id1]-vs-[id2].md
BenchmarkTask       Task definition. Lives in data/benchmarks/tasks/T01/
WeeklyDigest        Published newsletter. Lives in data/digests/YYYY-MM-DD.md
```

---

## 2. ToolProfile Entity

### 2.1 Full Example
```yaml
id: "gh-wshobson-agents"
name: "Claude Code Agents"
source_url: "https://github.com/wshobson/agents"
category: orchestration
pricing: free
license: MIT
status: active

scores:
  p: 8.2
  q: 7.9
  c: 7.1
  r: 7.4
  x: 8.8
  f: 6.5

score_confidence: medium

score_history:
  - date: "2026-01-15"
    overall: 7.1
    benchmark_version: null
  - date: "2026-02-20"
    overall: 7.4
    benchmark_version: null
  - date: "2026-03-29"
    overall: 7.7
    benchmark_version: null

tags:
  - multi-agent
  - orchestration
  - workflow
  - claude-code-native
  - production-tested

versus_refs:
  - id: "gh-agentsys"
    verdict_short: "wshobson for simpler setups; AgentSys for production at scale"
    valid_until: "2026-06-29"
  - id: "taches-resources"
    verdict_short: "wshobson for development teams; TÂCHES for solo meta-workflow builders"
    valid_until: "2026-07-01"
```

### 2.2 Field Constraints Table

| Field | Type | Required | Nullable | Constraints |
|---|---|---|---|---|
| id | string | YES | NO | `^[a-z0-9][a-z0-9-]*[a-z0-9]$`, unique, stable |
| name | string | YES | NO | Max 80 chars, title case |
| source_url | string | YES | NO | Valid HTTP/HTTPS URL |
| category | enum | YES | NO | One of 9 defined values |
| pricing | enum | YES | NO | free, freemium, paid |
| license | string | YES | YES | SPDX identifier or null |
| status | enum | YES | NO | active, stale, archived |
| scores | object | YES | YES | null until 2+ clean reports |
| score_confidence | enum | YES | YES | null iff scores is null |
| score_history | array | YES | NO | Empty array [], append-only |
| tags | array | YES | NO | 3–10 items, lowercase, hyphen-separated |
| versus_refs | array | YES | NO | Empty array [] initially |

### 2.3 Computed Fields (not stored, derived by API/CLI)

These fields are computed at read time from stored data. Never store them in YAML.

```
freshness_status    Computed from: last evaluation date in evaluations/ for this tool
                    current: evaluated within 90 days
                    aging: 90–180 days since evaluation
                    stale: 180+ days since evaluation
                    historical: tool is archived or deprecated

overall_score       Computed from: average of p, q, c, r, x, f (non-null values only)

report_count        Computed from: count of non-CoI evaluations for this tool

days_since_commit   Computed from: current date - last commit date at source_url
```

---

## 3. EvaluationReport Entity

### 3.1 Full Example
```yaml
tool_id: "gh-wshobson-agents"
reporter_role: "small-team"
date_evaluated: "2026-03-10"
claude_code_version: "2.1.77"
platform: "macos"

task_performed: >
  Used wshobson/agents to implement a full-stack feature involving a new API
  endpoint, database migration, and corresponding frontend component, coordinating
  across a backend-architect agent and a frontend-developer agent simultaneously.

scores:
  p:
    value: 8
    evidence: "Saved approximately 40 minutes compared to implementing sequentially without agent coordination"
  q:
    value: 8
    evidence: "Output matched our team's code review standards on first pass; one minor style issue flagged"
  c:
    value: 7
    evidence: "Used approximately 6,200 tokens for the task; our baseline without the orchestration layer is ~4,100 tokens"
  r:
    value: 7
    evidence: "Completed successfully on 4 of 5 runs; one run hallucinated an import that required manual fix"
  x:
    value: 9
    evidence: "Integrated cleanly with our existing Playwright MCP setup in under 10 minutes, no configuration changes"
  f:
    value: 6
    evidence: "Initial setup took 45 minutes; documentation on multi-agent configuration could be clearer"

verdict: "Best overall choice for development teams who want multi-agent coordination without building their own orchestration layer — the setup time pays back within the first complex feature."

conflict_of_interest: "none"
```

### 3.2 Evaluation Quality Rules

These are enforced by validate_evaluation.py. Evaluations that fail are returned
for revision before being merged.

| Rule | Threshold | Enforcement |
|---|---|---|
| task_performed length | ≥20 words | Hard error |
| evidence string length | ≥10 words per dimension | Hard error |
| verdict length | ≥10 words | Hard error |
| Generic evidence | "it was good/great/fast" | Hard error (blocked phrases) |
| Generic verdict | "I recommend this tool" | Hard error (pattern match) |
| Max evals per user per tool | 3 | Soft warning — flag for human review |
| CoI field present | always | Hard error |

---

## 4. VersusPage Entity

### 4.1 Frontmatter Specification
```markdown
---
tool_a: "gh-wshobson-agents"
tool_b: "gh-agentsys"
created: "2026-03-29"
valid_until: "2026-06-27"        # Always 90 days from created
last_reviewed: "2026-03-29"      # Updated when a human reviews the page
status: "current"                 # current | review_pending | archived
evaluation_count_a: 6
evaluation_count_b: 4
---
```

### 4.2 Staleness State Machine

```
[created] → status: current
    ↓ (either tool score changes >1.0)
status: review_pending
    ↓ (human updates the page)
status: current (last_reviewed updated)
    ↓ (either tool is Archived or Deprecated)
status: archived
    ↓ (never transitions back from archived)
```

Versus pages in `review_pending` state are listed in the weekly digest's
"Needs Human Review" section.

---

## 5. Scoring System

### 5.1 Score Computation Rules (enforced in code)

```python
def compute_tool_score(tool_id: str, evaluations: list[EvaluationReport]) -> ToolScore | None:
    # Step 1: Filter out CoI-flagged evaluations
    clean_evals = [e for e in evaluations if e.conflict_of_interest == "none"]

    # Step 2: Minimum report threshold
    if len(clean_evals) < MIN_REPORTS_TO_PUBLISH:  # = 2
        return None

    # Step 3: Compute dimension averages
    dimensions = {}
    for dim in ["p", "q", "c", "r", "x", "f"]:
        values = [getattr(e.scores, dim).value for e in clean_evals
                  if getattr(e.scores, dim).value is not None]
        dimensions[dim] = sum(values) / len(values) if values else None

    # Step 4: Score change gate (prevents gaming via single-report spike)
    new_overall = compute_overall(dimensions)
    if tool_has_existing_score(tool_id):
        existing = get_existing_score(tool_id)
        delta = abs(new_overall - existing.overall)
        if delta > MAX_SINGLE_DELTA and len(clean_evals) < MIN_REPORTS_FOR_LARGE_DELTA:
            # MAX_SINGLE_DELTA = 0.5, MIN_REPORTS_FOR_LARGE_DELTA = 3
            return None  # Hold — wait for 3rd report to confirm

    # Step 5: Assign confidence
    confidence = (
        "low" if len(clean_evals) < 3
        else "medium" if len(clean_evals) < 10
        else "high"
    )

    return ToolScore(dimensions=dimensions, confidence=confidence,
                     report_count=len(clean_evals))
```

### 5.2 Dimension Definitions

| Code | Dimension | What it measures | Unit |
|---|---|---|---|
| p | Productivity | Time saved vs. doing the same task without the tool | Subjective 0–10 |
| q | Quality | Output accuracy, completeness, and coherence improvement | Subjective 0–10 |
| c | Cost Efficiency | Token and API cost per unit of useful output | Objective when possible |
| r | Reliability | Consistency across runs; graceful failure handling | Measured over N runs |
| x | Composability | Integration with the broader MCP/Claude Code stack | Subjective 0–10 |
| f | Setup Friction | Time from install to first working result | Measured in minutes |

### 5.3 Score Freshness Thresholds

| State | Condition | Display Treatment |
|---|---|---|
| current | Last evaluation <90 days ago | Normal display |
| aging | 90–180 days since last evaluation | [AGING] badge in amber |
| stale | 180+ days since last evaluation | [STALE] badge in orange; de-emphasised |
| historical | Tool is archived or deprecated | [HISTORICAL] badge in grey; excluded from recommendations |

---

## 6. Category Taxonomy

| ID | Name | Inclusion Criteria |
|---|---|---|
| mcp-server | MCP Servers | Implements Model Context Protocol; connectable to Claude agent |
| claude-plugin | Claude Code Plugins | Skills, hooks, slash-commands, or sub-agents for Claude Code |
| claudemd-framework | CLAUDE.md Frameworks | Collections of CLAUDE.md templates or context engineering patterns |
| orchestration | Orchestration Frameworks | Multi-agent coordination, task scheduling, complex workflow execution |
| prompt-library | Prompt Libraries | Curated reusable system prompts or role-specific instruction templates |
| sdk-pattern | Agent SDK Patterns | Code libraries or patterns built on the Claude Agent SDK |
| ide-integration | IDE Integrations | VS Code or JetBrains extensions for agentic workflows |
| eval-observability | Evaluation & Observability | Agent evaluation, cost monitoring, trace viewing, LLM judging |
| complementary | Complementary Tools | Non-Claude-native tools widely used in agentic workflows |

---

## 7. File Naming Conventions

```
Tool profiles:      data/tools/[id].yaml
                    Example: data/tools/gh-wshobson-agents.yaml

Evaluations:        data/evaluations/[tool-id]-[YYYY-MM-DD]-[n].yaml
                    Example: data/evaluations/gh-wshobson-agents-2026-03-10-1.yaml
                    n disambiguates multiple evaluations on the same day

Versus pages:       data/versus/[id1]-vs-[id2].md
                    Convention: alphabetical order of IDs
                    Example: data/versus/gh-agentsys-vs-gh-wshobson-agents.md

Benchmark tasks:    data/benchmarks/tasks/T[NN]/
                    Example: data/benchmarks/tasks/T01/input/legacy_processor.py

Digests:            data/digests/YYYY-MM-DD.md
                    Example: data/digests/2026-03-31.md
                    Draft: data/digests/2026-03-31-draft.md (deleted after send)
```