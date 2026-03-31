# TASK: p0-011-daily-crawler
# Date: 2026-03-31 | Phase: 0
# Status: BACKLOG

## MUSK 5-RULES PRE-CHECK

### Rule 1 — Is this requirement legitimate?
Who asked for this: Sprint plan P0-011 — the dataset needs to grow beyond the 50 seed tools without manual curation.
What breaks without it: P0-012 (launch) depends on having an automated discovery mechanism. Without it, the dataset is static and goes stale.
Decision: PROCEED

### Rule 2 — What can be deleted first?
The crawler only needs to: (1) search GitHub by topics, (2) run auto-triage, (3) generate a draft PR.
Do NOT build an ML classifier, scoring system, or approval workflow. The acceptance threshold is 4/5 manual checks — implement those checks as code.

### Rule 3 — Simplest implementation?
GitHub Actions workflow (`.github/workflows/daily-crawler.yml`) calling `scripts/crawl.py`:
1. `gh api search/repositories` with topics: claude-code, mcp-server, claude-agent, llm-tools
2. Skip tools already in data/tools/
3. For each new repo, run 5 triage checks (stars≥50, has README, recent activity, not fork, not blank)
4. Score ≥4/5: generate a draft YAML profile and open a PR to data/tools/
5. Score <4/5: log to data/discovery_log.yaml without creating a PR

### Rule 4 — What slowed last time?
Versus page writing was smooth. Risk here: GitHub API rate limits. Use the authenticated `gh` CLI token. Paginate results; don't request all 1000 results at once.

### Rule 5 — What to automate?
The crawler IS the automation. PR review still requires a human approval step — the crawler proposes, a maintainer merges.

---

## IMPLEMENTATION

### Workflow file: .github/workflows/daily-crawler.yml
- Schedule: `cron: '0 6 * * *'` (06:00 UTC daily)
- Permissions: contents:write, pull-requests:write
- Steps: checkout → setup Python → run scripts/crawl.py → create PR if new tools found

### Script: scripts/crawl.py
Topics to crawl: claude-code, mcp-server, claude-agent, llm-tools, claude-claude-code
Triage checks (pass ≥4 of 5):
  1. stars ≥ 50
  2. README exists (has_readme: true in API response)
  3. pushed_at within last 180 days
  4. is not a fork (fork: false)
  5. description is not blank

Output for passing tools:
  - Draft profile YAML in data/tools/[tool-id].yaml (scores: null, score_confidence: null)
  - PR title: "chore: add discovered tool [name]"
  - PR body: triage scorecard + raw API data

Output for failing tools:
  - Append entry to data/discovery_log.yaml with triage scores and reason for rejection

### Acceptance criteria
- [ ] .github/workflows/daily-crawler.yml triggers on schedule
- [ ] scripts/crawl.py runs locally without errors: `python scripts/crawl.py --dry-run`
- [ ] Dry run on current topic search produces ≥5 candidate tools not already in data/tools/
- [ ] Tools above threshold generate valid draft YAML (passes validate_yaml.py with scores: null)
- [ ] Tools below threshold are logged to data/discovery_log.yaml
- [ ] No false positives in first 7 days (manual spot-check required after first run)
- [ ] Committed on feature/p0-011-daily-crawler branch

## NEXT TASK
p0-012-launch
