---
name: musk-review
description: "Post-task review. Trigger: /iterate command or 'task is done'. Reviews the diff, updates AGENTS.md if needed, archives TASK.md."
---

# musk-review Skill

## Purpose
Review completed work before merging. Update governing files if lessons were learned.

## PROCESS

### 1. Was everything necessary?
Review the git diff. Flag any changes that weren't required for the task.

### 2. What can be deleted?
Flag functions with no callers and no tests. Question new dependencies.

### 3. Is this the simplest version?
Could someone new to the project understand this code quickly? Flag unnecessary complexity.

### 4. What slowed this down?
Note blockers or missing information. If something should be pre-loaded in future tasks, add it to AGENTS.md or DECISIONS.md.

### 5. What to automate?
If any step was repeated manually:
- Repeated prompt pattern → new skill in .claude/skills/
- Repeated shell command → new slash command in .claude/commands/
- New constraint discovered → new entry in AGENTS.md FORBIDDEN PATTERNS (with what happened)
- New architectural decision → new entry in DECISIONS.md

## AFTER REVIEW
- Update AGENTS.md only if a real lesson was learned — don't add trivial items
- Archive TASK.md to `tasks/completed/[DATE]-[TASK_NAME].md`
- Set TASK.md status to DONE
