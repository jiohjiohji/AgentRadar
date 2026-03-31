# /iterate command
# Usage: /iterate
# Run at the end of every task. Updates AGENTS.md. Archives TASK.md.

1. Load the musk-review skill
2. Review the current git diff
3. Apply all 5 checks
4. Update AGENTS.md with any new automations, forbidden patterns, or decisions
5. Update DECISIONS.md if a new architectural decision was made
6. Set TASK.md status to DONE
7. Archive: cp TASK.md tasks/completed/[DATE]-[TASK_NAME].md
8. Commit: git add -A && git commit -m "chore: complete [TASK_NAME] + iteration review"
