# /audit-skills command
# Usage: /audit-skills
# Run quarterly to review and prune the skills library

1. List all skills in .claude/skills/
2. For each skill: check if it has been used in the last 30 days (check TASK.md history)
3. Flag unused skills for review
4. Check for conflicting rules between skills
5. Check for rules in skills that duplicate rules in AGENTS.md (remove duplicates)
6. Run agnix to validate all skill SKILL.md files
7. Report: which skills are healthy, which need revision, which should be archived
