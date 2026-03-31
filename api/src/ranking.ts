/**
 * ranking.ts — Stack-aware tool ranking.
 *
 * Mirrors the logic in claude-plugin/commands/radar.md.
 * Status signal > tag overlap > composite score.
 * Archived tools are never returned.
 */

import type { RankResult, ToolSummary } from "./types.js";

const STATUS_SCORE: Record<string, number> = {
  active: 10,
  stale: 5,
  archived: -Infinity,
};

/**
 * Tokenize a query or stack string into lowercase words.
 * Splits on whitespace, commas, hyphens, underscores.
 */
function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[\s,\-_]+/)
    .filter((t) => t.length > 1);
}

/**
 * Count how many tokens from `query` appear in `targets`.
 */
function overlapCount(query: string[], targets: string[]): number {
  const targetSet = new Set(targets.map((t) => t.toLowerCase()));
  return query.filter((q) => targetSet.has(q)).length;
}

/**
 * Rank tools for a given stack and/or need query.
 * Returns up to `limit` results, excluding archived tools.
 *
 * @param tools     Full tool list from tools-index.json
 * @param stack     Comma-separated categories/tags already present in the project
 * @param need      Natural language query (e.g. "browser testing")
 * @param limit     Max results (default 3)
 */
export function rankTools(
  tools: ToolSummary[],
  stack: string,
  need: string,
  limit = 3
): RankResult[] {
  const stackTokens = tokenize(stack);
  const needTokens = tokenize(need);
  const queryTokens = [...stackTokens, ...needTokens];

  const results: RankResult[] = [];

  for (const tool of tools) {
    const statusScore = STATUS_SCORE[tool.status] ?? 0;
    if (!isFinite(statusScore)) continue; // archived — skip

    const tagOverlap = overlapCount(queryTokens, tool.tags) * 2;
    const categoryMatch =
      overlapCount(needTokens, tokenize(tool.category)) * 3;
    const nameMatch = overlapCount(needTokens, tokenize(tool.name)) * 1;
    const compositeBonus =
      tool.composite !== null && tool.eval_count >= 2 ? tool.composite * 0.3 : 0;

    const score =
      statusScore + tagOverlap + categoryMatch + nameMatch + compositeBonus;

    const reasons: string[] = [];
    if (statusScore === 10) reasons.push("actively maintained");
    if (tagOverlap > 0) reasons.push(`${tagOverlap / 2} matching tag(s)`);
    if (compositeBonus > 0)
      reasons.push(`score ${tool.composite?.toFixed(1)} (${tool.confidence})`);

    results.push({
      tool,
      score,
      match_reason: reasons.join(", ") || tool.category,
    });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
