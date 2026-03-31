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
