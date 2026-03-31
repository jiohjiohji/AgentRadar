import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { extractIntentSignals, inferStyle } from "./intent.js";
import type { DetectedTool } from "./types.js";

/** A representative subset of the real tag vocabulary. */
const TAGS = [
  "react",
  "nextjs",
  "typescript",
  "python",
  "frontend",
  "backend",
  "browser-automation",
  "playwright",
  "testing",
  "web-scraping",
  "crawling",
  "web-interaction",
  "slack",
  "team-communication",
  "notifications",
  "jira",
  "issue-tracking",
  "api-client",
  "sdk",
  "multi-agent",
  "orchestration",
  "autonomous-workflow",
  "llm-apps",
  "conversational-agents",
  "monitoring",
  "observability",
  "github",
  "code-management",
  "notion",
  "knowledge-management",
  "guide",
  "resources",
  "quality",
  "curated",
  "educational",
  "lightweight",
];

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "intent-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeMd(name: string, content: string): void {
  fs.writeFileSync(path.join(tmpDir, name), content);
}

function det(name: string, source: DetectedTool["source"] = "package.json"): DetectedTool {
  return { name, source };
}

// ── extractIntentSignals ──────────────────────────────────────────────────

describe("extractIntentSignals", () => {
  it("returns empty array for empty directory", () => {
    expect(extractIntentSignals(tmpDir, TAGS)).toEqual([]);
  });

  it("extracts tech keywords from a PRD", () => {
    writeMd(
      "PRD.md",
      "We are building a React e-commerce app with Playwright browser testing and Slack notifications."
    );
    const signals = extractIntentSignals(tmpDir, TAGS);
    expect(signals).toContain("react");
    expect(signals).toContain("browser-automation");
    expect(signals).toContain("playwright");
    expect(signals).toContain("slack");
    expect(signals).toContain("testing");
  });

  it("matches multi-word tags from space-separated text", () => {
    writeMd("README.md", "This project uses browser automation for testing.");
    const signals = extractIntentSignals(tmpDir, TAGS);
    expect(signals).toContain("browser-automation");
  });

  it("applies synonym expansion", () => {
    writeMd("PRD.md", "Build an e-commerce scraper for product data.");
    const signals = extractIntentSignals(tmpDir, TAGS);
    expect(signals).toContain("frontend");
    expect(signals).toContain("web-interaction");
    expect(signals).toContain("web-scraping");
    expect(signals).toContain("crawling");
  });

  it("is case insensitive", () => {
    writeMd("README.md", "Built with REACT and TypeScript");
    const signals = extractIntentSignals(tmpDir, TAGS);
    expect(signals).toContain("react");
    expect(signals).toContain("typescript");
  });

  it("filters out generic stoplist tags", () => {
    writeMd("README.md", "A quality guide with curated educational resources.");
    const signals = extractIntentSignals(tmpDir, TAGS);
    expect(signals).not.toContain("guide");
    expect(signals).not.toContain("resources");
    expect(signals).not.toContain("quality");
    expect(signals).not.toContain("curated");
    expect(signals).not.toContain("educational");
  });

  it("handles large files without crashing", () => {
    const bigContent = "react ".repeat(20_000); // ~120KB
    writeMd("PRD.md", bigContent);
    const signals = extractIntentSignals(tmpDir, TAGS);
    expect(signals).toContain("react");
  });

  it("reads multiple .md files", () => {
    writeMd("PRD.md", "This project needs browser automation.");
    writeMd("README.md", "Built with TypeScript and monitoring tools.");
    const signals = extractIntentSignals(tmpDir, TAGS);
    expect(signals).toContain("browser-automation");
    expect(signals).toContain("typescript");
    expect(signals).toContain("monitoring");
  });

  it("returns sorted deduplicated results", () => {
    writeMd("README.md", "react react react typescript typescript");
    const signals = extractIntentSignals(tmpDir, TAGS);
    const unique = new Set(signals);
    expect(signals.length).toBe(unique.size);
    expect(signals).toEqual([...signals].sort());
  });
});

// ── inferStyle ────────────────────────────────────────────────────────────

describe("inferStyle", () => {
  it('returns "vibe" when no tools detected', () => {
    expect(inferStyle([], tmpDir)).toBe("vibe");
  });

  it('returns "vibe" with few deps', () => {
    const detected = [det("react"), det("typescript"), det("vite")];
    expect(inferStyle(detected, tmpDir)).toBe("vibe");
  });

  it('returns "agent" with 3+ MCP servers', () => {
    const detected = [
      det("playwright-mcp", "mcp-config"),
      det("github-mcp", "mcp-config"),
      det("slack-mcp", "mcp-config"),
    ];
    expect(inferStyle(detected, tmpDir)).toBe("agent");
  });

  it('returns "agent" with 3+ claude commands', () => {
    const detected = [
      det("radar", "claude-commands"),
      det("deploy", "claude-commands"),
      det("review", "claude-commands"),
    ];
    expect(inferStyle(detected, tmpDir)).toBe("agent");
  });

  it('returns "agent" when CLAUDE.md has agent keywords and is substantial', () => {
    const lines = Array(60).fill("Some configuration line.");
    lines[30] = "Use multi-agent orchestration for complex tasks.";
    writeMd("CLAUDE.md", lines.join("\n"));
    expect(inferStyle([], tmpDir)).toBe("agent");
  });

  it('returns "vibe" when CLAUDE.md is short even with agent keywords', () => {
    writeMd("CLAUDE.md", "Use multi-agent orchestration.\nLine two.\nLine three.");
    expect(inferStyle([], tmpDir)).toBe("vibe");
  });

  it('returns "balanced" with moderate deps', () => {
    const detected = Array.from({ length: 8 }, (_, i) => det(`pkg-${i}`));
    expect(inferStyle(detected, tmpDir)).toBe("balanced");
  });

  it('returns "balanced" with 5+ deps but no agent signals', () => {
    const detected = Array.from({ length: 6 }, (_, i) => det(`dep-${i}`));
    expect(inferStyle(detected, tmpDir)).toBe("balanced");
  });
});
