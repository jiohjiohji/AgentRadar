# AgentRadar — Technical Specification
# Version: 1.0 | Owner: Jihoon | Status: APPROVED
# Feed this to Claude for implementation work on any component.

---

## 1. Python Standards (core/ and scripts/)

### 1.1 Version and Tooling
- Python 3.12 minimum. Use 3.12 typing features (e.g. `type X = Y`).
- Type hints are mandatory on all function signatures. `mypy --strict` must pass.
- Formatter: `black` with default settings.
- Linter: `ruff` with default settings.
- No `any` type unless explicitly justified in a comment.

### 1.2 File Structure
```python
# Standard file header — every Python file in core/
"""
Module description in one sentence.

Longer description if needed.
"""
# Standard library imports
# Third-party imports
# Internal imports

# Constants (UPPER_SNAKE_CASE)
# Types and data classes
# Main logic
# Entry point if applicable
```

### 1.3 Error Handling
```python
# CORRECT: explicit, typed exceptions — never silent
class TriageError(Exception):
    """Raised when auto-triage fails for a specific, known reason."""
    pass

def triage_tool(url: str) -> TriageResult:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.Timeout:
        raise TriageError(f"Triage timed out for {url}")
    except requests.HTTPError as e:
        raise TriageError(f"HTTP {e.response.status_code} fetching {url}")

# WRONG: silent catch
def triage_tool(url: str) -> TriageResult | None:
    try:
        ...
    except Exception:
        return None  # NEVER DO THIS
```

### 1.4 Testing Requirements
- Every public function has at least one test
- Every public function has at least one test for the failure path
- Tests use `pytest` fixtures — no global test state
- HTTP calls are mocked with `responses` library — no real network calls in tests
- Coverage threshold: 80% (enforced by tdd-guard)

```python
# CORRECT test structure
def test_triage_tool_success(mock_github_api):
    """Happy path: well-maintained repo passes triage."""
    mock_github_api.return_value = build_mock_response(stars=50, readme_length=600)
    result = triage_tool("https://github.com/example/tool")
    assert result.passes is True
    assert result.score >= 4

def test_triage_tool_stale_repo(mock_github_api):
    """Error path: repo with no commits in 200 days fails triage."""
    mock_github_api.return_value = build_mock_response(days_since_commit=200)
    result = triage_tool("https://github.com/example/stale-tool")
    assert result.passes is False
    assert "stale" in result.reason.lower()
```

### 1.5 Data Classes
```python
# Use dataclasses or Pydantic for all structured data — never raw dicts
from dataclasses import dataclass, field
from datetime import date
from typing import Literal

@dataclass
class ToolScore:
    p: float | None = None  # Productivity
    q: float | None = None  # Quality
    c: float | None = None  # Cost Efficiency
    r: float | None = None  # Reliability
    x: float | None = None  # Composability
    f: float | None = None  # Setup Friction
    confidence: Literal["low", "medium", "high"] | None = None
    report_count: int = 0

    def overall(self) -> float | None:
        values = [v for v in [self.p, self.q, self.c, self.r, self.x, self.f]
                  if v is not None]
        return sum(values) / len(values) if values else None
```

---

## 2. TypeScript Standards (cli/ and api/)

### 2.1 Version and Tooling
- TypeScript 5.x with `strict: true` in tsconfig
- `noImplicitAny: true` — no escape hatches
- `exactOptionalPropertyTypes: true` — no `undefined` masquerading as `null`
- Formatter: `prettier` with default settings
- No `any` type. Use `unknown` if the type is genuinely unknown, then narrow it.

### 2.2 Error Handling
```typescript
// CORRECT: Result type pattern — no thrown exceptions for expected errors
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function fetchTool(id: string): Promise<Result<Tool>> {
  try {
    const response = await apiClient.get(`/tools/${id}`);
    if (!response.ok) {
      return { ok: false, error: new Error(`HTTP ${response.status}`) };
    }
    return { ok: true, value: await response.json() as Tool };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

// Usage — never let errors bubble up to the user as stack traces
const result = await fetchTool("gh-wshobson-agents");
if (!result.ok) {
  console.error(`Could not load tool: ${result.error.message}`);
  process.exit(1);
}
const tool = result.value;  // TypeScript knows this is Tool, not Tool | undefined
```

### 2.3 CLI Output Standards
```typescript
// Every CLI command outputs in one of three modes:
// 1. Table — for list commands
// 2. Profile — for show/compare commands
// 3. Error — for failures

// ALWAYS check terminal width before rendering tables
// ALWAYS include score confidence in any output that shows a score
// ALWAYS warn when a score is Stale or Aging

function formatScore(score: number | null, confidence: Confidence | null): string {
  if (score === null) return chalk.grey("—");
  const conf = confidence ? `[${confidence.toUpperCase().slice(0,3)}]` : "[???]";
  const color = score >= 7.5 ? chalk.green : score >= 5 ? chalk.yellow : chalk.red;
  return `${color(score.toFixed(1))} ${chalk.grey(conf)}`;
}

// CORRECT: always show confidence
// Output: "8.2 [MED]"

// WRONG: never suppress confidence
// Output: "8.2" ← this is forbidden
```

### 2.4 Cloudflare Worker Constraints
```typescript
// Workers have strict constraints — these apply to api/worker.ts

// MAX: 10MB worker size (including dependencies)
// MAX: 10ms CPU time per request (free tier) / 30s (paid tier)
// NO: filesystem access
// NO: arbitrary npm packages — tree-shake everything

// CORRECT: inline the minimal helper functions
// WRONG: import lodash, moment, or any heavy library

// Rate limiting MUST use KV, not in-memory state
// (Workers are stateless — no in-memory state persists between requests)
```

---

## 3. Cloudflare Worker API Specification

### 3.1 Request Format
All endpoints accept JSON. Authentication via `X-AgentRadar-Key` header.

```
GET  /api/v1/tools
GET  /api/v1/tools/:id
GET  /api/v1/tools/:id/evaluations
GET  /api/v1/versus/:id1/:id2
GET  /api/v1/search?q=:query&category=:cat&min_score=:n&pricing=:type
GET  /api/v1/suggest?task=:text
GET  /api/v1/digest/latest
POST /api/v1/crawl/trigger    (Pro key required)
POST /api/v1/webhooks         (Team key required)
```

### 3.2 Response Format (all endpoints)
```json
{
  "data": { ... },
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "freshness": "2026-03-31T06:00:00Z"
  },
  "error": null
}
```

On error:
```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "TOOL_NOT_FOUND",
    "message": "No tool with ID 'gh-example-tool' exists in the dataset",
    "docs": "https://agentRadar.dev/docs/api#errors"
  }
}
```

### 3.3 Score Object (canonical form)
```json
{
  "dimensions": {
    "p": 8.2, "q": 7.9, "c": 7.1, "r": 7.4, "x": 8.8, "f": 6.5
  },
  "overall": 7.7,
  "confidence": "medium",
  "report_count": 6,
  "last_evaluated": "2026-03-15",
  "freshness_status": "current",
  "benchmark_version": null
}
```

`freshness_status` values: `"current"` | `"aging"` | `"stale"` | `"historical"`
`benchmark_version` is `null` until Phase 2 automated benchmarks are introduced.

### 3.4 Error Codes
```
TOOL_NOT_FOUND          Tool ID does not exist in the dataset
VERSUS_NOT_FOUND        No versus page exists for this tool pair
INSUFFICIENT_DATA       Tool has fewer than 2 evaluations — no score published
RATE_LIMIT_EXCEEDED     API key has exceeded its daily request limit
INVALID_API_KEY         Key format invalid or not found in KV
MISSING_API_KEY         Pro/Team endpoint called without API key
SCHEMA_VIOLATION        Submitted tool or evaluation fails schema validation
CONFLICT_OF_INTEREST    Evaluation submitter is flagged as tool contributor
```

---

## 4. YAML Schema — Strict Specification

### 4.1 Tool Profile (data/tools/[id].yaml)
Every tool profile must conform to this exact specification.
The validation script (`scripts/validate_yaml.py`) enforces all rules.

```yaml
# All 12 fields in canonical order
id: string
  # Pattern: ^[a-z0-9][a-z0-9-]*[a-z0-9]$
  # Derived from source URL. Never changes. Filename without .yaml extension.
  # Example: "gh-wshobson-agents"

name: string
  # Human-readable. Title case. Max 80 chars.
  # Example: "Claude Code Agents"

source_url: string
  # Must be a valid HTTP/HTTPS URL. Must be publicly accessible.
  # Example: "https://github.com/wshobson/agents"

category: enum
  # Exactly one of:
  # mcp-server | claude-plugin | claudemd-framework | orchestration |
  # prompt-library | sdk-pattern | ide-integration | eval-observability | complementary

pricing: enum
  # Exactly one of: free | freemium | paid

license: string | null
  # SPDX identifier preferred: MIT, Apache-2.0, GPL-3.0, etc.
  # null if license is unclear or proprietary and unconfirmed
  # "proprietary" if clearly commercial with no OSS license

status: enum
  # Exactly one of: active | stale | archived
  # Computed rule: active if last_commit <60 days, stale if 60–180 days, archived if >180 days
  # This field must be kept current by the weekly crawler

scores: ScoreObject | null
  # null until at least 2 clean (non-CoI) evaluations exist
  # NEVER invent or estimate scores
  # Structure:
  #   p: float 0–10 | null    (Productivity)
  #   q: float 0–10 | null    (Quality)
  #   c: float 0–10 | null    (Cost Efficiency)
  #   r: float 0–10 | null    (Reliability)
  #   x: float 0–10 | null    (Composability)
  #   f: float 0–10 | null    (Setup Friction)

score_confidence: "low" | "medium" | "high" | null
  # null iff scores is null
  # low: 2 reports (minimum to publish)
  # medium: 3–9 reports
  # high: 10+ reports

score_history: array of ScoreHistoryEntry
  # Append-only. Never modify or delete entries.
  # Entries only added when overall score changes by ≥0.01
  # Structure: { date: YYYY-MM-DD, overall: float, benchmark_version: string | null }
  # Empty array [] if tool has no published score yet

tags: array of string
  # 3–10 tags. Lowercase. Hyphen-separated.
  # Used for versus page auto-matching and faceted search.
  # Examples: multi-agent, orchestration, python, typescript, mcp-native

versus_refs: array of VersusRef
  # Empty array [] initially. Populated as versus pages are created.
  # Structure: { id: string, verdict_short: string, valid_until: YYYY-MM-DD }
  # valid_until: 90 days from page creation date
```

### 4.2 Evaluation Report (data/evaluations/[tool-id]-[date]-[n].yaml)
```yaml
tool_id: string                    # Must match an existing data/tools/ ID
reporter_role: enum                # solo-developer | small-team | enterprise-dev
date_evaluated: YYYY-MM-DD
claude_code_version: string        # Output of `claude --version`
platform: enum                     # macos | linux | windows-wsl
task_performed: string             # Min 20 words. Must be specific, not generic.

scores:
  p:
    value: float 0–10
    evidence: string               # Min 10 words. Must be specific. "It was good" is rejected.
  q:
    value: float 0–10
    evidence: string
  c:
    value: float 0–10
    evidence: string               # Must reference actual token counts or time if available
  r:
    value: float 0–10
    evidence: string
  x:
    value: float 0–10
    evidence: string
  f:
    value: float 0–10
    evidence: string

verdict: string                    # One sentence. Opinionated. Min 10 words. Must be specific.
conflict_of_interest: "none" | "contributor"
```

---

## 5. Benchmark Task Specifications (Phase 2)

### T01-refactor
```
Task: Refactor the provided 200-line Python module `legacy_processor.py` to use
      the Strategy design pattern. The refactored code must:
      - Have the same public interface as the original
      - Pass all existing tests in test_processor.py
      - Have at least 3 distinct Strategy implementations
      - Be split across at least 2 files

Input: legacy_processor.py (provided in data/benchmarks/tasks/T01/input/)
       test_processor.py (must pass unchanged)
Success: pytest test_processor.py passes. Code review by automated static analysis.
Baseline: Claude Code Max with no additional tools, 1 attempt.
Metric: wall_time (seconds), token_count, test_pass (bool), pattern_quality (0–10)
```

### T02-debug
```
Task: The test `test_auth_integration.py::test_oauth_callback` is failing.
      Find and fix the root cause. You may not modify the test file.

Input: A 12-file Python web app (provided in data/benchmarks/tasks/T02/input/)
       test_auth_integration.py (read-only — do not modify)
Success: pytest test_auth_integration.py::test_oauth_callback passes
Baseline: Claude Code Max with no additional tools, 1 attempt.
Metric: wall_time, token_count, success (bool), files_modified (count)
Notes: The bug involves an interaction between 3 files. Single-file fixes will fail.
```

### T04-multi-agent
```
Task: Using two coordinated agents, produce a unified analysis report.
      Agent 1: Analyse the Python codebase for code quality issues
      Agent 2: Analyse the same codebase for security issues
      Coordinator: Merge both analyses into one prioritised report

Input: A 20-file Python web app (provided in data/benchmarks/tasks/T04/input/)
Success: Report exists. Covers both quality and security. Issues are prioritised.
         No duplicate findings. Formatted as structured markdown.
Baseline: Single Claude Code session (no multi-agent), 1 attempt.
Metric: wall_time, token_count, coverage_score (0–10), duplication_score (0–10)
```

### T06-cost-constrained
```
Task: Complete T01-refactor with a hard limit of 4,000 tokens total.
      If the limit would be exceeded, stop and report progress so far.

Input: Same as T01
Success: Test passes AND total_tokens ≤ 4000
Metric: token_count, test_pass (bool), quality_at_budget (0–10)
Notes: Tests tool's ability to prioritise and work efficiently under constraints.
       Some tools will sacrifice quality. The metric captures the tradeoff.
```

---

## 6. Deployment Specifications

### 6.1 Cloudflare Worker Deployment
```bash
# Deploy the API worker (from agentRadar/api/)
wrangler deploy

# Environment variables (set via wrangler secret — never in code)
wrangler secret put GITHUB_TOKEN        # For reading private data (if any)
wrangler secret put BUTTONDOWN_API_KEY  # For digest sending

# KV namespaces (create once)
wrangler kv:namespace create "RATELIMIT"
wrangler kv:namespace create "WATCHLIST"
wrangler kv:namespace create "APIKEYS"

# D1 database (Phase 2)
wrangler d1 create agentRadar-index
```

### 6.2 GitHub Pages Deployment
```yaml
# Triggered by any merge to main in agentRadar/data
# See .github/workflows/deploy-web.yml

steps:
  - build Pagefind index from data/ files
  - generate HTML from YAML + markdown templates
  - deploy to GitHub Pages
```

### 6.3 npm CLI Publication
```bash
# From agentRadar/cli/
npm run build          # Compile TypeScript
npm test               # Run vitest suite
npm publish --access public   # Publish to npm as 'agentRadar'
```
