#!/usr/bin/env python3
"""
Daily crawler for AgentRadar tool discovery.

Searches GitHub for agent tools by topic, triages each candidate against 5 checks,
and either proposes a draft profile (pass) or logs rejection (fail).

Usage:
  python scripts/crawl.py              # full run: write files + open PRs (CI use)
  python scripts/crawl.py --dry-run    # print candidates without writing anything

Triage checks (4 of 5 required to pass):
  1. stars >= 50
  2. not a fork
  3. description not blank
  4. pushed_at within 180 days
  5. default branch has a README (name contains readme, case-insensitive)
"""
import argparse
import json
import subprocess
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

import yaml

TOOLS_DIR = Path("data/tools")
DISCOVERY_LOG = Path("data/discovery_log.yaml")
TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")
STALE_DAYS = 180
MIN_STARS = 50

SEARCH_TOPICS = [
    "claude-code",
    "mcp-server",
    "claude-agent",
    "llm-tools",
    "claude-claude-code",
]

CATEGORY_RULES = [
    (["mcp-server", "mcp"], "mcp-server"),
    (["claude-code-plugin", "claude-plugin"], "claude-plugin"),
    (["agent-framework", "multi-agent", "orchestration"], "orchestration"),
    (["prompt-engineering", "prompt-library", "prompts"], "prompt-library"),
    (["sdk", "typescript-sdk", "python-sdk"], "sdk-pattern"),
    (["observability", "evaluation", "evals", "llm-eval"], "eval-observability"),
]
DEFAULT_CATEGORY = "complementary"


def gh_api(endpoint: str) -> dict | list | None:
    """Call gh api and return parsed JSON, or None on error."""
    result = subprocess.run(
        ["gh", "api", endpoint, "--paginate"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return None


def search_topic(topic: str) -> list[dict]:
    """Search GitHub for repos with the given topic. Returns list of repo items."""
    result = subprocess.run(
        ["gh", "api", f"search/repositories?q=topic:{topic}&sort=stars&per_page=100"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  WARNING: search failed for topic '{topic}': {result.stderr.strip()}", file=sys.stderr)
        return []
    try:
        data = json.loads(result.stdout)
        return data.get("items", [])
    except json.JSONDecodeError:
        return []


def existing_tool_ids() -> set[str]:
    """Return set of tool IDs already in data/tools/."""
    return {p.stem for p in TOOLS_DIR.glob("*.yaml")}


def repo_to_tool_id(repo: dict) -> str:
    owner = repo["owner"]["login"].lower().replace(".", "-")
    name = repo["name"].lower().replace(".", "-").replace("_", "-")
    return f"gh-{owner}-{name}"


def triage(repo: dict) -> tuple[int, dict[str, bool]]:
    """
    Run 5 triage checks. Returns (score, checks_dict).
    README check (API call) is skipped if the repo already fails 2+ cheaper checks.
    """
    pushed_at = repo.get("pushed_at", "")
    if pushed_at:
        pushed_dt = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
        age_days = (datetime.now(timezone.utc) - pushed_dt).days
        recently_active = age_days <= STALE_DAYS
    else:
        recently_active = False

    checks = {
        "stars_ge_50": repo.get("stargazers_count", 0) >= MIN_STARS,
        "not_fork": not repo.get("fork", True),
        "has_description": bool((repo.get("description") or "").strip()),
        "recently_active": recently_active,
        "has_readme": False,  # filled below if worth checking
    }

    # Only make the README API call if the repo could still pass (≤1 failure so far)
    cheap_failures = sum(1 for k, v in checks.items() if k != "has_readme" and not v)
    if cheap_failures <= 1:
        owner = repo["owner"]["login"]
        name = repo["name"]
        readme_result = subprocess.run(
            ["gh", "api", f"repos/{owner}/{name}/readme", "--silent"],
            capture_output=True, text=True
        )
        checks["has_readme"] = readme_result.returncode == 0

    score = sum(checks.values())
    return score, checks


def infer_category(repo: dict) -> str:
    topics = [t.lower() for t in repo.get("topics", [])]
    desc = (repo.get("description") or "").lower()
    name = repo.get("name", "").lower()

    for topic_keys, category in CATEGORY_RULES:
        if any(k in topics or k in desc or k in name for k in topic_keys):
            return category
    return DEFAULT_CATEGORY


def infer_status(pushed_at: str) -> str:
    if not pushed_at:
        return "archived"
    pushed_dt = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
    age_days = (datetime.now(timezone.utc) - pushed_dt).days
    if age_days < 60:
        return "active"
    elif age_days <= 180:
        return "stale"
    return "archived"


def build_draft_profile(repo: dict) -> dict:
    """Build a minimal valid tool profile dict from a GitHub repo API response."""
    tool_id = repo_to_tool_id(repo)
    pushed_at = repo.get("pushed_at", "")
    topics = repo.get("topics", [])

    # Use subdirectory URL if tool lives in one — can't detect from search, use homepage
    source_url = repo.get("homepage") or repo.get("html_url")
    if not source_url or not source_url.startswith("http"):
        source_url = repo["html_url"]

    profile = {
        "id": tool_id,
        "name": repo.get("name", tool_id),
        "source_url": source_url,
        "category": infer_category(repo),
        "pricing": "free",
        "license": (repo.get("license") or {}).get("spdx_id") or None,
        "status": infer_status(pushed_at),
        "scores": None,
        "score_confidence": None,
        "score_history": [],
        "tags": [t.replace("-", " ") for t in topics[:8]],
        "versus_refs": [],
    }
    return profile


def log_rejection(repo: dict, score: int, checks: dict[str, bool]) -> None:
    """Append a rejection entry to data/discovery_log.yaml."""
    entry = {
        "tool_id": repo_to_tool_id(repo),
        "source_url": repo["html_url"],
        "stars": repo.get("stargazers_count", 0),
        "date_seen": TODAY,
        "triage_score": f"{score}/5",
        "checks": checks,
        "reason": "below threshold (< 4/5 checks passed)",
    }

    existing = []
    if DISCOVERY_LOG.exists():
        with open(DISCOVERY_LOG) as f:
            existing = yaml.safe_load(f) or []

    # Avoid duplicate entries
    if not any(e.get("tool_id") == entry["tool_id"] for e in existing):
        existing.append(entry)
        with open(DISCOVERY_LOG, "w") as f:
            yaml.dump(existing, f, default_flow_style=False, allow_unicode=True, sort_keys=False)


def create_pr(tool_id: str, profile: dict) -> bool:
    """Write profile file, commit on a new branch, and open a draft PR."""
    branch = f"discover/{tool_id}"
    profile_path = TOOLS_DIR / f"{tool_id}.yaml"

    # Write the profile
    with open(profile_path, "w") as f:
        yaml.dump(profile, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

    # Git: create branch, add, commit, push
    cmds = [
        ["git", "checkout", "-b", branch],
        ["git", "add", str(profile_path)],
        ["git", "commit", "-m", f"chore: add discovered tool {tool_id}"],
        ["git", "push", "-u", "origin", branch],
    ]
    for cmd in cmds:
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"  ERROR: {' '.join(cmd)} failed: {r.stderr.strip()}", file=sys.stderr)
            return False

    # Open draft PR
    name = profile.get("name", tool_id)
    stars = "N/A"
    pr_body = f"""Discovered by daily crawler on {TODAY}.

**Tool:** [{name}]({profile['source_url']})
**Category:** {profile['category']}
**Status:** {profile['status']}

## Maintainer checklist before merging
- [ ] Verify source_url points to the correct repo/subdirectory
- [ ] Confirm category is accurate
- [ ] Confirm pricing (free / freemium / paid)
- [ ] Fix license if shown as null
- [ ] Add meaningful tags

*This PR was opened automatically. Human review required before merge.*
"""
    r = subprocess.run(
        ["gh", "pr", "create",
         "--title", f"chore: add discovered tool {name}",
         "--body", pr_body,
         "--draft",
         "--base", "main"],
        capture_output=True, text=True
    )
    if r.returncode != 0:
        print(f"  ERROR: gh pr create failed: {r.stderr.strip()}", file=sys.stderr)
        return False

    # Return to main for next iteration
    subprocess.run(["git", "checkout", "main"], capture_output=True)
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="AgentRadar daily crawler")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print candidates without writing files or creating PRs")
    args = parser.parse_args()

    known_ids = existing_tool_ids()
    print(f"Existing tools in dataset: {len(known_ids)}")

    # Collect unique candidates across all topics
    seen_full_names: set[str] = set()
    candidates: list[dict] = []

    for topic in SEARCH_TOPICS:
        print(f"\nSearching topic: {topic}")
        repos = search_topic(topic)
        print(f"  {len(repos)} results")
        for repo in repos:
            full_name = repo["full_name"]
            tool_id = repo_to_tool_id(repo)
            if full_name in seen_full_names:
                continue
            seen_full_names.add(full_name)
            if tool_id in known_ids:
                continue
            candidates.append(repo)
        time.sleep(1)  # avoid secondary rate limit

    print(f"\n{len(candidates)} new candidates to triage")

    passed = []
    rejected_count = 0

    for repo in candidates:
        tool_id = repo_to_tool_id(repo)
        score, checks = triage(repo)
        stars = repo.get("stargazers_count", 0)
        status_str = "PASS" if score >= 4 else "FAIL"
        print(f"  {status_str} [{score}/5] {repo['full_name']} ({stars}★) — "
              f"{', '.join(k for k, v in checks.items() if not v) or 'all checks pass'}")

        if score >= 4:
            passed.append(repo)
        else:
            rejected_count += 1
            if not args.dry_run:
                log_rejection(repo, score, checks)

        time.sleep(0.5)

    print(f"\nResults: {len(passed)} pass, {rejected_count} rejected")

    if args.dry_run:
        print("\n[DRY RUN] Would create PRs for:")
        for repo in passed:
            tool_id = repo_to_tool_id(repo)
            category = infer_category(repo)
            stars = repo.get("stargazers_count", 0)
            print(f"  {tool_id} ({category}, {stars}★) — {repo['html_url']}")
        return 0

    # Full run: create PRs
    created = 0
    for repo in passed:
        tool_id = repo_to_tool_id(repo)
        print(f"\nCreating PR for {tool_id}...")
        profile = build_draft_profile(repo)
        ok = create_pr(tool_id, profile)
        if ok:
            created += 1
            print(f"  PR created for {tool_id}")
        else:
            print(f"  Failed to create PR for {tool_id}")

    print(f"\nDone. {created} PRs opened, {rejected_count} tools logged to {DISCOVERY_LOG}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
