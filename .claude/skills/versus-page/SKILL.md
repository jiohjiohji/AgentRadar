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
valid_until: YYYY-MM-DD    <- Set to 90 days from today. ALWAYS.
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
