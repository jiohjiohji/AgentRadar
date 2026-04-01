/**
 * check.ts — Match detected tools against the dataset, produce a health report.
 *
 * Matching strategy: tokenize both the detected tool name and the dataset tool
 * id/name, count overlapping tokens. Score >= 2 is a match.
 *
 * Flags:
 *   archived  → ERROR (exit 1)
 *   stale     → WARN  (exit 1)
 *   upgrade   → INFO  (exit 1) — better active alternative in same category
 */

import type { CheckReport, CheckResult, DetectedTool, ToolSummary } from "./types.js";

/** Tokenize a tool name or id into lowercase words. */
function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/^@[^/]+\//, "") // strip npm scope
    .split(/[-_/.@\s]+/)
    .filter((t) => t.length > 1);
}

/** Overlap count between two token sets. */
function overlap(a: string[], b: string[]): number {
  const bSet = new Set(b);
  return a.filter((t) => bSet.has(t)).length;
}

/** Find the best matching tool in the index for a detected tool name. */
export function matchTool(
  detected: DetectedTool,
  tools: ToolSummary[]
): ToolSummary | null {
  const queryTokens = tokenize(detected.name);
  let best: ToolSummary | null = null;
  let bestScore = 0; // any overlap (score >= 1) qualifies

  for (const tool of tools) {
    const idTokens = tokenize(tool.id);
    const nameTokens = tokenize(tool.name);
    const score = Math.max(
      overlap(queryTokens, idTokens),
      overlap(queryTokens, nameTokens)
    );
    if (score > bestScore) {
      bestScore = score;
      best = tool;
    }
  }

  return best;
}

/**
 * Find the best active alternative for a tool in the same category.
 * Returns null if no better alternative exists.
 * "Better" = active + (composite score >= current + 1.5 OR current is archived).
 */
export function findAlternative(
  current: ToolSummary,
  tools: ToolSummary[]
): ToolSummary | null {
  const currentComposite = current.composite ?? 0;
  const threshold = current.status === "archived" ? -Infinity : currentComposite + 1.5;

  return (
    tools
      .filter(
        (t) =>
          t.id !== current.id &&
          t.category === current.category &&
          t.status === "active" &&
          (t.composite ?? 0) >= threshold
      )
      .sort((a, b) => (b.composite ?? 0) - (a.composite ?? 0))[0] ?? null
  );
}

/** Classify a matched tool and build the check result. */
export function classifyTool(
  detected: DetectedTool,
  matched: ToolSummary,
  allTools: ToolSummary[]
): CheckResult {
  if (matched.status === "archived") {
    const alt = findAlternative(matched, allTools);
    return {
      detected,
      matched,
      status: "archived",
      message: `${matched.name} is archived and no longer maintained`,
      alternative: alt,
    };
  }

  if (matched.status === "stale") {
    const alt = findAlternative(matched, allTools);
    return {
      detected,
      matched,
      status: "stale",
      message: `${matched.name} has not been updated in 60+ days`,
      alternative: alt,
    };
  }

  const alt = findAlternative(matched, allTools);
  if (alt) {
    return {
      detected,
      matched,
      status: "upgrade",
      message: `${matched.name} is active but ${alt.name} scores significantly higher`,
      alternative: alt,
    };
  }

  return {
    detected,
    matched,
    status: "healthy",
    message: `${matched.name} is actively maintained`,
    alternative: null,
  };
}

/** Run the full check against the index. */
export function runCheck(
  detected: DetectedTool[],
  tools: ToolSummary[],
  projectName: string
): CheckReport {
  const results: CheckResult[] = [];

  for (const d of detected) {
    const matched = matchTool(d, tools);
    if (!matched) {
      // Not in the dataset — not an error, just not tracked
      results.push({
        detected: d,
        matched: null,
        status: "unmatched",
        message: `${d.name} is not in the AgentRadar dataset`,
        alternative: null,
      });
      continue;
    }
    results.push(classifyTool(d, matched, tools));
  }

  const hasIssues = results.some((r) =>
    ["archived", "stale", "upgrade"].includes(r.status)
  );

  return {
    project: projectName,
    checked_at: new Date().toISOString(),
    results,
    exit_code: hasIssues ? 1 : 0,
  };
}
