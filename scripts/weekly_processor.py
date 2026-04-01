#!/usr/bin/env python3
"""
weekly_processor.py — Monday maintenance run.

1. Re-evaluates status (active/stale/archived) for all tools by fetching
   pushed_at from GitHub API. Updates YAML if status changed.

2. Detects versus pages with >1.0 composite score drift since creation.
   (Compares score_history[0].overall to current scores.composite.)

3. Writes a digest draft to data/digests/YYYY-MM-DD-draft.md.

Usage:
  python scripts/weekly_processor.py [--dry-run]

The GitHub Actions workflow commits any changed YAMLs and the draft,
then triggers the site rebuild.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import NamedTuple

import yaml

REPO_ROOT = Path(__file__).parent.parent
TOOLS_DIR = REPO_ROOT / "data" / "tools"
VERSUS_DIR = REPO_ROOT / "data" / "versus"
DIGESTS_DIR = REPO_ROOT / "data" / "digests"
TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

STALE_THRESHOLD = 60    # days → active
ARCHIVE_THRESHOLD = 180  # days → archived


class StatusChange(NamedTuple):
    tool_id: str
    tool_name: str
    old_status: str
    new_status: str
    source_url: str


class VersusFlag(NamedTuple):
    versus_id: str
    tool_a: str
    tool_b: str
    score_drift: float


# ── GitHub API ─────────────────────────────────────────────────────────────


def gh_pushed_at(owner: str, repo: str) -> str | None:
    """Return pushed_at ISO string for a GitHub repo, or None on error."""
    result = subprocess.run(
        ["gh", "api", f"repos/{owner}/{repo}", "--jq", ".pushed_at"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip().strip('"') or None


def compute_status(pushed_at: str | None) -> str:
    if not pushed_at:
        return "archived"
    try:
        pushed_dt = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
    except ValueError:
        return "archived"
    age_days = (datetime.now(timezone.utc) - pushed_dt).days
    if age_days < STALE_THRESHOLD:
        return "active"
    elif age_days <= ARCHIVE_THRESHOLD:
        return "stale"
    return "archived"


def extract_github_owner_repo(source_url: str) -> tuple[str, str] | None:
    """Parse owner and repo from a GitHub URL. Returns None for non-GitHub URLs."""
    m = re.match(r"https?://github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$", source_url)
    if not m:
        return None
    return m.group(1), m.group(2)


# ── Status refresh ────────────────────────────────────────────────────────


def refresh_tool_status(
    profile_path: Path, dry_run: bool
) -> StatusChange | None:
    with profile_path.open() as f:
        profile = yaml.safe_load(f)

    source_url = profile.get("source_url", "")
    parsed = extract_github_owner_repo(source_url)
    if not parsed:
        return None  # Non-GitHub tool — skip

    owner, repo = parsed
    pushed_at = gh_pushed_at(owner, repo)
    new_status = compute_status(pushed_at)
    old_status = profile.get("status", "active")

    if new_status == old_status:
        return None  # No change

    change = StatusChange(
        tool_id=profile["id"],
        tool_name=profile.get("name", profile["id"]),
        old_status=old_status,
        new_status=new_status,
        source_url=source_url,
    )

    if not dry_run:
        profile["status"] = new_status
        with profile_path.open("w") as f:
            yaml.dump(profile, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

    return change


# ── Versus staleness ──────────────────────────────────────────────────────


def check_versus_staleness() -> list[VersusFlag]:
    """
    Flag versus pages where the composite score of either tool has drifted >1.0
    from its value at the time the versus page was created.
    """
    # Load all current composite scores
    current_composites: dict[str, float] = {}
    for path in TOOLS_DIR.glob("*.yaml"):
        with path.open() as f:
            p = yaml.safe_load(f)
        scores = p.get("scores") or {}
        c = scores.get("composite")
        if c is not None:
            current_composites[p["id"]] = float(c)

    flags: list[VersusFlag] = []
    for path in VERSUS_DIR.glob("*.md"):
        text = path.read_text()
        m = re.match(r"^---\n([\s\S]*?)\n---", text)
        if not m:
            continue
        meta = yaml.safe_load(m.group(1)) or {}
        tool_a = meta.get("tool_a", "")
        tool_b = meta.get("tool_b", "")

        # Load score_history[0] for each tool (score at creation time)
        drift = 0.0
        for tool_id in [tool_a, tool_b]:
            current = current_composites.get(tool_id)
            if current is None:
                continue
            tool_path = TOOLS_DIR / f"{tool_id}.yaml"
            if not tool_path.exists():
                continue
            with tool_path.open() as f:
                p = yaml.safe_load(f)
            history = p.get("score_history") or []
            if history:
                original = float(history[0].get("overall", current))
                drift = max(drift, abs(current - original))

        if drift > 1.0:
            flags.append(VersusFlag(
                versus_id=meta.get("id", path.stem),
                tool_a=tool_a,
                tool_b=tool_b,
                score_drift=round(drift, 2),
            ))

    return flags


# ── Digest draft ──────────────────────────────────────────────────────────


def write_digest_draft(
    status_changes: list[StatusChange],
    versus_flags: list[VersusFlag],
) -> Path:
    DIGESTS_DIR.mkdir(parents=True, exist_ok=True)
    draft_path = DIGESTS_DIR / f"{TODAY}-draft.md"

    lines = [
        f"# AgentRadar Weekly Digest — {TODAY}",
        "",
        "_Draft — review before sending via Buttondown (P1-007)._",
        "",
    ]

    if status_changes:
        lines += ["## Status Changes", ""]
        for c in status_changes:
            arrow = f"{c.old_status} → {c.new_status}"
            label = "⚠" if c.new_status == "stale" else "✗" if c.new_status == "archived" else "✓"
            lines.append(f"- {label} **[{c.tool_name}]({c.source_url})** — {arrow}")
        lines.append("")
    else:
        lines += ["## Status Changes", "", "_No status changes this week._", ""]

    if versus_flags:
        lines += ["## Versus Pages — Score Drift Detected", ""]
        for v in versus_flags:
            lines.append(
                f"- **{v.versus_id}** — drift {v.score_drift:.1f} points "
                f"({v.tool_a} vs {v.tool_b}). Review whether verdict still holds."
            )
        lines.append("")
    else:
        lines += ["## Versus Pages", "", "_All versus pages within acceptable drift._", ""]

    lines += [
        "## Dataset",
        "",
        f"- Tools tracked: {len(list(TOOLS_DIR.glob('*.yaml')))}",
        f"- Versus pages: {len(list(VERSUS_DIR.glob('*.md')))}",
        "",
        "---",
        "_To publish: review this file, then send via Buttondown (P1-007)._",
    ]

    draft_path.write_text("\n".join(lines) + "\n")
    return draft_path


# ── Buttondown ────────────────────────────────────────────────────────────


def send_buttondown_email(
    subject: str, body: str, audience: str, api_key: str
) -> bool:
    """
    Send an email via Buttondown API.
    audience: "pro" → sends only to subscribers tagged "pro" (early access, Saturday)
              "public" → sends to all subscribers (Monday)
    """
    tags = ["pro"] if audience == "pro" else []
    payload = json.dumps({
        "subject": subject,
        "body": body,
        "status": "about_to_send",
        "email_type": "regular",
        "filters": [{"type": "tag", "value": "pro"}] if tags else [],
    }).encode()

    req = urllib.request.Request(
        "https://api.buttondown.email/v1/emails",
        data=payload,
        headers={
            "Authorization": f"Token {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status in (200, 201)
    except Exception as exc:
        print(f"  ERROR: Buttondown send failed: {exc}", file=sys.stderr)
        return False


def maybe_send_digest(draft_path: Path, dry_run: bool) -> None:
    """
    Send the digest via Buttondown if the API key is configured.
    Saturday (day_of_week == 5) → Pro early access.
    Monday (day_of_week == 0) → Public send.
    """
    api_key = os.environ.get("BUTTONDOWN_API_KEY")
    if not api_key:
        print("BUTTONDOWN_API_KEY not set — skipping email send")
        return

    day_of_week = datetime.now(timezone.utc).weekday()  # 0=Monday, 5=Saturday
    if day_of_week == 5:
        audience = "pro"
        subject = f"[Pro] AgentRadar Digest — {TODAY} (48h early)"
    elif day_of_week == 0:
        audience = "public"
        subject = f"AgentRadar Digest — {TODAY}"
    else:
        print(f"Not Saturday or Monday (day={day_of_week}) — skipping email send")
        return

    body = draft_path.read_text()
    if dry_run:
        print(f"[DRY RUN] Would send Buttondown email: '{subject}' to {audience}")
        return

    ok = send_buttondown_email(subject, body, audience, api_key)
    if ok:
        print(f"  Sent: '{subject}' → {audience} subscribers")
    else:
        print(f"  Failed to send digest email")


# ── Main ───────────────────────────────────────────────────────────────────


def main() -> int:
    parser = argparse.ArgumentParser(description="AgentRadar weekly processor")
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print changes without writing files"
    )
    args = parser.parse_args()

    print(f"AgentRadar weekly processor — {TODAY}")
    if args.dry_run:
        print("DRY RUN: no files will be written\n")

    # Step 1: Refresh status for all tools
    print("Checking tool statuses via GitHub API...")
    status_changes: list[StatusChange] = []

    tool_files = sorted(TOOLS_DIR.glob("*.yaml"))
    for path in tool_files:
        change = refresh_tool_status(path, args.dry_run)
        if change:
            arrow = f"{change.old_status} → {change.new_status}"
            action = "[DRY RUN] would update" if args.dry_run else "Updated"
            print(f"  {action}: {change.tool_id} ({arrow})")
            status_changes.append(change)

    print(f"  {len(status_changes)} status change(s) found")

    # Step 2: Check versus page staleness
    print("\nChecking versus page score drift...")
    versus_flags = check_versus_staleness()
    for v in versus_flags:
        print(f"  DRIFT {v.score_drift:.1f}: {v.versus_id}")
    if not versus_flags:
        print("  All versus pages within acceptable drift")

    # Step 3: Rebuild index if status changed
    if status_changes and not args.dry_run:
        print("\nRebuilding tools-index.json...")
        result = subprocess.run(
            [sys.executable, str(REPO_ROOT / "scripts" / "build_index.py")],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f"  ERROR: build_index.py failed: {result.stderr}", file=sys.stderr)
        else:
            print(f"  {result.stdout.strip()}")

    # Step 4: Write digest draft
    if not args.dry_run:
        draft_path = write_digest_draft(status_changes, versus_flags)
        print(f"\nDigest draft: {draft_path.relative_to(REPO_ROOT)}")
    else:
        print("\n[DRY RUN] Would write digest draft")
        draft_path = DIGESTS_DIR / f"{TODAY}-draft.md"

    # Step 5: Send via Buttondown (Saturday = Pro early access, Monday = public)
    print("\nChecking Buttondown send conditions...")
    maybe_send_digest(draft_path, args.dry_run)

    total_changes = len(status_changes)
    print(f"\nDone. {total_changes} tool(s) updated, {len(versus_flags)} versus flag(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
