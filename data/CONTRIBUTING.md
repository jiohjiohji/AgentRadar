# Contributing to AgentRadar

AgentRadar is community-scored. The dataset improves only when developers who have used these tools submit honest evaluations. This file explains the process.

---

## Submitting an evaluation

### Step 1 — Find the tool ID

Tool IDs are in `data/tools/`. Every YAML file starts with an `id` field, e.g. `gh-wshobson-agents`. You can also open the file and read the `name` field to confirm you have the right tool.

### Step 2 — Open an Evaluation Report issue

[New Issue → Evaluation Report](https://github.com/jiohjiohji/AgentRadar/issues/new?template=evaluation-report.yml)

The form asks for:
- **Tool ID** — the stable identifier from `data/tools/`
- **Your role** — solo-developer, small-team, or enterprise-dev
- **Claude Code version** — run `claude --version`
- **Platform** — macOS, Linux, or Windows/WSL
- **Task performed** — what you actually did, concretely (not "I used it for coding")
- **Scores** — 0–10 for each of 6 dimensions with one sentence of evidence per score
- **One-sentence verdict** — the most important field; must be specific and opinionated
- **Conflict of interest** — declare if you authored or contributed to the tool

### Step 3 — Wait for review

A maintainer validates the report within 48 hours. If the format passes, it is committed to `data/evaluations/` and the tool's scores are recomputed.

---

## Scoring guide

Scores are 0–10 per dimension. A score without evidence is rejected.

| Dimension | Key | Good evidence |
|-----------|-----|---------------|
| Productivity | `p` | "Saved ~40 min on a 200-line refactor vs manual" |
| Quality | `q` | "Output matched gold standard on 6/8 test cases" |
| Cost Efficiency | `c` | "~6,200 tokens; baseline manual approach is ~4,100" |
| Reliability | `r` | "Passed 5/5 runs with consistent output" |
| Composability | `x` | "Integrated with Playwright MCP in under 10 minutes" |
| Setup Friction | `f` | "45 minutes to first working result; docs unclear on X" |

**Calibration anchors:**
- **10** — best-in-class, hard to imagine better
- **7–9** — genuinely good, would recommend
- **4–6** — usable with caveats
- **1–3** — significant problems
- **0** — broken / unusable

---

## Conflict of interest policy

Tool authors and contributors **may** submit evaluations for their own tools. You must check the CoI box in the issue form.

- CoI evaluations are tagged in the YAML and shown in the UI
- They count toward the score only after 2 independent (non-CoI) reports exist
- A tool cannot reach `score_confidence: medium` on CoI reports alone

---

## Score update rules

Scores are recomputed after each accepted evaluation:

- `score_confidence: low` — fewer than 3 accepted reports
- `score_confidence: medium` — 3–9 accepted reports
- `score_confidence: high` — 10+ accepted reports

A score change of ±0.5 or more requires 3 independent reports before it is committed. This prevents single-report swings on established tools.

---

## Submitting a new tool profile

Use the [Tool Submission issue form](https://github.com/jiohjiohji/AgentRadar/issues/new?template=tool-submission.yml). A maintainer creates the YAML and validates it against `data/schema.yaml` before merging.

Do not submit tools you cannot verify via a public GitHub URL. Tools with no repo, no commits in the past year, or fewer than 10 GitHub stars are generally out of scope unless they fill a unique category gap.

---

## What gets rejected

- Scores without evidence sentences
- Verdicts like "great tool" or "works well" — must be specific
- Evaluations for tools the reporter has not actually used on a real task
- Duplicate evaluations from the same reporter for the same tool within 30 days
- Evaluations submitted to inflate or damage a competitor's score (detectable via pattern analysis across reporters)
