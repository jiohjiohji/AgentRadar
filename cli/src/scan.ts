/**
 * scan.ts — Read the project, find tool gaps, recommend 1–3 tools.
 *
 * Gap detection:
 *   1. Match each detected tool name → dataset tool (same fuzzy logic as check.ts)
 *   2. Collect the categories already covered
 *   3. Find categories with no coverage
 *   4. For each gap category, rank candidates and take the best one
 *   5. Return top 3 across all gap categories
 */

import { matchTool } from "./check.js";
import { rankTools } from "./ranking.js";
import type { DetectedTool, RankResult, ScanReport, ToolSummary, UserStyle } from "./types.js";

/** All categories that exist in the dataset. */
const ALL_CATEGORIES = [
  "mcp-server",
  "claude-plugin",
  "claudemd-framework",
  "orchestration",
  "prompt-library",
  "sdk-pattern",
  "ide-integration",
  "eval-observability",
  "complementary",
] as const;

type Category = (typeof ALL_CATEGORIES)[number];

/**
 * Map detected tool names to their categories in the dataset.
 * Returns the set of categories already present.
 */
function inferCoveredCategories(
  detected: DetectedTool[],
  tools: ToolSummary[]
): Set<string> {
  const covered = new Set<string>();
  for (const d of detected) {
    const match = matchTool(d, tools);
    if (match) covered.add(match.category);
  }
  return covered;
}

/**
 * For each gap category, find the best active tool.
 * Returns one result per gap category, sorted by rank score.
 * Deduplicated — the same tool will not appear twice.
 */
function recommendForGaps(
  gapCategories: string[],
  allTools: ToolSummary[],
  intentSignals: string[],
  style: UserStyle,
  limit: number
): RankResult[] {
  const seen = new Set<string>();
  const results: RankResult[] = [];

  for (const category of gapCategories) {
    const categoryTools = allTools.filter((t) => t.category === category);
    const ranked = rankTools(categoryTools, intentSignals.join(","), category, 1, style);
    const top = ranked[0];
    if (top && !seen.has(top.tool.id)) {
      seen.add(top.tool.id);
      results.push(top);
    }
    if (results.length >= limit) break;
  }

  return results;
}

export function runScan(
  detected: DetectedTool[],
  tools: ToolSummary[],
  projectName: string,
  limit = 3,
  intentSignals: string[] = [],
  style: UserStyle = "balanced"
): ScanReport {
  const coveredCategories = inferCoveredCategories(detected, tools);
  const gapCategories = ALL_CATEGORIES.filter((c) => !coveredCategories.has(c));
  const recommendations = recommendForGaps(gapCategories, tools, intentSignals, style, limit);

  return {
    project: projectName,
    scanned_at: new Date().toISOString(),
    covered_categories: [...coveredCategories].sort(),
    gap_categories: gapCategories,
    recommendations,
    intent_signals: intentSignals,
    style,
  };
}

/** Return tools matching a free-text need against the full index. */
export function runSuggest(
  need: string,
  detected: DetectedTool[],
  tools: ToolSummary[],
  limit = 3,
  style: UserStyle = "balanced"
): RankResult[] {
  // Build a stack string from detected tool categories for context.
  const coveredCategories = inferCoveredCategories(detected, tools);
  const stack = [...coveredCategories].join(",");
  return rankTools(tools, stack, need, limit, style);
}
