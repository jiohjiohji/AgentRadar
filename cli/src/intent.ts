/**
 * intent.ts — Infer project intent and development style.
 *
 * extractIntentSignals: reads root .md files, extracts keywords matching the
 *   dataset's tag vocabulary. Gives scan/suggest domain-aware context even when
 *   no dependency files exist.
 *
 * inferStyle: determines whether the developer is a vibe coder, full-agent
 *   architect, or balanced — based on project structure, not self-identification.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { DetectedTool, UserStyle } from "./types.js";

/** Max bytes of markdown to read (avoids reading generated docs). */
const MAX_BYTES = 50_000;

/** Tags too generic to be useful as intent signals. */
const STOPLIST = new Set([
  "guide",
  "resources",
  "quality",
  "curated",
  "educational",
  "modular",
  "lightweight",
  "incremental",
  "patterns",
  "reference-implementation",
  "open-source",
  "official",
]);

/**
 * Common terms developers use in docs that map to dataset tags.
 * Keys are lowercased terms found in markdown; values are tag matches.
 */
const SYNONYMS: Record<string, string[]> = {
  "e-commerce": ["frontend", "web-interaction"],
  ecommerce: ["frontend", "web-interaction"],
  "ci/cd": ["testing", "automation"],
  graphql: ["api-client"],
  rest: ["api-client"],
  llm: ["llm-apps"],
  chatbot: ["conversational-agents"],
  scraping: ["web-scraping", "crawling"],
  scraper: ["web-scraping", "crawling"],
  notification: ["notifications"],
  notifications: ["notifications"],
  slack: ["slack", "team-communication"],
  jira: ["jira", "issue-tracking"],
  linear: ["linear", "issue-tracking"],
  notion: ["notion", "knowledge-management"],
  github: ["github", "code-management"],
  browser: ["browser-automation"],
  playwright: ["playwright", "browser-automation", "testing"],
  nextjs: ["nextjs", "react", "frontend"],
  "next.js": ["nextjs", "react", "frontend"],
};

/** Keywords that indicate a full-agent development style. */
const AGENT_KEYWORDS = [
  "multi-agent",
  "orchestration",
  "subagent",
  "autonomous",
  "agent",
  "swarm",
  "workflow automation",
  "multi agent",
];

/**
 * Read root .md files and extract tags that match the dataset vocabulary.
 * Returns deduplicated, sorted tag strings.
 */
export function extractIntentSignals(
  cwd: string,
  tagVocabulary: string[]
): string[] {
  const mdFiles = listMdFiles(cwd);
  if (mdFiles.length === 0) return [];

  const content = readMdContent(mdFiles, MAX_BYTES);
  if (content.length === 0) return [];

  const lower = content.toLowerCase();
  const tagSet = new Set(tagVocabulary.map((t) => t.toLowerCase()));
  const matched = new Set<string>();

  // Single-word tag matches via tokenization
  const tokens = lower.split(/[\s,\-_./()[\]{}:;'"!?#*`]+/).filter((t) => t.length > 1);
  const tokenSet = new Set(tokens);
  for (const tag of tagSet) {
    if (!tag.includes("-") && tokenSet.has(tag) && !STOPLIST.has(tag)) {
      matched.add(tag);
    }
  }

  // Multi-word tag matches (hyphenated tags like "browser-automation")
  for (const tag of tagSet) {
    if (tag.includes("-") && !STOPLIST.has(tag)) {
      const spaced = tag.replace(/-/g, " ");
      if (lower.includes(tag) || lower.includes(spaced)) {
        matched.add(tag);
      }
    }
  }

  // Synonym expansion
  for (const [term, expansions] of Object.entries(SYNONYMS)) {
    if (lower.includes(term)) {
      for (const tag of expansions) {
        if (tagSet.has(tag)) matched.add(tag);
      }
    }
  }

  return [...matched].sort();
}

/**
 * Infer the developer's style from project structure.
 *
 * - "agent": heavy Claude Code setup, multiple MCP servers, agent patterns
 * - "vibe": minimal or no config, early-stage project, just docs
 * - "balanced": moderate deps and config
 */
export function inferStyle(detected: DetectedTool[], cwd: string): UserStyle {
  const mcpCount = detected.filter((d) => d.source === "mcp-config").length;
  const commandCount = detected.filter(
    (d) => d.source === "claude-commands"
  ).length;

  // Check for agent keywords in CLAUDE.md
  const claudeMdPath = path.join(cwd, "CLAUDE.md");
  let hasAgentKeywords = false;
  let claudeMdLines = 0;
  try {
    const claudeContent = fs.readFileSync(claudeMdPath, "utf8");
    claudeMdLines = claudeContent.split("\n").length;
    const lowerContent = claudeContent.toLowerCase();
    hasAgentKeywords = AGENT_KEYWORDS.some((kw) => lowerContent.includes(kw));
  } catch {
    // CLAUDE.md doesn't exist — that's fine
  }

  // Agent: heavy Claude Code setup or agent patterns
  if (
    mcpCount >= 3 ||
    commandCount >= 3 ||
    (claudeMdLines > 50 && hasAgentKeywords)
  ) {
    return "agent";
  }

  // Vibe: nothing detected or very few deps
  if (detected.length === 0 || detected.length < 5) {
    return "vibe";
  }

  return "balanced";
}

/** List .md files in the project root, sorted by priority. */
function listMdFiles(cwd: string): string[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(cwd);
  } catch {
    return [];
  }

  const mdFiles = entries
    .filter((f) => f.endsWith(".md") && !f.startsWith("."))
    .map((f) => path.join(cwd, f));

  // Sort by priority: PRD > README > CLAUDE > others
  const priority: Record<string, number> = {
    "prd.md": 0,
    "readme.md": 1,
    "claude.md": 2,
  };

  return mdFiles.sort((a, b) => {
    const aName = path.basename(a).toLowerCase();
    const bName = path.basename(b).toLowerCase();
    const aPri = priority[aName] ?? 10;
    const bPri = priority[bName] ?? 10;
    return aPri - bPri;
  });
}

/** Read markdown files up to a byte cap. */
function readMdContent(filePaths: string[], maxBytes: number): string {
  let total = 0;
  const chunks: string[] = [];

  for (const fp of filePaths) {
    if (total >= maxBytes) break;
    try {
      const content = fs.readFileSync(fp, "utf8");
      const remaining = maxBytes - total;
      chunks.push(content.slice(0, remaining));
      total += content.length;
    } catch {
      // skip unreadable files
    }
  }

  return chunks.join("\n");
}
