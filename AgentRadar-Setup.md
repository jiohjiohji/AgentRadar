# AgentRadar — Complete Development System Setup
# Version: 1.0 | March 2026
#
# INSTRUCTIONS FOR CLAUDE CODE:
# Read this entire file before executing anything.
# Execute each section in order. Do not skip sections.
# After completing each section, confirm it is done before moving to the next.
# If a step fails, stop and report the error — do not improvise a fix and continue.
# Apply Musk Rule 2 throughout: if a step seems unnecessary, flag it rather than skipping silently.

---

## SECTION 0 — PRE-FLIGHT CHECKS

Before anything else, verify the environment is ready.

### 0.1 Required Tools
Run each check and report status:

```bash
# Check Node.js (required for CLI tools)
node --version   # Must be ≥18.0.0

# Check Python (required for crawlers and validation)
python3 --version   # Must be ≥3.11

# Check Git
git --version   # Any recent version

# Check npm
npm --version   # Must be ≥9.0.0

# Check if Claude Code is authenticated
claude --version
```

If any check fails, stop and report. Do not proceed.

### 0.2 Directory Structure
Create the project root. All subsequent steps execute from inside this directory.

```bash
mkdir -p agentRadar
cd agentRadar
git init
echo "# AgentRadar" > README.md
git add README.md
git commit -m "chore: project initialisation"
```

---

## SECTION 1 — INSTALL OPEN SOURCE TOOLS

Apply Musk Rule 1 to each install: it is here because it solves a specific problem.
Install in this order. Each tool must be verified before the next is installed.

### 1.1 `claude-context-mode` — Context compression (98% token reduction)
Solves: Claude burning tokens re-reading files it already knows.

```bash
npm install -g claude-context-mode

# Verify
npx claude-context-mode --version
```

### 1.2 `tdd-guard` — Automated test enforcement
Solves: Gemini writing code that looks right but breaks in integration.

```bash
npm install -g tdd-guard

# Verify
tdd-guard --version
```

### 1.3 `agnix` — Configuration linter
Solves: AGENTS.md, CLAUDE.md, and skills degrading silently over time.

```bash
npm install -g agnix

# Verify
agnix --version
```

### 1.4 MCP Multiplexer — Tool context reduction (60 tools → 7 meta-tools)
Solves: MCP server definitions consuming large amounts of context window.

```bash
npm install -g @rohitg00/mcp-multiplexer

# Verify
npx @rohitg00/mcp-multiplexer --version
```

### 1.5 Clone TÂCHES (skill-auditor only)
Solves: skills accumulating and degrading without anyone noticing.

```bash
git clone https://github.com/taches-dev/claude-code-resources.git /tmp/taches-source
# We will copy only the skill-auditor component in Section 4
```

If the TÂCHES repo URL has changed, search for "TÂCHES Claude Code skill-auditor" and use the current URL.

---

## SECTION 2 — CREATE THE FIVE GOVERNING FILES

These five files are the operating system for the entire development system.
They must be created before any skills, commands, or project code.
Claude reads all five at the start of every session.

### 2.1 `AGENTS.md` — The Cross-Tool Constitution

Create this file at the project root with exactly the following content:

```bash
cat > AGENTS.md << 'HEREDOC'
# AgentRadar Agent Constitution
# Version: 1.0 | Created: [TODAY_DATE]
# READ THIS BEFORE EVERY ACTION. EVERY RULE HERE EXISTS BECAUSE SOMETHING WENT WRONG.

---

## MODEL ROUTING — READ FIRST

Every task must be assigned to the cheapest model that can handle it adequately.
Never use a more expensive model when a cheaper one is sufficient.

| Task Type | Model | Cost |
|---|---|---|
| Generate YAML tool profiles | Gemini 3 Flash (Antigravity) | Free |
| Write Python scripts and tests | Gemini 3 Flash | Free |
| Write TypeScript / CLI code | Gemini 3 Flash | Free |
| Write markdown (versus pages, docs) | Gemini 3 Flash | Free |
| Multi-file parallel feature work | Gemini 3.1 Pro (Antigravity) | Free |
| Complex debugging across files | Gemini 3.1 Pro | Free |
| Browser testing / UI verification | Gemini 3.1 Pro | Free |
| Schema design decisions | Claude Opus (Claude Code Max) | $$ |
| Review Gemini output for correctness | Claude Opus | $$ |
| Quality gate review | Claude Opus | $$ |
| Architecture disputes | Claude Opus | $$ |
| Update AGENTS.md / CLAUDE.md | Claude Opus | $$ |

TARGET RATIO: 85% Gemini (free) / 15% Claude (paid).
Claude Code Max is the quality control budget, not the generation budget.

---

## PROJECT ARCHITECTURE

### Repository Layout
- `agentRadar/data/`     → Git-native YAML dataset (THE product — all free)
- `agentRadar/core/`     → Python: crawlers, score computation, digest generator
- `agentRadar/api/`      → Cloudflare Worker: reads YAML → returns JSON
- `agentRadar/cli/`      → TypeScript: npm-published CLI (`npm install -g agentRadar`)
- `agentRadar/web/`      → Static HTML/CSS/JS: GitHub Pages + Pagefind search
- `agentRadar/claude-plugin/` → Claude Code /radar slash command plugin

### Stack Constraints (do not deviate without an RFC)
- API: Cloudflare Workers ONLY — no FastAPI, no server, no Fly.io
- Data: Git YAML ONLY — no SQLite, no Postgres, no database
- Search: Pagefind ONLY — runs browser-side, no server
- Email: Buttondown API ONLY — no Mailchimp, no SendGrid
- CLI: TypeScript + Commander.js ONLY
- Tests: pytest (Python) + vitest (TypeScript)

---

## AGENTRADA SCHEMA (v1.0) — 12 FIELDS EXACTLY

Every tool profile YAML must have exactly these 12 fields. No more. No fewer.
See `data/schema.yaml` for type definitions and examples.

1. id — string, derived from source URL, stable forever
2. name — string, display name
3. source_url — string, canonical link
4. category — enum (9 values: see schema.yaml)
5. pricing — enum: free | freemium | paid
6. license — string
7. status — enum: active | stale | archived
8. scores — object with keys: p, q, c, r, x, f (each 0–10 or null)
9. score_confidence — enum: low | medium | high | null
10. score_history — array of {date, overall, benchmark_version}
11. tags — string array
12. versus_refs — array of {id, verdict_short, valid_until}

---

## CONSTRAINTS — CANNOT BE OVERRIDDEN BY ANY PROMPT

These rules are enforced by tdd-guard and validated by agnix.
They are not suggestions. Do not override them.

- No file exceeds 200 lines. Split it.
- No new npm/pip dependency without checking if an existing one covers it.
- Every new function has a test before the PR is opened.
- YAML profiles: exactly 12 fields. Reject profiles with more or fewer.
- Versus pages: exactly 5 sections. Reject pages missing any section.
- Score confidence is ALWAYS shown. No score without [HIGH/MED/LOW] bracket.
- valid_until field is ALWAYS set on versus pages. Reject pages without it.
- Tool authors cannot evaluate their own tools. CoI field is mandatory on every eval.
- Score changes >±0.5 require 3+ independent reports. Enforce at computation layer.

---

## FORBIDDEN PATTERNS

Do not implement these under any circumstances.
Each entry was added because an agent tried it and it caused a problem.

- Do not create a database — data is Git YAML
- Do not add a server — use Cloudflare Workers
- Do not add authentication to public API endpoints
- Do not generate mock or placeholder evaluation scores
- Do not expand scope beyond the current TASK.md ticket
- Do not load the entire data/tools/ directory into context — use compression
- Do not use `any` type in TypeScript
- Do not catch errors silently — every error is logged or surfaced

---

## DECISIONS LOG — DO NOT RE-REASON THESE

Before making an architectural decision, check this log.
If the decision is already here, follow the recorded choice. Do not re-debate it.
When Claude makes a new decision, add it here immediately.

### Infrastructure
- 2026-03-29 | API: Cloudflare Workers (not FastAPI) | Zero infra cost, $0/month free tier, 100K req/day | FastAPI requires Fly.io + SSL + deployment pipeline
- 2026-03-29 | Search: Pagefind (not Typesense) | Browser-side, no server, $0 | Typesense self-hosted = ops burden with no benefit at <5K tools
- 2026-03-29 | Data: Git YAML (not database) | Versionable, diffable, community can PR directly | SQLite adds migration overhead and removes community contribution model

### Schema
- 2026-03-29 | 12 fields maximum | Only fields reliably available for 90%+ of tools | v0 schema had 18 unreliable fields
- 2026-03-29 | score_confidence mandatory | Trust requires showing uncertainty | Optional confidence makes all scores look equally certain

### Evaluation
- 2026-03-29 | Min 2 reports before publishing score | 1 report can be a tool author gaming | Lower threshold destroys trustworthiness
- 2026-03-29 | CoI exclusion is structural (at API layer, not policy) | Policy-only enforcement will be ignored | Relying on contributor honesty alone is insufficient

---

## MUSK 5-RULES CHECKLIST
Apply before starting ANY task. Answer every question in TASK.md.

1. QUESTION: Who specifically asked for this? What breaks without it?
2. DELETE: What can be removed from the current codebase before we start?
3. SIMPLIFY: What is the minimum version that solves the actual problem?
4. ACCELERATE: What slowed the last similar task? How do we prevent it?
5. AUTOMATE: What part of this task should never be manual again?
HEREDOC

echo "AGENTS.md created"
```

Replace `[TODAY_DATE]` with the actual current date.

---

### 2.2 `CLAUDE.md` — Claude Code's Focused Context

```bash
cat > CLAUDE.md << 'HEREDOC'
# AgentRadar — Claude Code Context
# Claude's role: QUALITY GATE ONLY. Review what Gemini built. Generate nothing.

## THIS SESSION
# Update these three lines at the start of every session:
Current task: [PASTE FROM TASK.md]
Files to review: [LIST SPECIFIC FILES — never "the whole project"]
Quality gate criteria: [WHAT MUST BE TRUE TO PASS]

## YOUR JOB IN EVERY SESSION
You are the quality gate. Gemini generates. You review.
Do not rewrite Gemini's code — flag it and let Gemini fix it.
Do not expand scope — stay within the files listed above.
Do not re-decide anything documented in AGENTS.md decisions log.
Do not load files not in the "Files to review" list above.

## WHAT TO OUTPUT
After reviewing the listed files, output exactly:
1. PASS or FAIL (one word, first line)
2. Bugs found (file name + line number + description)
3. Improvements (ordered by impact, max 5)
4. New DECISIONS.md entry (if a new architectural question arose)
5. New AGENTS.md FORBIDDEN PATTERNS entry (if a new antipattern was found)
6. New AGENTS.md AUTOMATION entry (if something should never be manual again)

## QUALITY STANDARDS (check every review)
- Schema compliance: exactly 12 fields in every YAML profile
- Anti-bias: tool authors not evaluating their own tools (check CoI field)
- Score confidence: always shown as [HIGH/MED/LOW]
- Versus page valid_until: always set (not null, not missing)
- Error handling: no silent catches — every error logged or surfaced
- Test coverage: happy path AND error path both tested
- File length: no file over 200 lines (flag for splitting)
- No new dependencies without justification

## CONTEXT COMPRESSION
context-mode is running. When you see [COMPRESSED: N files → summary],
request expansion for specific files using: @expand data/tools/[filename].yaml
Do not request full directory expansion. Request only what you need.

## READING ORDER FOR NEW SESSIONS
1. This file (CLAUDE.md) — already loaded
2. DECISIONS.md — what has already been decided
3. AGENTS.md — constraints and routing
4. TASK.md — current ticket
5. Only then: the specific files listed in "Files to review" above
HEREDOC

echo "CLAUDE.md created"
```

---

### 2.3 `TASK.md` — The Active Ticket Template

This file is replaced for every task. Create the template:

```bash
cat > TASK.md << 'HEREDOC'
# TASK: [TASK_NAME]
# Date: [DATE] | Phase: [0/1/2/3/4/5]
# Status: IN_PROGRESS | DONE
# Archived to: tasks/completed/[DATE]-[TASK_NAME].md when done

---

## MUSK 5-RULES PRE-CHECK
# Complete ALL FIVE before any agent starts work. No exceptions.

### Rule 1 — Is this requirement legitimate?
Who specifically asked for this: [name or "Phase N plan"]
What breaks without it: [specific answer]
Decision: PROCEED | DELETE

### Rule 2 — What can be deleted first?
Parts of the current codebase this task touches: [list or NONE]
What can be removed before we start: [list or NONE]
Minimum viable version of this task: [description]

### Rule 3 — Simplest implementation?
First instinct approach: [natural first thought]
Simpler approach: [what we should actually do]
Chosen approach: [chosen and why]

### Rule 4 — What slowed last time?
Check tasks/completed/ for similar tasks.
Blocker identified: [from history or NONE]
Prevention: [specific action or N/A]

### Rule 5 — What to automate?
Repeatable part of this task: [description or NONE]
Where the automation goes: [AGENTS.md skill / GitHub Action / script / slash command]

---

## TASK BREAKDOWN

### Gemini Agent Jobs (Antigravity Manager — run in parallel)
- [ ] Agent 1: [deliverable] | Acceptance: [testable criteria]
- [ ] Agent 2: [deliverable] | Acceptance: [testable criteria]
- [ ] Agent 3: [deliverable] | Acceptance: [testable criteria]
# Max 5 parallel agents. Each gets ONE job, not a list of jobs.

### tdd-guard Gate (automatic — no manual step needed)
- Tests pass: [test command, e.g. pytest tests/test_crawler.py]
- YAML validation: [python scripts/validate_yaml.py if applicable]
- Coverage ≥80%: [enforced by tdd-guard automatically]

### Claude Code Review (only AFTER tdd-guard passes)
Review files: [list specific files — NOT "the whole project"]
Quality gate: [what must be true to PASS]
Update AGENTS.md: YES | NO | [what to add]

---

## DONE WHEN
- [ ] All Gemini agent jobs complete
- [ ] tdd-guard gate: PASS
- [ ] Claude review: PASS
- [ ] DECISIONS.md updated (if new decision made)
- [ ] AGENTS.md updated (Rule 5 automation, new forbidden patterns)
- [ ] TASK.md status: DONE
- [ ] Archived: tasks/completed/[DATE]-[TASK_NAME].md
- [ ] Committed: git commit -m "[type]: [description]"
HEREDOC

mkdir -p tasks/completed
echo "TASK.md template created"
```

---

### 2.4 `RULES.md` — The Iteration Gate (Run After Every Task)

```bash
cat > RULES.md << 'HEREDOC'
# Post-Task Iteration Gate
# Claude Code: run this after every task, before merging.
# This is what makes the system self-improving. Do not skip it.

---

## Check 1 — Was everything in this PR actually necessary?
Review the git diff.
For each changed file: could this task have been done without this change?
If YES to any file: open a deletion PR before merging the feature PR.

## Check 2 — What can be deleted from what was just built?
Review every new function. Flag for deletion if: <2 callers AND no test exists.
Review every new dependency added in this session. Question each one.
Review every new constant or config value. Is it actually used?

## Check 3 — Is this the simplest version?
Could a developer unfamiliar with the project understand this code in 5 minutes?
If NO: flag for simplification. Do not merge complex code without a simplification ticket.

## Check 4 — What slowed this task down?
Document in tasks/completed/[task].md:
- What took longer than the TASK.md estimate
- What information was missing at the start (should it go in AGENTS.md?)
- What caused re-work (should this become a constraint in AGENTS.md?)

## Check 5 — What to automate from this task?
For any step that occurred more than once: add to AGENTS.md automation section.
For any repeated Gemini prompt pattern: create a new skill in .claude/skills/
For any repeated Claude review pattern: add the pattern to CLAUDE.md quality standards.
For any shell command run manually more than once: create a slash command.

---

## MERGE CRITERIA
Only commit and push when ALL of the following are true:
- [ ] Checks 1–5 completed and documented in tasks/completed/[task].md
- [ ] No unflagged deletion opportunities (or deletion ticket opened)
- [ ] No unflagged simplification opportunities (or simplification ticket opened)
- [ ] AGENTS.md updated with any new automations (Rule 5)
- [ ] tdd-guard still passing after any changes made during this review
HEREDOC

echo "RULES.md created"
```

---

### 2.5 `DECISIONS.md` — The Memory Layer

```bash
cat > DECISIONS.md << 'HEREDOC'
# Architectural Decisions Log
# Purpose: prevent re-reasoning the same questions. Claude reads this before every review.
# Format: Date | Decision | Context | Reasoning | Alternatives rejected

---

## HOW TO USE THIS FILE
Before making any architectural decision:
1. Search this file for the topic
2. If found: follow the recorded decision. Do not re-debate it.
3. If not found: make the decision, then add it here immediately.
Claude: if you find yourself reasoning about a topic already in this log, stop and follow the log.

---

## ACTIVE DECISIONS

### Infrastructure
2026-03-29 | API: Cloudflare Workers | Phase 0 | Zero infra cost; $0/month; 100K req/day free tier | FastAPI: requires Fly.io $15/mo + SSL + deployment pipeline + scaling decisions
2026-03-29 | Search: Pagefind | Phase 0 | Browser-side JS library; no server; $0; instant setup | Typesense: self-hosted = ops burden; Algolia: costs money; Elasticsearch: wildly overengineered
2026-03-29 | Data store: Git YAML | Phase 0 | Versionable; diffable; community can submit PRs directly; zero cost | SQLite: adds migration complexity; Postgres: requires a server; JSON: harder to diff

### Schema
2026-03-29 | 12-field maximum | Phase 0 | All 12 fields are reliably available for ≥90% of tools | 30-field schema: 18 fields had no reliable source; fields with null values in 50%+ of profiles are useless
2026-03-29 | score_confidence is mandatory, never null | Phase 0 | Trust requires displaying uncertainty; hiding confidence makes all scores look equally certain | Optional confidence: leads users to over-trust low-sample scores

### Evaluation
2026-03-29 | Minimum 2 reports before publishing score | Phase 0 | 1 report can be a tool author gaming the system | 1 report: too easily gamed; 3 reports: too slow to build dataset
2026-03-29 | CoI exclusion at API layer, not policy layer | Phase 0 | Code-enforced rules cannot be bypassed; policy-only rules will be ignored under pressure | Policy-only: relies on contributor honesty; insufficient for a trust-critical system

### Tooling
2026-03-29 | tdd-guard enforces tests before Claude review | Phase 0 | Eliminates an entire class of Claude review failures; saves Claude tokens on trivially broken code | Manual test enforcement: forgets; prompt-based enforcement: ignored when under time pressure
2026-03-29 | claude-context-mode for all review sessions | Phase 0 | 98% context reduction = 10x cheaper Claude sessions | Loading full data/ directory: burns context on files Claude doesn't need

---

## DEFERRED DECISIONS (do not implement — document why)
VS Code extension | Deferred Phase 2 | CLI must prove the data model first
Automated benchmark runner | Deferred Phase 2 | Community reports must establish baseline first
Enterprise tier | Deferred Phase 4 | Need 10+ Team accounts as reference customers first
Multi-agent orchestration framework | Deferred Phase 3 | Simpler Claude Code subagents sufficient until then
HEREDOC

echo "DECISIONS.md created"
```

---

## SECTION 3 — CONFIGURE THE TOOLS

### 3.1 Configure `claude-context-mode`

```bash
cat > .context-mode.yml << 'HEREDOC'
# claude-context-mode configuration for agentRadar
# Controls what Claude sees compressed vs full vs never

compress:
  - data/tools/             # Compress all YAMLs → summary index (tool count, categories)
  - data/evaluations/       # Compress evals → counts per tool only
  - data/digests/           # Claude never needs old digest content
  - node_modules/           # Never load

expand_on_demand:           # Claude requests specific files when it needs them
  - data/tools/*.yaml       # Individual profiles expanded on request
  - data/evaluations/*.yaml # Individual evals expanded on request

always_load:                # Always include these in full — Claude always needs them
  - data/schema.yaml        # Field definitions Claude checks against
  - AGENTS.md               # The constitution
  - DECISIONS.md            # The memory
  - CLAUDE.md               # Claude's current scope
  - TASK.md                 # The active ticket

never_load:
  - .git/
  - data/digests/
  - tasks/completed/        # Historical — load only if explicitly requested
  - .context-mode.yml       # Circular
HEREDOC

echo ".context-mode.yml created"
```

### 3.2 Configure `tdd-guard`

```bash
cat > .tdd-guard.yml << 'HEREDOC'
# tdd-guard configuration for agentRadar
# These are hard gates — agents cannot merge without passing them

require_tests: true
block_on_fail: true        # Prevents commit if tests fail

# Python test command (for core/ crawlers, scripts)
test_commands:
  python: "python -m pytest tests/ -v --tb=short --cov=core --cov-report=term-missing"
  typescript: "npm run test --prefix cli"

# Minimum test coverage before any commit
coverage_threshold: 80

# AgentRadar-specific file validators
file_validators:
  - match: "data/tools/*.yaml"
    command: "python scripts/validate_yaml.py {file}"
    error_message: "YAML profile failed schema validation. Check all 12 required fields."

  - match: "data/evaluations/*.yaml"
    command: "python scripts/validate_evaluation.py {file}"
    error_message: "Evaluation failed validation. Check CoI field and all required score fields."

  - match: "data/versus/*.md"
    command: "python scripts/validate_versus.py {file}"
    error_message: "Versus page failed validation. Check 5 required sections and valid_until field."

  - match: "api/worker.js"
    require_test_file: true
    test_path: "api/tests/test_worker.js"

  - match: "core/crawlers/*.py"
    require_test_file: true
    test_path_pattern: "tests/test_{filename}.py"
HEREDOC

echo ".tdd-guard.yml created"
```

### 3.3 Configure `agnix`

```bash
cat > .agnix.yml << 'HEREDOC'
# agnix configuration for agentRadar
# Validates all agent configuration files on every push

target: claude-code
strict: false              # Warnings don't block; errors do
auto_fix: true             # Fix simple issues automatically

rules:
  # CLAUDE.md rules
  claude_md_has_model_section: error
  claude_md_has_scope_section: error
  claude_md_no_wildcard_file_refs: error    # "review the whole project" is forbidden

  # AGENTS.md rules
  agents_md_has_routing_table: error
  agents_md_has_forbidden_patterns: error
  agents_md_has_decisions_log: warning

  # Skill rules
  skill_md_has_trigger_description: error  # Every skill must say when to fire
  skill_md_has_acceptance_criteria: warning
  skill_references_exist: error            # No broken references/ paths

  # Hook rules
  hooks_have_error_handling: error
  hooks_not_blocking_on_network: warning   # Hooks should not make network calls

output_format: pretty      # Use 'sarif' for GitHub Actions integration
HEREDOC

echo ".agnix.yml created"
```

### 3.4 Configure Claude Code MCP Servers

```bash
# Create or update Claude Code settings to add MCP servers
mkdir -p ~/.claude

cat > ~/.claude/settings.json << 'HEREDOC'
{
  "mcpServers": {
    "context-mode": {
      "command": "npx",
      "args": ["claude-context-mode", "--config", ".context-mode.yml"],
      "description": "Compresses project context to reduce token usage"
    },
    "mcp-multiplexer": {
      "command": "npx",
      "args": ["@rohitg00/mcp-multiplexer", "start"],
      "description": "Aggregates all MCP servers behind 7 meta-tools"
    }
  },
  "model": "claude-opus-4-6",
  "defaultModel": "claude-opus-4-6"
}
HEREDOC

echo "Claude Code MCP settings configured"
```

### 3.5 Configure GitHub Actions for CI Validation

```bash
mkdir -p .github/workflows

cat > .github/workflows/validate.yml << 'HEREDOC'
name: Validate Agent Config & Data

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate-config:
    name: Lint Agent Configuration
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g agnix
      - run: agnix --format sarif > results.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: results.sarif

  validate-yaml:
    name: Validate YAML Profiles
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install pyyaml jsonschema
      - run: |
          if [ -d "data/tools" ]; then
            python scripts/validate_yaml.py data/tools/
          fi

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - run: python -m pytest tests/ -v --tb=short --cov=core --cov-fail-under=80
HEREDOC

echo "GitHub Actions workflow created"
```

---

## SECTION 4 — CREATE PROJECT STRUCTURE

### 4.1 Data Repository Structure

```bash
mkdir -p data/tools
mkdir -p data/evaluations
mkdir -p data/versus
mkdir -p data/benchmarks
mkdir -p data/digests
mkdir -p scripts

# Create the schema file — Claude reads this in every review session
cat > data/schema.yaml << 'HEREDOC'
# AgentRadar Tool Profile Schema v1.0
# Every tool in data/tools/*.yaml must conform to this schema exactly.
# 12 fields. No more. No fewer.

schema_version: "1.0"

fields:
  id:
    type: string
    required: true
    description: "Unique stable identifier. Derived from source URL. Never changes."
    example: "gh-wshobson-agents"
    pattern: "^[a-z0-9-]+$"

  name:
    type: string
    required: true
    description: "Human-readable display name."
    example: "Claude Code Agents"

  source_url:
    type: string
    required: true
    description: "Canonical link to the tool. Most important field."
    example: "https://github.com/wshobson/agents"

  category:
    type: enum
    required: true
    values: [mcp-server, claude-plugin, claudemd-framework, orchestration, prompt-library, sdk-pattern, ide-integration, eval-observability, complementary]
    description: "Primary classification used for versus page matching and search."

  pricing:
    type: enum
    required: true
    values: [free, freemium, paid]
    description: "First question every developer asks."

  license:
    type: string
    required: true
    description: "Enterprise gating requirement."
    example: "MIT"
    allow_null: true

  status:
    type: enum
    required: true
    values: [active, stale, archived]
    description: "Computed from last_commit age. active:<60d, stale:60-180d, archived:>180d"

  scores:
    type: object
    required: true
    allow_null: true
    description: "Null until 2 independent community reports exist. Never invent scores."
    properties:
      p: {type: number, min: 0, max: 10, description: "Productivity"}
      q: {type: number, min: 0, max: 10, description: "Quality"}
      c: {type: number, min: 0, max: 10, description: "Cost Efficiency"}
      r: {type: number, min: 0, max: 10, description: "Reliability"}
      x: {type: number, min: 0, max: 10, description: "Composability"}
      f: {type: number, min: 0, max: 10, description: "Setup Friction"}

  score_confidence:
    type: enum
    required: true
    allow_null: true
    values: [low, medium, high]
    description: "low:<3 reports, medium:3-9, high:10+. NEVER hide this. NEVER display score without it."

  score_history:
    type: array
    required: true
    description: "Append-only. Never delete entries."
    items:
      date: string (YYYY-MM-DD)
      overall: number
      benchmark_version: string

  tags:
    type: array
    required: true
    items: string
    description: "Used for versus page auto-matching and search filtering."

  versus_refs:
    type: array
    required: true
    description: "Links to head-to-head comparison pages."
    items:
      id: string
      verdict_short: string
      valid_until: string (YYYY-MM-DD)

# ANTI-BIAS RULES (enforced by validate_yaml.py)
anti_bias:
  - "Tool authors cannot evaluate their own tools. CoI field is mandatory on every evaluation."
  - "Score changes >±0.5 require 3+ independent data points."
  - "All tools in a category run identical benchmark tasks."
  - "valid_until must be set on all versus_refs entries."
HEREDOC

echo "data/schema.yaml created"
```

### 4.2 Validation Scripts

```bash
cat > scripts/validate_yaml.py << 'HEREDOC'
#!/usr/bin/env python3
"""
Validates tool profile YAML files against the AgentRadar schema.
Called by tdd-guard on every YAML commit.
Called by GitHub Actions on every PR.
"""
import sys
import yaml
import json
from pathlib import Path

REQUIRED_FIELDS = ['id', 'name', 'source_url', 'category', 'pricing',
                   'license', 'status', 'scores', 'score_confidence',
                   'score_history', 'tags', 'versus_refs']

VALID_CATEGORIES = ['mcp-server', 'claude-plugin', 'claudemd-framework',
                    'orchestration', 'prompt-library', 'sdk-pattern',
                    'ide-integration', 'eval-observability', 'complementary']

VALID_PRICING = ['free', 'freemium', 'paid']
VALID_STATUS = ['active', 'stale', 'archived']
VALID_CONFIDENCE = ['low', 'medium', 'high', None]
SCORE_KEYS = ['p', 'q', 'c', 'r', 'x', 'f']


def validate_file(filepath: Path) -> list[str]:
    errors = []

    try:
        with open(filepath) as f:
            data = yaml.safe_load(f)
    except yaml.YAMLError as e:
        return [f"YAML parse error: {e}"]

    if not isinstance(data, dict):
        return ["Root element must be a YAML object/dict"]

    # Check field count
    actual_count = len(data.keys())
    if actual_count != 12:
        errors.append(f"Must have exactly 12 fields, found {actual_count}: {list(data.keys())}")

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    # Check enums
    if data.get('category') not in VALID_CATEGORIES:
        errors.append(f"Invalid category: {data.get('category')}. Must be one of: {VALID_CATEGORIES}")

    if data.get('pricing') not in VALID_PRICING:
        errors.append(f"Invalid pricing: {data.get('pricing')}")

    if data.get('status') not in VALID_STATUS:
        errors.append(f"Invalid status: {data.get('status')}")

    if data.get('score_confidence') not in VALID_CONFIDENCE:
        errors.append(f"Invalid score_confidence: {data.get('score_confidence')}")

    # Check scores structure (if not null)
    scores = data.get('scores')
    if scores is not None:
        if not isinstance(scores, dict):
            errors.append("scores must be an object or null")
        else:
            for key in SCORE_KEYS:
                if key not in scores:
                    errors.append(f"scores missing key: {key}")
                elif scores[key] is not None:
                    if not isinstance(scores[key], (int, float)):
                        errors.append(f"scores.{key} must be a number or null")
                    elif not (0 <= scores[key] <= 10):
                        errors.append(f"scores.{key} must be between 0 and 10")

    # Check versus_refs have valid_until
    versus_refs = data.get('versus_refs', [])
    if versus_refs:
        for ref in versus_refs:
            if not ref.get('valid_until'):
                errors.append(f"versus_ref for {ref.get('id')} missing valid_until field")

    return errors


def main():
    paths = sys.argv[1:]
    if not paths:
        # Validate all files if no specific file given
        paths = list(Path('data/tools').glob('*.yaml'))

    all_passed = True
    for path in paths:
        p = Path(path)
        if not p.exists():
            print(f"ERROR: {path} does not exist")
            all_passed = False
            continue

        errors = validate_file(p)
        if errors:
            print(f"\nFAIL: {path}")
            for error in errors:
                print(f"  - {error}")
            all_passed = False
        else:
            print(f"PASS: {path}")

    sys.exit(0 if all_passed else 1)


if __name__ == '__main__':
    main()
HEREDOC

chmod +x scripts/validate_yaml.py

cat > scripts/validate_evaluation.py << 'HEREDOC'
#!/usr/bin/env python3
"""Validates community evaluation YAML files."""
import sys
import yaml
from pathlib import Path

REQUIRED_FIELDS = ['tool_id', 'reporter_role', 'date_evaluated',
                   'claude_code_version', 'platform', 'task_performed',
                   'scores', 'verdict', 'conflict_of_interest']

VALID_COI = ['none', 'contributor']
REQUIRED_SCORE_KEYS = ['p', 'q', 'c', 'r', 'x', 'f']

def validate_file(filepath: Path) -> list[str]:
    errors = []
    with open(filepath) as f:
        data = yaml.safe_load(f)

    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    if data.get('conflict_of_interest') not in VALID_COI:
        errors.append(f"conflict_of_interest must be 'none' or 'contributor'")

    scores = data.get('scores', {})
    for key in REQUIRED_SCORE_KEYS:
        if key not in scores:
            errors.append(f"scores missing key: {key}")
        elif not isinstance(scores.get(key), dict) or 'value' not in scores[key] or 'evidence' not in scores[key]:
            errors.append(f"scores.{key} must have 'value' and 'evidence' fields")

    return errors

def main():
    paths = sys.argv[1:] or list(Path('data/evaluations').glob('*.yaml'))
    all_passed = True
    for path in paths:
        errors = validate_file(Path(path))
        if errors:
            print(f"FAIL: {path}")
            for e in errors: print(f"  - {e}")
            all_passed = False
        else:
            print(f"PASS: {path}")
    sys.exit(0 if all_passed else 1)

if __name__ == '__main__':
    main()
HEREDOC

chmod +x scripts/validate_evaluation.py

cat > scripts/validate_versus.py << 'HEREDOC'
#!/usr/bin/env python3
"""Validates versus page markdown files for required sections and valid_until."""
import sys
import re
from pathlib import Path

REQUIRED_SECTIONS = [
    'Quick Answer',
    'Score Comparison',
    'Community Verdicts',
    'Use Cases',
    'Methodology'
]

def validate_file(filepath: Path) -> list[str]:
    errors = []
    content = filepath.read_text()

    for section in REQUIRED_SECTIONS:
        if f'## {section}' not in content and f'# {section}' not in content:
            errors.append(f"Missing required section: {section}")

    if 'valid_until:' not in content:
        errors.append("Missing valid_until frontmatter field")

    valid_until_match = re.search(r'valid_until:\s*(\d{4}-\d{2}-\d{2})', content)
    if not valid_until_match:
        errors.append("valid_until must be in YYYY-MM-DD format")

    return errors

def main():
    paths = sys.argv[1:] or list(Path('data/versus').glob('*.md'))
    all_passed = True
    for path in paths:
        errors = validate_file(Path(path))
        if errors:
            print(f"FAIL: {path}")
            for e in errors: print(f"  - {e}")
            all_passed = False
        else:
            print(f"PASS: {path}")
    sys.exit(0 if all_passed else 1)

if __name__ == '__main__':
    main()
HEREDOC

chmod +x scripts/validate_versus.py

echo "Validation scripts created"
```

---

## SECTION 5 — CREATE SKILLS AND COMMANDS

Skills are reusable agent capabilities. Commands are shortcut triggers.
These are created once and reused across every session.

### 5.1 Directory Structure

```bash
mkdir -p .claude/skills/yaml-profile/references
mkdir -p .claude/skills/eval-report/references
mkdir -p .claude/skills/versus-page/references
mkdir -p .claude/skills/musk-review/references
mkdir -p .claude/commands
```

### 5.2 Skill: yaml-profile

```bash
cat > .claude/skills/yaml-profile/SKILL.md << 'HEREDOC'
---
name: yaml-profile
description: "Use when generating a new tool profile YAML file. Trigger: when asked to add a tool to the dataset, research a tool, or create a profile for any Claude Code or MCP tool."
---

# yaml-profile Skill

## Purpose
Generate a valid, complete AgentRadar tool profile YAML conforming to schema v1.0.

## BEFORE GENERATING ANYTHING
1. Read data/schema.yaml for exact field requirements
2. Read references/good-example.yaml to understand the expected quality
3. Research the tool at its source URL — do not invent any field values
4. If a field value cannot be confirmed from the source, set it to null

## GENERATION PROCESS
1. Visit the tool's source_url
2. Extract: name, category, pricing, license, last commit date (→ status)
3. Set scores: null (no evaluation yet — never invent scores)
4. Set score_confidence: null (same reason)
5. Set score_history: [] (empty array)
6. Set tags: 3–7 tags based on the tool's actual capabilities
7. Set versus_refs: [] (empty — filled later when versus pages are created)
8. Generate the id: lowercase, hyphen-separated, derived from source URL

## AFTER GENERATING
1. Run: python scripts/validate_yaml.py data/tools/[generated-file].yaml
2. Fix any validation errors
3. Only report DONE when validation passes with zero errors

## GOTCHAS (common failure points)
- scores must be null if there are fewer than 2 independent evaluations — never invent scores
- status must be computed from last_commit date: active <60d, stale 60–180d, archived >180d
- id must match the filename without .yaml extension
- category must be one of the 9 valid values in schema.yaml — check before setting
- versus_refs requires valid_until date on every entry — but start empty, don't add nulls
HEREDOC

# Create a good example profile for reference
cat > .claude/skills/yaml-profile/references/good-example.yaml << 'HEREDOC'
# Example of a correctly formatted tool profile
# All 12 required fields present. Scores are null (not yet evaluated).

id: "gh-wshobson-agents"
name: "Claude Code Agents"
source_url: "https://github.com/wshobson/agents"
category: orchestration
pricing: free
license: MIT
status: active
scores: null
score_confidence: null
score_history: []
tags:
  - multi-agent
  - orchestration
  - workflow
  - claude-code-native
  - skills
versus_refs: []
HEREDOC

echo "yaml-profile skill created"
```

### 5.3 Skill: eval-report

```bash
cat > .claude/skills/eval-report/SKILL.md << 'HEREDOC'
---
name: eval-report
description: "Use when processing, validating, or formatting a community evaluation report. Trigger: when a user submits an evaluation via GitHub issue, when asked to add an evaluation to the dataset, or when reviewing evaluation quality."
---

# eval-report Skill

## Purpose
Process community evaluation submissions into valid YAML evaluation records.

## CONFLICT OF INTEREST CHECK — DO THIS FIRST
Before processing any evaluation:
1. Check if the reporter is listed as a contributor to the tool being evaluated
2. If YES: flag the evaluation with conflict_of_interest: contributor
3. Conflict-of-interest evaluations are NOT excluded — they are FLAGGED
4. The score computation script excludes flagged evaluations automatically
5. Never ask the reporter to re-submit — just flag and continue

## REQUIRED FIELDS FOR EVERY EVALUATION
All 9 fields must be present. No exceptions.

- tool_id: matches an existing id in data/tools/
- reporter_role: "solo-developer" | "small-team" | "enterprise-dev"
- date_evaluated: YYYY-MM-DD format
- claude_code_version: e.g. "2.1.77"
- platform: "macos" | "linux" | "windows-wsl"
- task_performed: description of what was actually tested
- scores: object with keys p, q, c, r, x, f — each with value (0–10) AND evidence (one sentence)
- verdict: one sentence summary — the most important field, used in versus pages
- conflict_of_interest: "none" | "contributor"

## SCORE EVIDENCE REQUIREMENT
Every score must include a one-sentence evidence string.
"I think it's good" is not evidence.
"Saved 40 minutes on a 200-line refactor task vs doing it manually" is evidence.
Reject evaluations where evidence strings are vague or missing.

## AFTER PROCESSING
Run: python scripts/validate_evaluation.py data/evaluations/[file].yaml
Fix any errors. Report DONE only when validation passes.

## GOTCHAS
- Never invent or estimate score values — they must come from the reporter
- Evidence strings must be specific and measurable when possible
- A "verdict" that is vague ("it's great") should be sent back for revision
- File naming: data/evaluations/[tool-id]-[YYYY-MM-DD]-[N].yaml where N disambiguates same-day evals
HEREDOC

echo "eval-report skill created"
```

### 5.4 Skill: versus-page

```bash
cat > .claude/skills/versus-page/SKILL.md << 'HEREDOC'
---
name: versus-page
description: "Use when creating a head-to-head comparison page for two tools. Trigger: when asked to compare two tools, when two tools have 5+ overlapping evaluations, or when /new-versus command is run."
---

# versus-page Skill

## Purpose
Generate a trustworthy head-to-head comparison between two AgentRadar tools.

## PRE-CONDITIONS — CHECK BEFORE STARTING
Both tools must have:
- At least 2 independent community evaluations each
- A valid score with at least score_confidence: low
If either tool lacks evaluations: do not generate the page. Report what's missing.

## ANTI-BIAS REQUIREMENTS — NON-NEGOTIABLE
Read anti-bias-charter.md before writing anything.
The Quick Answer section must be honest, including the "Neither when" bullet.
Do not write a Quick Answer that is effectively advertising for either tool.
If the evaluations show one tool is clearly worse for all use cases, say so.

## REQUIRED STRUCTURE — EXACTLY 5 SECTIONS
Every versus page must have all 5 of these sections in this order:

### 1. Quick Answer
Three bullets only:
- "Pick [Tool A] when: [specific condition]"
- "Pick [Tool B] when: [specific condition]"
- "Neither is right when: [specific condition — this one is important]"

### 2. Score Comparison
Side-by-side table of all 6 dimensions with confidence levels.
Include a "Notes" column with one sentence of context per dimension.
Show confidence bracket [HIGH/MED/LOW] on every score.

### 3. Community Verdicts
Top 3 one-sentence verdicts from actual evaluation reports.
Verdicts from conflicted evaluators are excluded.
Attribution: "— [reporter_role] in [month/year]"

### 4. Use Cases
Table: use case description | which tool handled it | token cost estimate | report count.
Only include verified use cases from evaluation reports.

### 5. Methodology
Links to all underlying evaluation reports.
Score version and evaluation dates.
Link to anti-bias charter.

## FRONTMATTER REQUIREMENT
Every versus page starts with:
---
tool_a: [tool-id]
tool_b: [tool-id]
created: YYYY-MM-DD
valid_until: YYYY-MM-DD    ← Set to 90 days from today. ALWAYS.
last_reviewed: YYYY-MM-DD
evaluation_count_a: [N]
evaluation_count_b: [N]
---

## AFTER GENERATING
Run: python scripts/validate_versus.py data/versus/[file].md
Fix any errors. Report DONE only when validation passes.

## GOTCHAS
- valid_until MUST be set — this is the staleness detection trigger
- The "Neither when" bullet is the hardest to write and the most important — do not skip it
- Never write a score without its confidence bracket
- If evaluations are <90 days old AND scores might change significantly, note this in Methodology
HEREDOC

cat > .claude/skills/versus-page/references/anti-bias-charter.md << 'HEREDOC'
# Anti-Bias Charter for Versus Pages
# Every versus page author must read this before writing.

## The Seven Rules (all mandatory)

1. Tool authors cannot author, vote on, or dispute evaluations of their own tools.
   Structural enforcement: CoI-flagged evaluations excluded at API layer.

2. Score changes >±0.5 require 3+ independent data points before update is published.
   Structural enforcement: score computation script rejects if delta >0.5 and count <3.

3. All tools in a category run identical benchmark tasks. No custom tasks per tool.
   Structural enforcement: benchmark task IDs are category-scoped.

4. Benchmark task changes require a 14-day public RFC + full category re-evaluation.

5. Confidence level [HIGH/MED/LOW] is shown on every score, always.
   Structural enforcement: API returns confidence alongside every score value.

6. Score history is permanently public. Append-only. Never deleted.

7. Every versus page carries a valid_until date. Expired pages show REVIEW PENDING banner.

## The Honest Test
Before publishing any versus page, ask:
- Would the losing tool's author consider this comparison fair?
- Is the "Neither when" bullet genuinely useful (not a throwaway)?
- Are all score differences explained, not just stated?
- Would you recommend this comparison to a developer you respect?

If any answer is NO, revise before publishing.
HEREDOC

echo "versus-page skill created"
```

### 5.5 Skill: musk-review (The Self-Iteration Mechanic)

```bash
cat > .claude/skills/musk-review/SKILL.md << 'HEREDOC'
---
name: musk-review
description: "Use at the END of every task, before archiving TASK.md. Trigger: when the /iterate command is run, or when told 'task is done, run iteration review'. This is the self-improvement mechanic — it updates AGENTS.md automatically."
---

# musk-review Skill

## Purpose
Apply Musk's 5 Rules to the completed task output and update AGENTS.md.
This is what makes the system self-improving. Run it every time.

## PROCESS

### Check 1 — Was everything in this PR actually necessary?
Review the git diff since the task started.
For each changed file: was this change required to complete the task?
If NO: open a deletion ticket before committing. Log in TASK.md.

### Check 2 — What can be deleted?
Review every new function. Flag for deletion if: fewer than 2 callers AND no test exists.
Review every new dependency. Was it already available through an existing dependency?
Review every new constant. Is it actually used more than once?

### Check 3 — Is this the simplest version?
Could a developer new to the project understand this code in 5 minutes?
If NO: flag for simplification. Add a simplification ticket.

### Check 4 — What slowed this task down?
Compare actual time to the TASK.md estimate (if one was made).
What information was missing at the start? → Add to AGENTS.md if it should always be pre-loaded.
What caused re-work? → Add to AGENTS.md FORBIDDEN PATTERNS.

### Check 5 — What to automate?
For any step that happened more than once manually: add to the appropriate place:
- Repeated Gemini prompt pattern → new skill in .claude/skills/
- Repeated Claude review pattern → new line in CLAUDE.md quality standards
- Repeated shell command → new slash command in .claude/commands/
- Repeated architectural question → new entry in DECISIONS.md
- New constraint discovered → new entry in AGENTS.md FORBIDDEN PATTERNS

## OUTPUT FORMAT
After completing all 5 checks, output:

```
MUSK REVIEW — [TASK_NAME] — [DATE]

CHECK 1 (Necessary?): [PASS | FLAG: description]
CHECK 2 (Delete?): [PASS | DELETE: what and why]
CHECK 3 (Simple?): [PASS | SIMPLIFY: what and why]
CHECK 4 (Speed?): [bottleneck identified and where it was logged]
CHECK 5 (Automate?): [what was added to AGENTS.md/skills/commands or NONE]

AGENTS.MD UPDATES MADE:
- [list each update]

TASK STATUS: READY TO ARCHIVE | BLOCKED ON: [what]
```

## AGENTS.MD UPDATE FORMAT
When adding new content to AGENTS.md, use this format:

For FORBIDDEN PATTERNS:
`- Do not [specific antipattern] — [because what happened when we did]`

For AUTOMATION (new skills/commands):
`- [Trigger]: run [skill/command name] — [what it prevents manually]`

For DECISIONS LOG:
`[DATE] | [decision] | [context] | [reasoning] | [alternatives rejected]`

## GOTCHAS
- Check 5 is the most important. Every task should produce at least one automation.
- If Check 5 produces nothing, it means the task was fully routine. That is good.
- Do not add trivial items to AGENTS.md — only things that will save meaningful time.
- The goal is that the same task takes fewer Claude tokens each time it is run.
HEREDOC

echo "musk-review skill created"
```

### 5.6 Create Slash Commands

```bash
cat > .claude/commands/new-tool.md << 'HEREDOC'
# /new-tool command
# Usage: /new-tool [source-url]
# Creates a new validated tool profile in data/tools/

1. Load the yaml-profile skill
2. Research the tool at the provided source URL
3. Generate the YAML profile using the skill
4. Run validation: python scripts/validate_yaml.py
5. Report: PASS with file path, or FAIL with specific errors
HEREDOC

cat > .claude/commands/new-eval.md << 'HEREDOC'
# /new-eval command
# Usage: /new-eval [tool-id]
# Processes a community evaluation and creates a validated eval record

1. Load the eval-report skill
2. Ask for the evaluation details if not provided
3. Check conflict of interest before processing
4. Generate the evaluation YAML using the skill
5. Run validation: python scripts/validate_evaluation.py
6. Trigger score recomputation: python scripts/compute_scores.py [tool-id]
7. Report: PASS with file path, or FAIL with specific errors
HEREDOC

cat > .claude/commands/new-versus.md << 'HEREDOC'
# /new-versus command
# Usage: /new-versus [tool-id-1] [tool-id-2]
# Creates a validated versus page for two tools

1. Verify both tools have ≥2 independent evaluations each
2. If not: report what is missing and stop
3. Load the versus-page skill
4. Read anti-bias-charter.md before writing
5. Generate the versus page
6. Run validation: python scripts/validate_versus.py
7. Report: PASS with file path, or FAIL with specific errors
HEREDOC

cat > .claude/commands/iterate.md << 'HEREDOC'
# /iterate command
# Usage: /iterate
# Run at the end of every task. Updates AGENTS.md. Archives TASK.md.

1. Load the musk-review skill
2. Review the current git diff
3. Apply all 5 checks
4. Update AGENTS.md with any new automations, forbidden patterns, or decisions
5. Update DECISIONS.md if a new architectural decision was made
6. Set TASK.md status to DONE
7. Archive: cp TASK.md tasks/completed/[DATE]-[TASK_NAME].md
8. Commit: git add -A && git commit -m "chore: complete [TASK_NAME] + iteration review"
HEREDOC

cat > .claude/commands/health.md << 'HEREDOC'
# /health command
# Usage: /health
# Runs a full system health check before starting work

1. Run: agnix --fix (fix config issues)
2. Run: python -m pytest tests/ --tb=short -q (check tests pass)
3. Run: python scripts/validate_yaml.py data/tools/ (check all profiles)
4. Check context-mode is running (look for MCP server in settings)
5. Check tdd-guard is configured (.tdd-guard.yml exists)
6. Report: summary of all checks with PASS/WARN/FAIL status
HEREDOC

echo "Slash commands created"
```

### 5.7 Install TÂCHES skill-auditor

```bash
# Copy only the skill-auditor from the cloned TÂCHES repo
# Adjust the source path based on actual TÂCHES repo structure

if [ -d "/tmp/taches-source" ]; then
    # Look for skill-auditor in the cloned repo
    AUDITOR_PATH=$(find /tmp/taches-source -name "*skill*auditor*" -type d 2>/dev/null | head -1)
    if [ -n "$AUDITOR_PATH" ]; then
        cp -r "$AUDITOR_PATH" .claude/skills/skill-auditor
        echo "TÂCHES skill-auditor installed"
    else
        echo "WARN: skill-auditor not found in expected location in TÂCHES repo"
        echo "ACTION REQUIRED: Manually locate and copy the skill-auditor skill from the TÂCHES repo"
        echo "Continuing without skill-auditor — add it manually when found"
    fi
else
    echo "WARN: TÂCHES repo not available — skill-auditor not installed"
    echo "ACTION REQUIRED: Install manually from https://github.com/taches-dev/claude-code-resources"
fi

# Create the quarterly audit command regardless
cat > .claude/commands/audit-skills.md << 'HEREDOC'
# /audit-skills command
# Usage: /audit-skills
# Run quarterly to review and prune the skills library

1. List all skills in .claude/skills/
2. For each skill: check if it has been used in the last 30 days (check TASK.md history)
3. Flag unused skills for review
4. Check for conflicting rules between skills
5. Check for rules in skills that duplicate rules in AGENTS.md (remove duplicates)
6. Run agnix to validate all skill SKILL.md files
7. Report: which skills are healthy, which need revision, which should be archived
HEREDOC
```

---

## SECTION 6 — CREATE PROJECT FILES

### 6.1 Python Requirements

```bash
cat > requirements.txt << 'HEREDOC'
# Core dependencies for agentRadar/core
pyyaml>=6.0
requests>=2.31.0
python-dateutil>=2.8.0
click>=8.1.0

# GitHub API
PyGithub>=2.1.0

# Newsletter / digest
# (Buttondown API is called via requests — no SDK needed)

# Testing
pytest>=7.4.0
pytest-cov>=4.1.0
pytest-mock>=3.11.0
responses>=0.23.0   # Mock HTTP requests in tests
HEREDOC

mkdir -p tests
cat > tests/__init__.py << 'HEREDOC'
# Test suite for agentRadar/core
HEREDOC

echo "requirements.txt and tests/ created"
```

### 6.2 CLI Package Setup

```bash
mkdir -p cli/src

cat > cli/package.json << 'HEREDOC'
{
  "name": "agentRadar",
  "version": "0.1.0",
  "description": "CLI for discovering and comparing Claude Code and MCP agentic workflow tools",
  "bin": {
    "agentRadar": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "axios": "^1.6.0",
    "chalk": "^5.3.0",
    "cli-table3": "^0.6.3",
    "ora": "^8.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "license": "MIT"
}
HEREDOC

cat > cli/tsconfig.json << 'HEREDOC'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
HEREDOC

echo "CLI package structure created"
```

### 6.3 GitHub Issue Templates (Community Contribution Forms)

```bash
mkdir -p .github/ISSUE_TEMPLATE

cat > .github/ISSUE_TEMPLATE/tool-submission.yml << 'HEREDOC'
name: Tool Submission
description: Submit a new Claude Code or MCP tool for the AgentRadar dataset
title: "[TOOL] "
labels: ["tool-submission", "needs-triage"]
body:
  - type: input
    id: source_url
    attributes:
      label: Source URL
      description: The canonical URL for this tool (GitHub repo, npm page, etc.)
    validations:
      required: true

  - type: dropdown
    id: category
    attributes:
      label: Category
      options:
        - mcp-server
        - claude-plugin
        - claudemd-framework
        - orchestration
        - prompt-library
        - sdk-pattern
        - ide-integration
        - eval-observability
        - complementary
    validations:
      required: true

  - type: dropdown
    id: pricing
    attributes:
      label: Pricing
      options:
        - free
        - freemium
        - paid
    validations:
      required: true

  - type: textarea
    id: why_useful
    attributes:
      label: Why is this useful?
      description: One paragraph. Be specific about the problem it solves.
    validations:
      required: true

  - type: checkboxes
    id: conflict_of_interest
    attributes:
      label: Conflict of Interest
      options:
        - label: I am the author or a contributor to this tool
          required: false
HEREDOC

cat > .github/ISSUE_TEMPLATE/evaluation-report.yml << 'HEREDOC'
name: Evaluation Report
description: Submit a structured evaluation of a tool you have used
title: "[EVAL] "
labels: ["evaluation", "needs-review"]
body:
  - type: input
    id: tool_id
    attributes:
      label: Tool ID
      description: The AgentRadar ID (e.g. gh-wshobson-agents) from data/tools/
    validations:
      required: true

  - type: dropdown
    id: reporter_role
    attributes:
      label: Your Role
      options:
        - solo-developer
        - small-team
        - enterprise-dev
    validations:
      required: true

  - type: input
    id: claude_code_version
    attributes:
      label: Claude Code Version
      description: Run `claude --version` to find this
    validations:
      required: true

  - type: dropdown
    id: platform
    attributes:
      label: Platform
      options:
        - macos
        - linux
        - windows-wsl
    validations:
      required: true

  - type: textarea
    id: task_performed
    attributes:
      label: Task Performed
      description: What specific task did you use this tool for? Be concrete.
    validations:
      required: true

  - type: textarea
    id: scores
    attributes:
      label: Scores (0–10 each with one sentence of evidence)
      description: |
        Format exactly like this:
        Productivity: 8 — Saved ~40 minutes on a 200-line refactor vs doing it manually
        Quality: 7 — Output matched gold standard on 6/8 test cases
        Cost Efficiency: 6 — Used ~6,200 tokens; baseline is ~4,100
        Reliability: 8 — Passed 5/5 runs with consistent output
        Composability: 9 — Integrated with existing Playwright MCP in under 10 minutes
        Setup Friction: 6 — 45 minutes to first working result; docs could be clearer
    validations:
      required: true

  - type: textarea
    id: verdict
    attributes:
      label: One-Sentence Verdict
      description: The most important field. Must be specific and opinionated.
      placeholder: "Best choice for teams who want multi-agent without writing their own orchestration — worth the setup time."
    validations:
      required: true

  - type: checkboxes
    id: conflict_of_interest
    attributes:
      label: Conflict of Interest
      description: This affects how your evaluation is weighted — it does not exclude it
      options:
        - label: I am the author or a contributor to this tool
          required: false
HEREDOC

echo "GitHub issue templates created"
```

---

## SECTION 7 — GITIGNORE AND INITIAL COMMIT

```bash
cat > .gitignore << 'HEREDOC'
# Dependencies
node_modules/
__pycache__/
*.pyc
.Python
env/
venv/
*.egg-info/

# Build outputs
dist/
build/
*.js.map

# Coverage
.coverage
htmlcov/
coverage.xml
*.lcov

# Environment
.env
.env.local
*.env

# OS
.DS_Store
Thumbs.db

# Tool config (keep these out of git to avoid confusion)
.agnix-cache/

# Claude Code session files (do not commit)
.claude/sessions/
*.claude-session

# Temp files
/tmp/
*.tmp
HEREDOC

# Stage everything
git add -A

# Verify what we're committing
git status

# Commit the setup
git commit -m "chore: complete development system setup

- Five governing files: AGENTS.md, CLAUDE.md, TASK.md, RULES.md, DECISIONS.md
- Tool config: claude-context-mode, tdd-guard, agnix, mcp-multiplexer
- Skills: yaml-profile, eval-report, versus-page, musk-review
- Commands: /new-tool, /new-eval, /new-versus, /iterate, /health
- Validation scripts: validate_yaml.py, validate_evaluation.py, validate_versus.py
- GitHub templates: tool submission, evaluation report
- GitHub Actions: config validation, YAML validation, test suite
- Schema v1.0: 12-field tool profile definition"

echo "Initial commit complete"
```

---

## SECTION 8 — VERIFICATION CHECKLIST

Run this to confirm everything is in place before starting Phase 0.

```bash
echo "=== AGENTRADA SYSTEM VERIFICATION ==="
echo ""

# Tool installation
echo "--- Installed Tools ---"
claude-context-mode --version && echo "✓ claude-context-mode" || echo "✗ claude-context-mode MISSING"
tdd-guard --version && echo "✓ tdd-guard" || echo "✗ tdd-guard MISSING"
agnix --version && echo "✓ agnix" || echo "✗ agnix MISSING"
echo ""

# Required files
echo "--- Governing Files ---"
[ -f AGENTS.md ] && echo "✓ AGENTS.md" || echo "✗ AGENTS.md MISSING"
[ -f CLAUDE.md ] && echo "✓ CLAUDE.md" || echo "✗ CLAUDE.md MISSING"
[ -f TASK.md ] && echo "✓ TASK.md" || echo "✗ TASK.md MISSING"
[ -f RULES.md ] && echo "✓ RULES.md" || echo "✗ RULES.md MISSING"
[ -f DECISIONS.md ] && echo "✓ DECISIONS.md" || echo "✗ DECISIONS.md MISSING"
echo ""

# Configuration files
echo "--- Configuration Files ---"
[ -f .context-mode.yml ] && echo "✓ .context-mode.yml" || echo "✗ .context-mode.yml MISSING"
[ -f .tdd-guard.yml ] && echo "✓ .tdd-guard.yml" || echo "✗ .tdd-guard.yml MISSING"
[ -f .agnix.yml ] && echo "✓ .agnix.yml" || echo "✗ .agnix.yml MISSING"
[ -f ~/.claude/settings.json ] && echo "✓ Claude Code MCP settings" || echo "✗ Claude Code MCP settings MISSING"
echo ""

# Schema and scripts
echo "--- Schema and Scripts ---"
[ -f data/schema.yaml ] && echo "✓ data/schema.yaml" || echo "✗ data/schema.yaml MISSING"
[ -f scripts/validate_yaml.py ] && echo "✓ validate_yaml.py" || echo "✗ validate_yaml.py MISSING"
[ -f scripts/validate_evaluation.py ] && echo "✓ validate_evaluation.py" || echo "✗ validate_evaluation.py MISSING"
[ -f scripts/validate_versus.py ] && echo "✓ validate_versus.py" || echo "✗ validate_versus.py MISSING"
echo ""

# Skills
echo "--- Skills ---"
[ -d .claude/skills/yaml-profile ] && echo "✓ yaml-profile skill" || echo "✗ yaml-profile skill MISSING"
[ -d .claude/skills/eval-report ] && echo "✓ eval-report skill" || echo "✗ eval-report skill MISSING"
[ -d .claude/skills/versus-page ] && echo "✓ versus-page skill" || echo "✗ versus-page skill MISSING"
[ -d .claude/skills/musk-review ] && echo "✓ musk-review skill" || echo "✗ musk-review skill MISSING"
echo ""

# Commands
echo "--- Commands ---"
[ -f .claude/commands/new-tool.md ] && echo "✓ /new-tool" || echo "✗ /new-tool MISSING"
[ -f .claude/commands/new-eval.md ] && echo "✓ /new-eval" || echo "✗ /new-eval MISSING"
[ -f .claude/commands/new-versus.md ] && echo "✓ /new-versus" || echo "✗ /new-versus MISSING"
[ -f .claude/commands/iterate.md ] && echo "✓ /iterate" || echo "✗ /iterate MISSING"
[ -f .claude/commands/health.md ] && echo "✓ /health" || echo "✗ /health MISSING"
echo ""

# GitHub Actions
echo "--- CI/CD ---"
[ -f .github/workflows/validate.yml ] && echo "✓ GitHub Actions workflow" || echo "✗ GitHub Actions workflow MISSING"
[ -f .github/ISSUE_TEMPLATE/evaluation-report.yml ] && echo "✓ Evaluation issue template" || echo "✗ Evaluation template MISSING"
echo ""

# Run agnix validation
echo "--- Config Validation (agnix) ---"
agnix 2>/dev/null && echo "✓ All agent configs valid" || echo "⚠ agnix found issues — run 'agnix --fix'"

echo ""
echo "=== VERIFICATION COMPLETE ==="
echo "If all items show ✓, run /health inside Claude Code to confirm."
echo "If any items show ✗, re-run the relevant section from this setup file."
```

---

## SECTION 9 — STARTING PHASE 0

Once verification passes, Phase 0 begins. This is the first real task.

### First TASK.md for Phase 0

Replace the template TASK.md with the first real task:

```bash
cat > TASK.md << 'HEREDOC'
# TASK: phase-0-seed-dataset
# Date: [TODAY] | Phase: 0
# Status: IN_PROGRESS

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Phase 0 plan (the data is the product)
What breaks without it: Nothing exists to evaluate, compare, or discover. Zero value.
Decision: PROCEED

### Rule 2 — What can be deleted first?
Remove nothing — this is the first task. Start clean.
Minimum viable version: 10 tool profiles (not 50). Start with 10 and validate quality before scaling.

### Rule 3 — Simplest implementation?
First instinct: write all 50 profiles in one session
Simpler approach: write 10 profiles, validate all 10, then write 10 more in batches
Chosen approach: batches of 10. Quality over speed.

### Rule 4 — What slowed last time?
No history yet. First task.
Prevention: N/A

### Rule 5 — What to automate?
After writing 10 profiles manually, identify any fields that can be auto-populated from GitHub API
This will become the auto-triage script (Phase 1)

---

## TASK BREAKDOWN

### Gemini Agent Jobs (run in parallel in Antigravity Manager)
- [ ] Agent 1: Generate profiles for GitHub MCP, Filesystem MCP | Acceptance: validate_yaml.py PASS
- [ ] Agent 2: Generate profiles for Playwright MCP, Tavily MCP | Acceptance: validate_yaml.py PASS
- [ ] Agent 3: Generate profiles for wshobson/agents, AgentSys | Acceptance: validate_yaml.py PASS
- [ ] Agent 4: Generate profiles for TÂCHES, Conductor | Acceptance: validate_yaml.py PASS
- [ ] Agent 5: Generate profiles for Context Engineering Kit, Claude Code PM | Acceptance: validate_yaml.py PASS

### tdd-guard Gate
- Validation: python scripts/validate_yaml.py data/tools/
- All 10 profiles pass with zero errors

### Claude Code Review
Review files: data/tools/ (all 10 profiles)
Quality gate: All 12 fields present; scores are null (not invented); status computed from real last-commit dates
Update AGENTS.md: YES — add any patterns found in the first batch

---

## DONE WHEN
- [ ] 10 tool profiles in data/tools/
- [ ] All 10 pass validate_yaml.py with zero errors
- [ ] Claude review: PASS
- [ ] /iterate command run and AGENTS.md updated
- [ ] TASK.md archived
- [ ] Committed

## NEXT TASK (after this is done)
Create TASK.md for: phase-0-seed-dataset-batch-2 (tools 11–20)
HEREDOC

echo "Phase 0 TASK.md created. System is ready."
echo ""
echo "HOW TO START:"
echo "1. Open Antigravity IDE"
echo "2. Open this project directory"
echo "3. Open the Manager View"
echo "4. Spawn 5 agents, each with one job from the TASK BREAKDOWN above"
echo "5. Give each agent: AGENTS.md context + the specific job + validate_yaml.py path"
echo "6. When all agents complete: run /health in Claude Code, then /new-tool review"
```

---

## QUICK REFERENCE

Once setup is complete, these are the commands used every session:

```
DAILY WORKFLOW

Start of session (always):
  /health                  → verify system is working before any work

Creating tools:
  /new-tool [url]          → research + generate + validate a tool profile

Creating evaluations:
  /new-eval [tool-id]      → process a community evaluation

Creating comparisons:
  /new-versus [id1] [id2]  → generate a validated versus page

End of every task (always):
  /iterate                 → musk review + update AGENTS.md + archive TASK.md

Quarterly maintenance:
  /audit-skills            → review and prune the skills library

MODEL ROUTING REMINDER
  Gemini Flash → generation (free)
  Gemini Pro   → multi-file / complex debugging (free)
  Claude Opus  → quality review only (paid — keep this rare)
  Target: 85% Gemini / 15% Claude
```