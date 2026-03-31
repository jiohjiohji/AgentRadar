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
