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
What information was missing at the start? -> Add to AGENTS.md if it should always be pre-loaded.
What caused re-work? -> Add to AGENTS.md FORBIDDEN PATTERNS.

### Check 5 — What to automate?
For any step that happened more than once manually: add to the appropriate place:
- Repeated Gemini prompt pattern -> new skill in .claude/skills/
- Repeated Claude review pattern -> new line in CLAUDE.md quality standards
- Repeated shell command -> new slash command in .claude/commands/
- Repeated architectural question -> new entry in DECISIONS.md
- New constraint discovered -> new entry in AGENTS.md FORBIDDEN PATTERNS

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
