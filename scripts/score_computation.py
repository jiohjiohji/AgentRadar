#!/usr/bin/env python3
"""
Computes dimension scores for each tool from its seed evaluations.

Input:  data/evaluations/*.yaml
Output: scores block + score_confidence + score_history written to each
        data/tools/[tool-id].yaml

Run: python scripts/score_computation.py

Logic:
  - Groups evaluations by tool_id
  - Skips any evaluation where conflict_of_interest != "none"
  - Computes mean for each of the 6 dimensions (p, q, c, r, x, f)
  - Computes composite = mean of all non-null dimension means
  - Sets score_confidence: low (<3 evals), medium (3-9), high (10+)
  - Appends a score_history entry for today
  - Stores eval_count and last_computed inside the scores block
"""
import sys
import yaml
from pathlib import Path
from collections import defaultdict
from statistics import mean

EVAL_DIR = Path("data/evaluations")
TOOLS_DIR = Path("data/tools")
DIMENSIONS = ["p", "q", "c", "r", "x", "f"]
COMPUTE_DATE = "2026-03-31"


def load_evaluations() -> tuple[dict, int]:
    """Load all evaluations grouped by tool_id. Returns (by_tool, coi_skipped)."""
    by_tool: dict[str, list] = defaultdict(list)
    skipped = 0
    for path in sorted(EVAL_DIR.glob("*.yaml")):
        with open(path) as f:
            ev = yaml.safe_load(f)
        coi = str(ev.get("conflict_of_interest", "")).strip().lower()
        if coi != "none":
            skipped += 1
            continue
        by_tool[ev["tool_id"]].append(ev)
    return dict(by_tool), skipped


def compute_scores(evals: list) -> tuple[dict, str]:
    """
    Compute dimension means and metadata from a list of evaluations.
    Returns (scores_dict, confidence_string).
    """
    dim_scores: dict = {}
    for dim in DIMENSIONS:
        values = []
        for ev in evals:
            dim_data = ev.get("scores", {}).get(dim, {})
            v = dim_data.get("value") if isinstance(dim_data, dict) else None
            if v is not None:
                values.append(float(v))
        dim_scores[dim] = round(mean(values), 1) if values else None

    valid_dims = [v for v in dim_scores.values() if v is not None]
    composite = round(mean(valid_dims), 1) if valid_dims else None

    n = len(evals)
    if n >= 10:
        confidence = "high"
    elif n >= 3:
        confidence = "medium"
    else:
        confidence = "low"

    scores = {**dim_scores, "composite": composite, "eval_count": n, "last_computed": COMPUTE_DATE}
    return scores, confidence


def write_scores(tool_id: str, scores: dict, confidence: str) -> bool:
    """Write scores, score_confidence, and score_history entry to the tool profile."""
    tool_path = TOOLS_DIR / f"{tool_id}.yaml"
    if not tool_path.exists():
        print(f"  WARNING: No tool profile found for {tool_id}")
        return False

    with open(tool_path) as f:
        profile = yaml.safe_load(f)

    profile["scores"] = scores
    profile["score_confidence"] = confidence

    if not isinstance(profile.get("score_history"), list):
        profile["score_history"] = []
    if not any(e.get("date") == COMPUTE_DATE for e in profile["score_history"]):
        profile["score_history"].append({
            "date": COMPUTE_DATE,
            "overall": scores["composite"],
            "benchmark_version": "1.0",
        })

    with open(tool_path, "w") as f:
        yaml.dump(profile, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

    return True


def main() -> int:
    print("Loading evaluations...")
    by_tool, coi_skipped = load_evaluations()
    print(f"  Loaded evals for {len(by_tool)} tools. CoI-skipped: {coi_skipped}.")

    updated = 0
    failed = []

    for tool_id, evals in sorted(by_tool.items()):
        scores, confidence = compute_scores(evals)
        if scores["composite"] is None:
            print(f"  SKIP  {tool_id}: no scoreable dimensions")
            failed.append(tool_id)
            continue

        ok = write_scores(tool_id, scores, confidence)
        if ok:
            composite = scores["composite"]
            n = scores["eval_count"]
            print(f"  WROTE {tool_id}: composite={composite} conf={confidence} n={n}")
            updated += 1
        else:
            failed.append(tool_id)

    print(f"\nResult: {updated} tools updated, {len(failed)} failed/skipped.")
    if failed:
        print(f"Failed: {failed}")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
