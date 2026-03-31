import { describe, it, expect } from "vitest";
import { matchTool, findAlternative, classifyTool, runCheck } from "./check.js";
import type { DetectedTool, ToolSummary } from "./types.js";

function tool(overrides: Partial<ToolSummary> & { id: string }): ToolSummary {
  return {
    name: overrides.id,
    category: "mcp-server",
    status: "active",
    tags: [],
    pricing: "free",
    composite: 7.0,
    eval_count: 3,
    confidence: "medium",
    versus_refs: [],
    ...overrides,
  };
}

function detected(name: string, source: DetectedTool["source"] = "package.json"): DetectedTool {
  return { name, source };
}

// ── matchTool ──────────────────────────────────────────────────────────────

describe("matchTool", () => {
  it("matches by shared token in id", () => {
    const tools = [tool({ id: "gh-microsoft-playwright-mcp", name: "Playwright MCP" })];
    const result = matchTool(detected("playwright-mcp"), tools);
    expect(result?.id).toBe("gh-microsoft-playwright-mcp");
  });

  it("matches by shared token in name", () => {
    const tools = [tool({ id: "gh-foo-bar", name: "Playwright MCP" })];
    const result = matchTool(detected("playwright"), tools);
    expect(result?.id).toBe("gh-foo-bar");
  });

  it("returns null when no token overlap (score < 2)", () => {
    const tools = [tool({ id: "gh-totally-unrelated", name: "Unrelated Tool" })];
    const result = matchTool(detected("playwright-mcp"), tools);
    expect(result).toBeNull();
  });

  it("strips npm scope before tokenizing", () => {
    const tools = [tool({ id: "gh-anthropics-sdk-python", name: "Anthropic SDK" })];
    const result = matchTool(detected("@anthropic-ai/sdk"), tools);
    // "anthropic" token overlaps between "@anthropic-ai/sdk" and "anthropics-sdk-python"
    expect(result?.id).toBe("gh-anthropics-sdk-python");
  });

  it("returns best match when multiple tools partially match", () => {
    const tools = [
      tool({ id: "gh-foo-playwright", name: "Foo Playwright" }),
      tool({ id: "gh-microsoft-playwright-mcp", name: "Playwright MCP" }),
    ];
    const result = matchTool(detected("playwright-mcp"), tools);
    // "playwright" + "mcp" = 2 tokens overlap for the second tool
    expect(result?.id).toBe("gh-microsoft-playwright-mcp");
  });
});

// ── findAlternative ────────────────────────────────────────────────────────

describe("findAlternative", () => {
  it("returns null when no better active tool in same category", () => {
    const current = tool({ id: "gh-current", composite: 8.0 });
    const others = [tool({ id: "gh-other", composite: 9.0, category: "different-cat" })];
    expect(findAlternative(current, others)).toBeNull();
  });

  it("returns alternative when active tool in same category scores 1.5+ higher", () => {
    const current = tool({ id: "gh-current", composite: 6.0 });
    const better = tool({ id: "gh-better", composite: 8.0 });
    expect(findAlternative(current, [current, better])?.id).toBe("gh-better");
  });

  it("returns null when alternative is only marginally better", () => {
    const current = tool({ id: "gh-current", composite: 7.0 });
    const marginal = tool({ id: "gh-marginal", composite: 8.0 }); // +1.0 < +1.5 threshold
    expect(findAlternative(current, [current, marginal])).toBeNull();
  });

  it("returns any active alternative for archived tool (no score threshold)", () => {
    const current = tool({ id: "gh-archived", status: "archived", composite: 9.0 });
    const alt = tool({ id: "gh-active", composite: 5.0 });
    expect(findAlternative(current, [current, alt])?.id).toBe("gh-active");
  });

  it("never returns stale or archived as alternative", () => {
    const current = tool({ id: "gh-current", status: "archived", composite: 3.0 });
    const stale = tool({ id: "gh-stale", status: "stale", composite: 9.0 });
    const archived = tool({ id: "gh-arc", status: "archived", composite: 9.0 });
    expect(findAlternative(current, [current, stale, archived])).toBeNull();
  });

  it("does not return the tool itself as its own alternative", () => {
    const current = tool({ id: "gh-self", status: "archived", composite: 3.0 });
    expect(findAlternative(current, [current])).toBeNull();
  });
});

// ── runCheck ──────────────────────────────────────────────────────────────

describe("runCheck", () => {
  it("exit_code is 0 when all matched tools are healthy", () => {
    const tools = [tool({ id: "gh-playwright-mcp", name: "Playwright MCP" })];
    const report = runCheck([detected("playwright-mcp")], tools, "my-project");
    expect(report.exit_code).toBe(0);
  });

  it("exit_code is 1 when any tool is archived", () => {
    const tools = [tool({ id: "gh-archived", name: "Archived Tool", status: "archived" })];
    const report = runCheck([detected("archived-tool")], tools, "my-project");
    // "archived" + "tool" → matches id tokens
    expect(report.exit_code).toBe(1);
  });

  it("exit_code is 1 when any tool is stale", () => {
    const tools = [tool({ id: "gh-stale-tool", name: "Stale Tool", status: "stale" })];
    const report = runCheck([detected("stale-tool")], tools, "my-project");
    expect(report.exit_code).toBe(1);
  });

  it("unmatched tools do not affect exit code", () => {
    const tools = [tool({ id: "gh-totally-unrelated", name: "Unrelated" })];
    const report = runCheck([detected("unknown-dep")], tools, "my-project");
    expect(report.results[0]?.status).toBe("unmatched");
    expect(report.exit_code).toBe(0);
  });

  it("report contains project name and checked_at timestamp", () => {
    const report = runCheck([], [], "test-project");
    expect(report.project).toBe("test-project");
    expect(report.checked_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("deduplication in detect is respected — no double results", () => {
    const tools = [tool({ id: "gh-playwright-mcp", name: "Playwright MCP" })];
    // Same tool detected twice (simulate; detect.ts deduplicates, but check.ts handles it)
    const input = [detected("playwright-mcp"), detected("playwright-mcp")];
    const report = runCheck(input, tools, "proj");
    // Two inputs → two results (dedup is in detect.ts, not check.ts)
    expect(report.results).toHaveLength(2);
  });
});
