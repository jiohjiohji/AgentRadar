/**
 * ranking.ts — Stack-aware tool ranking.
 *
 * Mirrors the logic in claude-plugin/commands/radar.md.
 * Status signal > tag overlap > composite score.
 * Archived tools are never returned.
 */

import type { RankResult, ToolSummary, UserStyle } from "./types.js";

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
 * Compute a style-adaptive bonus based on f (setup friction) and x (composability).
 */
function computeFitBonus(tool: ToolSummary, style: UserStyle): number {
  if (tool.eval_count < 2) return 0;

  const f = tool.f_score ?? 0;
  const x = tool.x_score ?? 0;

  switch (style) {
    case "vibe":
      return f * 0.5;
    case "agent":
      return x * 0.5;
    case "balanced":
      return (f + x) * 0.25;
  }
}

/**
 * Rank tools for a given stack and/or need query.
 * Returns up to `limit` results, excluding archived tools.
 *
 * @param tools     Full tool list from tools-index.json
 * @param stack     Comma-separated categories/tags already present in the project
 * @param need      Natural language query (e.g. "browser testing")
 * @param limit     Max results (default 3)
 * @param style     User style: vibe (low friction), agent (composability), balanced
 */
export function rankTools(
  tools: ToolSummary[],
  stack: string,
  need: string,
  limit = 3,
  style: UserStyle = "balanced"
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
    const fitBonus = computeFitBonus(tool, style);

    const score =
      statusScore + tagOverlap + categoryMatch + nameMatch + fitBonus;

    const reasons: string[] = [];
    if (statusScore === 10) reasons.push("actively maintained");
    if (tagOverlap > 0) reasons.push(`${tagOverlap / 2} matching tag(s)`);
    if (fitBonus > 0 && tool.composite !== null)
      reasons.push(`score ${tool.composite.toFixed(1)} (${tool.confidence})`);
    if (style === "vibe" && tool.f_score !== null && tool.f_score >= 8)
      reasons.push("low setup friction");
    if (style === "agent" && tool.x_score !== null && tool.x_score >= 8)
      reasons.push("high composability");

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
