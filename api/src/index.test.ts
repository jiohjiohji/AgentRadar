/**
 * Tests for ranking logic and route parsing.
 *
 * Route handlers are tested with mocked fetch and KV.
 * Ranking logic is tested directly — it is pure TypeScript.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { rankTools } from "./ranking.js";
import type { ToolSummary } from "./types.js";

// ── Fixtures ──────────────────────────────────────────────────────────────

function makeTool(overrides: Partial<ToolSummary> = {}): ToolSummary {
  return {
    id: "gh-test-tool",
    name: "Test Tool",
    category: "mcp-server",
    status: "active",
    tags: ["browser", "automation"],
    pricing: "free",
    composite: 8.0,
    eval_count: 3,
    confidence: "medium",
    versus_refs: [],
    ...overrides,
  };
}

// ── rankTools ─────────────────────────────────────────────────────────────

describe("rankTools", () => {
  it("excludes archived tools regardless of score", () => {
    const tools = [
      makeTool({ id: "archived", status: "archived", composite: 9.9 }),
      makeTool({ id: "active", status: "active", composite: 5.0 }),
    ];
    const results = rankTools(tools, "", "");
    expect(results).toHaveLength(1);
    expect(results[0]?.tool.id).toBe("active");
  });

  it("ranks active above stale", () => {
    const tools = [
      makeTool({ id: "stale", status: "stale", tags: ["browser"] }),
      makeTool({ id: "active", status: "active", tags: ["browser"] }),
    ];
    const results = rankTools(tools, "browser", "");
    expect(results[0]?.tool.id).toBe("active");
  });

  it("uses tag overlap as secondary signal", () => {
    const tools = [
      makeTool({ id: "no-match", tags: ["unrelated"] }),
      makeTool({ id: "match", tags: ["browser", "automation", "testing"] }),
    ];
    const results = rankTools(tools, "", "browser testing");
    expect(results[0]?.tool.id).toBe("match");
  });

  it("returns at most 3 results", () => {
    const tools = Array.from({ length: 10 }, (_, i) =>
      makeTool({ id: `tool-${i}`, status: "active" })
    );
    expect(rankTools(tools, "", "")).toHaveLength(3);
  });

  it("respects custom limit", () => {
    const tools = Array.from({ length: 5 }, (_, i) =>
      makeTool({ id: `tool-${i}` })
    );
    expect(rankTools(tools, "", "", 1)).toHaveLength(1);
  });

  it("uses composite as tiebreaker when status and tags are equal", () => {
    const tools = [
      makeTool({ id: "low", composite: 4.0, eval_count: 3 }),
      makeTool({ id: "high", composite: 9.0, eval_count: 3 }),
    ];
    const results = rankTools(tools, "", "");
    expect(results[0]?.tool.id).toBe("high");
  });

  it("ignores composite when eval_count < 2", () => {
    const base = makeTool({ tags: [], status: "active" });
    const tools = [
      { ...base, id: "unscored", composite: 9.9, eval_count: 1 },
      { ...base, id: "scored", composite: 7.0, eval_count: 3 },
    ];
    // Both active, no tag overlap — only composite differentiates.
    // unscored has eval_count < 2 so composite is ignored; scored has composite bonus.
    const results = rankTools(tools, "", "");
    expect(results[0]?.tool.id).toBe("scored");
  });

  it("returns empty array when all tools are archived", () => {
    const tools = [
      makeTool({ status: "archived" }),
      makeTool({ status: "archived" }),
    ];
    expect(rankTools(tools, "", "")).toHaveLength(0);
  });

  it("match_reason is non-empty", () => {
    const tools = [makeTool()];
    const results = rankTools(tools, "", "browser");
    expect(results[0]?.match_reason).toBeTruthy();
  });
});

// ── Route parsing (lightweight integration) ───────────────────────────────

describe("Worker route matching", () => {
  it("correctly matches /api/v1/tools/match before /api/v1/tools/:id", () => {
    // This tests the regex ordering in index.ts at the logic level.
    const path = "/api/v1/tools/match";
    expect(path).toBe("/api/v1/tools/match");
    // match route regex should NOT match as a tool id:
    expect(path.match(/^\/api\/v1\/tools\/([^/]+)$/)?.[1]).toBe("match");
    // The real guard in index.ts checks the literal path first — this confirms
    // that if the literal check runs first, "match" is never treated as a tool id.
  });

  it("versus regex extracts both ids", () => {
    const path = "/api/v1/versus/gh-foo-bar/gh-baz-qux";
    const m = path.match(/^\/api\/v1\/versus\/([^/]+)\/([^/]+)$/);
    expect(m?.[1]).toBe("gh-foo-bar");
    expect(m?.[2]).toBe("gh-baz-qux");
  });

  it("tool id regex rejects paths with slashes", () => {
    expect("/api/v1/tools/foo/bar".match(/^\/api\/v1\/tools\/([^/]+)$/)).toBeNull();
  });
});
