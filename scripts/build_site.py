#!/usr/bin/env python3
"""
build_site.py — Generate static HTML from YAML tool profiles and versus markdown.

Output: web/dist/
  index.html              — homepage with tool grid + Pagefind search
  tools/[id].html         — one page per tool (50 pages)
  versus/[id].html        — one page per versus comparison

Run locally:
  python scripts/build_site.py

Then install Pagefind and build the search index:
  npx -y pagefind --site web/dist
"""

import html
import json
import re
import shutil
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).parent.parent
TOOLS_DIR = REPO_ROOT / "data" / "tools"
VERSUS_DIR = REPO_ROOT / "data" / "versus"
STATIC_DIR = REPO_ROOT / "web" / "static"
DIST_DIR = REPO_ROOT / "web" / "dist"
INDEX_FILE = REPO_ROOT / "data" / "tools-index.json"

GITHUB_REPO = "https://github.com/jiohjiohji/AgentRadar"

SCORE_LABELS = {
    "p": "Productivity",
    "q": "Quality",
    "c": "Cost Efficiency",
    "r": "Reliability",
    "x": "Composability",
    "f": "Setup Friction",
}


# ── Helpers ────────────────────────────────────────────────────────────────


def esc(s: str) -> str:
    return html.escape(str(s))


def status_badge(status: str) -> str:
    return f'<span class="badge badge-{esc(status)}">{esc(status)}</span>'


def pricing_badge(pricing: str) -> str:
    return f'<span class="badge badge-{esc(pricing)}">{esc(pricing)}</span>'


def nav() -> str:
    return f"""
<nav>
  <div class="container nav-inner">
    <a class="nav-brand" href="/">AgentRadar</a>
    <div class="nav-links">
      <a href="/tools/">Tools</a>
      <a href="/versus/">Versus</a>
      <a href="{GITHUB_REPO}" target="_blank" rel="noopener">GitHub</a>
    </div>
  </div>
</nav>""".strip()


def footer() -> str:
    return f"""
<footer>
  <div class="container footer-inner">
    <span>Data: <a href="{GITHUB_REPO}" target="_blank">jiohjiohji/AgentRadar</a></span>
    <span>·</span>
    <span><a href="{GITHUB_REPO}/blob/main/data/CONTRIBUTING.md" target="_blank">Contribute an evaluation</a></span>
  </div>
</footer>""".strip()


def page(title: str, body: str, description: str = "AgentRadar — developer tool intelligence") -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(title)} — AgentRadar</title>
  <meta name="description" content="{esc(description)}">
  <link rel="stylesheet" href="/static/style.css">
  <link rel="stylesheet" href="/pagefind/pagefind-ui.css">
</head>
<body>
{nav()}
<main class="container">
{body}
</main>
{footer()}
<script src="/pagefind/pagefind-ui.js"></script>
</body>
</html>"""


# ── Tool pages ─────────────────────────────────────────────────────────────


def render_scores(scores: dict) -> str:
    if not scores or scores.get("eval_count", 0) < 2:
        return '<p class="text-muted">No community scores yet — be the first to evaluate this tool.</p>'

    confidence = scores.get("confidence", "")
    eval_count = scores.get("eval_count", 0)
    composite = scores.get("composite")

    rows = ""
    for key, label in SCORE_LABELS.items():
        val = scores.get(key)
        if val is None:
            continue
        bar_width = int(val / 10 * 120)
        rows += f"""
    <tr>
      <td>{esc(label)}</td>
      <td>{val:.1f}<span class="score-bar" style="width:{bar_width}px"></span></td>
    </tr>"""

    composite_row = ""
    if composite is not None:
        composite_row = f"""
    <tr class="score-composite">
      <td>Composite</td>
      <td>{composite:.1f}</td>
    </tr>"""

    return f"""
<table class="score-table">
  <thead><tr><th>Dimension</th><th>Score (0–10)</th></tr></thead>
  <tbody>{rows}{composite_row}</tbody>
</table>
<p style="font-size:0.8rem;color:var(--text-muted)">{esc(confidence.title())} confidence — {eval_count} community report(s).
<a href="{GITHUB_REPO}/blob/main/data/CONTRIBUTING.md">Add your evaluation →</a></p>"""


def build_tool_page(profile: dict) -> str:
    name = esc(profile.get("name", ""))
    source_url = esc(profile.get("source_url", ""))
    category = esc(profile.get("category", ""))
    status = profile.get("status", "active")
    pricing = profile.get("pricing", "free")
    license_val = profile.get("license") or "Unknown"
    tags = profile.get("tags") or []
    versus_refs = profile.get("versus_refs") or []
    scores = profile.get("scores") or {}
    scores["eval_count"] = scores.get("eval_count", 0)
    scores["confidence"] = profile.get("score_confidence")

    tag_html = "".join(f'<span class="tag">{esc(t)}</span>' for t in tags)
    versus_html = ""
    if versus_refs:
        links = ""
        for v in versus_refs:
            vid = esc(v.get("id", "") if isinstance(v, dict) else str(v))
            verdict = esc(v.get("verdict_short", "") if isinstance(v, dict) else "")
            links += f'<li><a href="/versus/{vid}.html">{vid}</a>{" — " + verdict if verdict else ""}</li>'
        versus_html = f"<h2>Versus</h2><ul>{links}</ul>"

    body = f"""
<div class="tool-detail" data-pagefind-body>
  <div class="tool-header">
    <h1>{name}</h1>
    <div class="tool-attrs">
      {status_badge(status)}
      {pricing_badge(pricing)}
      <span class="badge" style="background:var(--border);color:var(--text-muted)">{esc(category)}</span>
      <span style="color:var(--text-muted);font-size:0.85rem">License: {esc(license_val)}</span>
    </div>
    <div class="tool-source"><a href="{source_url}" target="_blank" rel="noopener">{source_url} ↗</a></div>
  </div>
  <div class="tool-tags">{tag_html}</div>
  <h2 style="margin:1.5rem 0 0.5rem">Community Scores</h2>
  {render_scores(scores)}
  {versus_html}
</div>"""

    return page(
        title=profile.get("name", ""),
        body=body,
        description=f"{profile.get('name')} — {category} tool on AgentRadar"
    )


# ── Versus pages ───────────────────────────────────────────────────────────


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split YAML frontmatter and markdown body."""
    m = re.match(r"^---\n([\s\S]*?)\n---\n?", text)
    if not m:
        return {}, text
    meta = yaml.safe_load(m.group(1)) or {}
    body = text[m.end():].strip()
    return meta, body


def markdown_to_html(md: str) -> str:
    """Minimal markdown → HTML. Handles headers, bold, tables, paragraphs."""
    lines = md.split("\n")
    out = []
    in_table = False
    in_para = False

    def flush_para():
        nonlocal in_para
        if in_para:
            out.append("</p>")
            in_para = False

    for line in lines:
        # Tables
        if "|" in line and line.strip().startswith("|"):
            if not in_table:
                flush_para()
                out.append("<table>")
                in_table = True
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if all(re.match(r"^[-:]+$", c) for c in cells if c):
                out.append("<tbody>")
                continue
            tag = "th" if not any("<tbody>" in x for x in out[-5:]) else "td"
            out.append("<tr>" + "".join(f"<{tag}>{esc(c)}</{tag}>" for c in cells) + "</tr>")
            continue

        if in_table:
            out.append("</tbody></table>")
            in_table = False

        # Headers
        hm = re.match(r"^(#{1,3})\s+(.*)", line)
        if hm:
            flush_para()
            level = len(hm.group(1))
            text = esc(hm.group(2))
            out.append(f"<h{level}>{text}</h{level}>")
            continue

        # Blank line
        if not line.strip():
            flush_para()
            continue

        # Inline bold/code
        processed = re.sub(r"\*\*(.+?)\*\*", lambda m: f"<strong>{esc(m.group(1))}</strong>", esc(line))
        processed = re.sub(r"`(.+?)`", lambda m: f"<code>{m.group(1)}</code>", processed)

        if not in_para:
            out.append("<p>")
            in_para = True
        out.append(processed + " ")

    flush_para()
    if in_table:
        out.append("</tbody></table>")

    return "\n".join(out)


def build_versus_page(meta: dict, md_body: str) -> str:
    tool_a = esc(meta.get("tool_a", ""))
    tool_b = esc(meta.get("tool_b", ""))
    category = esc(meta.get("category", ""))
    valid_until = esc(meta.get("valid_until", ""))

    content_html = markdown_to_html(md_body)

    body = f"""
<div class="versus-header" data-pagefind-body>
  <h1><a href="/tools/{tool_a}.html">{tool_a}</a></h1>
  <span class="vs-divider">vs</span>
  <h1><a href="/tools/{tool_b}.html">{tool_b}</a></h1>
</div>
<p style="color:var(--text-muted);font-size:0.85rem">Category: {category} · Valid until: {valid_until}</p>
<div class="prose" data-pagefind-body>
  {content_html}
</div>"""

    return page(
        title=f"{meta.get('tool_a', '')} vs {meta.get('tool_b', '')}",
        body=body,
        description=f"Head-to-head: {meta.get('tool_a')} vs {meta.get('tool_b')} on AgentRadar"
    )


# ── Index page ─────────────────────────────────────────────────────────────


def build_index_page(tools: list[dict]) -> str:
    cards = ""
    for t in sorted(tools, key=lambda x: x.get("name", "")):
        tid = esc(t.get("id", ""))
        name = esc(t.get("name", ""))
        status = t.get("status", "active")
        pricing = t.get("pricing", "free")
        category = esc(t.get("category", ""))
        tags = t.get("tags") or []
        tag_html = "".join(f'<span class="tag">{esc(tg)}</span>' for tg in tags[:4])
        composite = t.get("composite")
        score_html = f'<span>★ {composite:.1f}</span>' if composite else ""

        cards += f"""
<div class="tool-card">
  <h3><a href="/tools/{tid}.html">{name}</a></h3>
  <div class="tool-meta">
    {status_badge(status)}
    {pricing_badge(pricing)}
    <span>{category}</span>
    {score_html}
  </div>
  <div class="tool-tags">{tag_html}</div>
</div>"""

    body = f"""
<div class="hero">
  <h1>AgentRadar</h1>
  <p>Community-evaluated tools for Claude Code and agentic workflows.
     Find what fits your stack — without the noise.</p>
</div>
<div class="search-wrap">
  <div id="pagefind-search"></div>
</div>
<h2 style="margin:1rem 0 0.75rem;color:var(--text-muted);font-size:0.9rem;text-transform:uppercase;letter-spacing:0.05em">
  {len(tools)} tools
</h2>
<div class="tool-grid" data-pagefind-body>
  {cards}
</div>
<script>
  window.addEventListener("DOMContentLoaded", () => {{
    new PagefindUI({{ element: "#pagefind-search", showImages: false }});
  }});
</script>"""

    return page(
        title="AgentRadar",
        body=body,
        description="Community-evaluated tools for Claude Code and agentic workflows"
    )


# ── Main ───────────────────────────────────────────────────────────────────


def main() -> None:
    # Clean and create output directory
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True)
    (DIST_DIR / "tools").mkdir()
    (DIST_DIR / "versus").mkdir()

    # Copy static assets
    shutil.copytree(STATIC_DIR, DIST_DIR / "static")

    # Load index for homepage
    with INDEX_FILE.open() as f:
        index = json.load(f)
    tools_summary = index.get("tools", [])

    # Generate tool pages
    tool_files = sorted(TOOLS_DIR.glob("*.yaml"))
    if not tool_files:
        print("ERROR: No tool YAMLs found.", file=sys.stderr)
        sys.exit(1)

    tool_count = 0
    for path in tool_files:
        with path.open() as f:
            profile = yaml.safe_load(f)
        tool_id = profile.get("id", path.stem)
        html_content = build_tool_page(profile)
        (DIST_DIR / "tools" / f"{tool_id}.html").write_text(html_content)
        tool_count += 1

    # Generate versus pages
    versus_files = sorted(VERSUS_DIR.glob("*.md"))
    versus_count = 0
    for path in versus_files:
        text = path.read_text()
        meta, body = parse_frontmatter(text)
        vid = meta.get("id", path.stem)
        html_content = build_versus_page(meta, body)
        (DIST_DIR / "versus" / f"{vid}.html").write_text(html_content)
        versus_count += 1

    # Generate homepage
    index_html = build_index_page(tools_summary)
    (DIST_DIR / "index.html").write_text(index_html)

    # Tools listing page (redirect to index for now, search covers discovery)
    (DIST_DIR / "tools" / "index.html").write_text(index_html)

    print(f"OK: {tool_count} tool pages, {versus_count} versus pages → {DIST_DIR.relative_to(REPO_ROOT)}")
    print("Next: npx pagefind --site web/dist  (builds browser search index)")


if __name__ == "__main__":
    main()
