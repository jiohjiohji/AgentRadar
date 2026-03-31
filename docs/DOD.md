# AgentRadar — Definition of Done
# Version: 1.0 | Owner: Jihoon | Status: APPROVED
# Feed this to Claude for any quality review or before any merge decision.
# A ticket is DONE only when every applicable checklist is CHECKED.

---

## Why This Document Exists

"Done" is not "the code works on my machine." Done means the work is production-ready,
tested, documented, and leaves the system in a better state than it found it.
This document defines what "done" means for each type of work in AgentRadar.

---

## Universal Done Criteria (applies to ALL work types)

Before any commit is merged, ALL of the following must be true:

```
CODE QUALITY
- [ ] No file exceeds 200 lines (split if needed before merge)
- [ ] All new functions have type hints (Python) or type annotations (TypeScript)
- [ ] No `any` type in TypeScript, no missing type hints in Python
- [ ] No commented-out code
- [ ] No TODO comments (convert to GitHub issue or delete)
- [ ] No hardcoded credentials, URLs, or environment-specific values
- [ ] All new constants are named (no magic numbers)

TESTING
- [ ] Every new public function has at least one test
- [ ] Every new public function has at least one test for the failure/error path
- [ ] All existing tests still pass (no regressions)
- [ ] tdd-guard passes without exceptions

CONFIGURATION
- [ ] agnix passes with no errors
- [ ] No new environment variables without documentation in AGENTS.md
- [ ] No new dependencies without justification documented in DECISIONS.md

MUSK ITERATION
- [ ] /iterate has been run (musk-review skill applied)
- [ ] AGENTS.md updated with any new automations discovered (Rule 5)
- [ ] TASK.md archived to tasks/completed/

GIT
- [ ] Commit message follows the format in CODING-STANDARDS.md
- [ ] Branch references a ticket number from SPRINT-PLAN.md
- [ ] PR description answers: what changed and why
```

---

## Done Criteria: Tool Profile (data/tools/*.yaml)

```
SCHEMA COMPLIANCE
- [ ] Exactly 12 fields present (no more, no fewer)
- [ ] validate_yaml.py passes with zero errors
- [ ] All enum values are from the allowed set in schema.yaml
- [ ] id matches filename without .yaml extension
- [ ] id matches pattern ^[a-z0-9][a-z0-9-]*[a-z0-9]$

DATA ACCURACY
- [ ] source_url is publicly accessible (verified manually or by script)
- [ ] name matches the tool's own documentation
- [ ] pricing reflects the tool's current pricing (verified from source)
- [ ] status is computed from actual last_commit date (not estimated)
- [ ] scores is null if fewer than 2 independent evaluations exist
- [ ] score_confidence is null if scores is null
- [ ] score_history is [] if no score has ever been published for this tool
- [ ] tags are relevant and from the established vocabulary (check existing tags)
- [ ] versus_refs is [] if no versus page references this tool yet

ANTI-BIAS COMPLIANCE
- [ ] No invented or estimated score values
- [ ] No promotional language in any field (this is data, not marketing)
```

---

## Done Criteria: Evaluation Report (data/evaluations/*.yaml)

```
SCHEMA COMPLIANCE
- [ ] All 9 required fields present
- [ ] validate_evaluation.py passes with zero errors
- [ ] tool_id matches an existing tool in data/tools/
- [ ] conflict_of_interest field is present (value "none" or "contributor")

DATA QUALITY
- [ ] task_performed is specific (≥20 words, describes actual task not "I tested it")
- [ ] Every score has both a numeric value AND an evidence string
- [ ] Evidence strings are specific and measurable ("saved 40 min" not "it was fast")
- [ ] verdict is opinionated (≥10 words, not "it's good")
- [ ] verdict cannot be applied to any tool generically (must be tool-specific)
- [ ] date_evaluated is the actual date of evaluation (not today's date if testing old)

INTEGRITY
- [ ] If conflict_of_interest is "contributor": this is noted in the PR description
- [ ] CoI-flagged evaluations are NOT excluded — they are flagged and computed separately
- [ ] Evaluator has not submitted more than 3 evaluations for the same tool
  (more than 3 from one person signals gaming — flag for review)
```

---

## Done Criteria: Versus Page (data/versus/*.md)

```
STRUCTURE
- [ ] validate_versus.py passes with zero errors
- [ ] Exactly 5 sections present in this order:
      ## Quick Answer
      ## Score Comparison
      ## Community Verdicts
      ## Use Cases
      ## Methodology
- [ ] Frontmatter includes: tool_a, tool_b, created, valid_until, last_reviewed,
      evaluation_count_a, evaluation_count_b

DATA REQUIREMENTS
- [ ] Both tools have ≥2 independent (non-CoI) evaluations
- [ ] valid_until is set to 90 days from created date
- [ ] All scores shown include [HIGH/MED/LOW] confidence brackets
- [ ] Community Verdicts are from actual evaluation reports (not paraphrased or invented)
- [ ] Use Cases table only includes verified use cases from evaluations

ANTI-BIAS COMPLIANCE (most important)
- [ ] Quick Answer has a genuine "Neither when" bullet (not throwaway)
- [ ] Neither tool is described in promotional terms
- [ ] If evaluations show one tool is clearly worse for all use cases, the page says so
- [ ] At least one Core Evaluator or second person has reviewed before publishing
- [ ] anti-bias-charter.md has been read as part of this review
```

---

## Done Criteria: CLI Command

```
FUNCTIONAL
- [ ] Command returns in <2 seconds on a standard connection (test from your machine)
- [ ] Command works with piped output (not just TTY)
- [ ] Command exits with code 0 on success, 1 on handled error, 2 on crash
- [ ] --json flag produces valid JSON output
- [ ] Command works offline using local cache (24-hour TTL)
- [ ] Score output ALWAYS includes confidence bracket

ERROR HANDLING
- [ ] Invalid tool ID shows a helpful error message (not a stack trace)
- [ ] Network timeout shows a helpful error message with recovery suggestion
- [ ] Rate limit exceeded shows: "Pro plan available for higher limits: [url]"

TESTING
- [ ] vitest tests cover the happy path
- [ ] vitest tests cover: invalid ID, network error, rate limit, offline mode
- [ ] E2E test: install the CLI in a clean environment and run the command
```

---

## Done Criteria: GitHub Actions Workflow

```
FUNCTIONALITY
- [ ] Workflow runs on the correct trigger (schedule, push, PR, dispatch)
- [ ] Workflow completes successfully on a real test run
- [ ] Failure in the workflow sends a notification (Discord or email)
- [ ] Workflow does not run on forks (secrets would not be available)

EFFICIENCY
- [ ] Uses caching for Python/Node dependencies
- [ ] Does not re-run unnecessarily (uses path filters where applicable)
- [ ] Completes in under 10 minutes for the daily crawler
- [ ] Has a timeout set to prevent infinite hangs

SAFETY
- [ ] Secrets are accessed via ${{ secrets.X }}, never hardcoded
- [ ] Write access to data repo is scoped to the minimum required
- [ ] PRs opened by the crawler are reviewed before auto-merge is enabled
```

---

## Done Criteria: Database / Schema Change

```
MIGRATION
- [ ] Migration script exists in scripts/migrations/
- [ ] Migration script is idempotent (can be run twice without error)
- [ ] Rollback procedure is documented in the migration script comments
- [ ] Migration has been tested on a subset of the dataset before full run

BACKWARD COMPATIBILITY
- [ ] Old API clients still work with the new schema (or breaking change is documented)
- [ ] Old YAML files are still valid (or a migration script updates them all)
- [ ] DECISIONS.md updated with the schema change decision
- [ ] AGENTS.md updated if any new constraints apply to the schema
```

---

## The Final Question

Before marking any ticket DONE, ask:

> "If I handed this to a senior developer I respected and said 'this is production-ready',
> would they find anything embarrassing?"

If the answer is yes, it is not done.