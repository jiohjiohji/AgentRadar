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
