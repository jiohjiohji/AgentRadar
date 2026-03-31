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
