# AgentRadar — Coding Standards
# Version: 1.0 | Owner: Jihoon | Status: APPROVED
# Feed this to Claude for any code generation, review, or refactoring work.
# These are not preferences. They are project-wide constraints.

---

## 1. Universal Rules (all languages, all files)

### Files
- Maximum 200 lines per file. If a file exceeds 200 lines, it must be split.
- Every file has a single, clear responsibility. Name reflects that responsibility.
- No commented-out code in committed files. Delete it. Git has history.
- No TODO comments in committed files. Turn it into a GitHub issue or delete it.

### Functions
- Maximum 30 lines per function. Extract sub-functions aggressively.
- Every function does exactly one thing. The name says what that thing is.
- Functions that return `None`/`void` should have side effects that are obvious
  from the name. `processData()` is a bad name. `appendToScoreHistory()` is good.
- No functions with more than 4 parameters. Use a config object/dataclass instead.

### Naming
```
# Clear naming rules — no exceptions

Variables:         snake_case (Python) / camelCase (TypeScript)
Constants:         UPPER_SNAKE_CASE
Classes:           PascalCase
Files:             kebab-case.ts / snake_case.py
GitHub Actions:    kebab-case.yml

# Names must answer the question "what is this?"
# CORRECT: evaluation_report_count, fetchToolById, MAX_SCORE_VALUE
# WRONG:   data, x, temp, result, info, stuff, thing
```

### Comments
```python
# CORRECT: explain WHY, not WHAT (the code shows what)
# Score changes >0.5 require 3+ reports to prevent gaming via coordinated
# single-report submissions from tool authors or their associates.
if delta > 0.5 and report_count < 3:
    return None

# WRONG: explains what the code already says clearly
# Check if delta > 0.5 and report count < 3
if delta > 0.5 and report_count < 3:
    return None
```

---

## 2. Python-Specific Standards

### Imports
```python
# Import order: stdlib → third-party → internal
# Each group separated by a blank line
# No wildcard imports: from module import * is forbidden

import sys
from datetime import date
from pathlib import Path

import requests
import yaml

from core.models import ToolProfile, EvaluationReport
from core.scoring import compute_score
```

### Type Hints
```python
# ALL function signatures must have type hints
# Return type always specified — no implicit None returns

# CORRECT
def load_tool_profiles(directory: Path) -> list[ToolProfile]:
    ...

def get_score(tool_id: str) -> ToolScore | None:
    ...

# WRONG
def load_tool_profiles(directory):   # missing types
    ...

def get_score(tool_id):              # missing types
    ...
```

### Data Structures
```python
# Use dataclasses (or Pydantic) for any structured data passed between functions
# Never pass raw dicts between function boundaries
# Dicts are acceptable for internal local use only

# CORRECT
@dataclass
class TriageResult:
    url: str
    passes: bool
    score: int
    reason: str
    checked_at: date

def triage_tool(url: str) -> TriageResult:
    ...

# WRONG
def triage_tool(url: str) -> dict:    # ambiguous, no IDE support, breaks callers
    return {"url": url, "passes": True, "score": 4}
```

### YAML Handling
```python
# Always use safe_load — never yaml.load() without Loader
# Always validate against schema after loading
# Never construct YAML with string concatenation — use yaml.dump()

# CORRECT
with open(filepath) as f:
    data = yaml.safe_load(f)
validate_against_schema(data)  # Always validate

# WRONG
with open(filepath) as f:
    data = yaml.load(f)  # Security vulnerability

yaml_string = f"id: {tool_id}\nname: {name}"  # Fragile, injection risk
```

---

## 3. TypeScript-Specific Standards

### Types
```typescript
// Prefer interfaces for object shapes, type aliases for unions/intersections
interface Tool {
  id: string;
  name: string;
  scores: ToolScore | null;
}

type FreshnessStatus = "current" | "aging" | "stale" | "historical";
type Confidence = "low" | "medium" | "high";

// Never use object as a type — it accepts almost anything
// WRONG: function process(data: object): void
// CORRECT: function process(data: Tool): void

// Never use Function as a type
// WRONG: const handler: Function = ...
// CORRECT: const handler: (tool: Tool) => Promise<void> = ...
```

### Async/Await
```typescript
// Always use async/await over .then() chains
// Always handle promise rejections — never let them bubble silently

// CORRECT
async function fetchAndDisplay(toolId: string): Promise<void> {
  const result = await fetchTool(toolId);
  if (!result.ok) {
    displayError(result.error.message);
    return;
  }
  displayTool(result.value);
}

// WRONG
fetchTool(toolId)
  .then(tool => displayTool(tool))
  .catch(err => console.log(err)); // swallows the error
```

### CLI Output
```typescript
// Every CLI command must:
// 1. Work with both TTY and piped output (check process.stdout.isTTY)
// 2. Exit with code 0 on success, 1 on handled error, 2 on unhandled error
// 3. Never output debug/log messages to stdout (use stderr for logs)
// 4. Support --json flag for machine-readable output

// Score display is mandatory to include confidence
// CORRECT
const scoreDisplay = score !== null
  ? `${score.toFixed(1)} [${confidence?.toUpperCase() ?? "???"}]`
  : "—";

// WRONG: suppresses confidence
const scoreDisplay = score?.toFixed(1) ?? "—";
```

---

## 4. Git Standards

### Commit Message Format
```
<type>(<scope>): <summary in imperative mood, max 72 chars>

[optional body: explain WHY, not WHAT]

[optional footer: Closes #123, Breaking: ...]
```

**Types:**
- `feat`: new feature
- `fix`: bug fix
- `chore`: maintenance (deps, config, scripts)
- `docs`: documentation only
- `test`: test additions or changes
- `refactor`: code restructure, no behaviour change
- `perf`: performance improvement

**Examples:**
```
feat(cli): add agentRadar watch command for Pro subscribers

fix(api): exclude CoI-flagged evaluations from score computation

Scores were including evaluations from tool authors when the
conflict_of_interest field was present but not "none". The
API layer now explicitly filters before averaging.

Closes #47

chore(ci): add versus page validation to GitHub Actions workflow
```

### Branch Naming
```
main           Production. Protected. Direct pushes forbidden.
develop        Integration branch. PRs merge here first.

feat/[issue]-[short-description]      feat/12-cli-watch-command
fix/[issue]-[short-description]       fix/47-coi-score-exclusion
chore/[description]                   chore/update-dependencies
```

### PR Requirements
Every PR must:
- Reference a GitHub issue or TASK.md entry
- Pass all CI checks (agnix, validate_yaml, tests)
- Have a description that answers: what changed and why
- Be reviewed by at least one other person (or self-reviewed with `/iterate`)

---

## 5. Anti-Patterns (Forbidden Code Patterns)

These patterns have been found in generated code and are explicitly banned.
agnix and the CI pipeline flag these where possible.

```python
# ANTI-PATTERN 1: Silent exception handling
try:
    result = do_something()
except Exception:
    pass  # FORBIDDEN — always log or re-raise

# ANTI-PATTERN 2: Hardcoded credentials
GITHUB_TOKEN = "ghp_xxxx"  # FORBIDDEN — use environment variables

# ANTI-PATTERN 3: Mutable default arguments
def process(tools: list = []):  # FORBIDDEN — mutable default
def process(tools: list | None = None):  # CORRECT

# ANTI-PATTERN 4: Implicit type coercion in comparisons
if score == "8.5":  # FORBIDDEN if score is a float
if score == 8.5:    # CORRECT

# ANTI-PATTERN 5: String formatting for YAML/JSON construction
yaml_string = f"id: {tool_id}"  # FORBIDDEN
yaml.dump({"id": tool_id})      # CORRECT

# ANTI-PATTERN 6: Nested ternaries
value = a if x else b if y else c  # FORBIDDEN — use if/elif/else block

# ANTI-PATTERN 7: Magic numbers
if report_count >= 3:  # FORBIDDEN — what does 3 mean?
MIN_REPORTS_FOR_MEDIUM_CONFIDENCE = 3
if report_count >= MIN_REPORTS_FOR_MEDIUM_CONFIDENCE:  # CORRECT
```

```typescript
// ANTI-PATTERN 8: Non-null assertion without validation
const score = tool.scores!.overall;  // FORBIDDEN if scores might be null
const score = tool.scores?.overall ?? null;  // CORRECT

// ANTI-PATTERN 9: Type casting without validation
const tool = response.data as Tool;  // FORBIDDEN — use type guards or Zod
function isTool(data: unknown): data is Tool { ... }  // CORRECT

// ANTI-PATTERN 10: Unhandled promise in effect
useEffect(() => {
  fetchTool(id);  // FORBIDDEN — unhandled promise
  fetchTool(id).catch(handleError);  // CORRECT
}, [id]);

// ANTI-PATTERN 11: console.log left in production code
console.log("debug:", data);  // FORBIDDEN in committed code
// Use a proper logger or remove before commit
```