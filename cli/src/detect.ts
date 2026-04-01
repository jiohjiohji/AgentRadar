/**
 * detect.ts — Discover tools installed in the current project.
 *
 * Reads: package.json, requirements.txt, .mcp.json, .claude/mcp.json,
 *        .claude/commands/
 *
 * Top-level only for MVP. Does not recurse into workspaces or monorepos.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { DetectedTool } from "./types.js";

function readJsonSafe(filePath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readTextLines(filePath: string): string[] {
  try {
    return fs.readFileSync(filePath, "utf8").split("\n");
  } catch {
    return [];
  }
}

function listDir(dirPath: string): string[] {
  try {
    return fs.readdirSync(dirPath);
  } catch {
    return [];
  }
}

/** Extract dep names from package.json dependencies + devDependencies. */
function detectFromPackageJson(cwd: string): DetectedTool[] {
  const pkg = readJsonSafe(path.join(cwd, "package.json"));
  if (!pkg) return [];

  const deps = {
    ...((pkg["dependencies"] as Record<string, string>) ?? {}),
    ...((pkg["devDependencies"] as Record<string, string>) ?? {}),
  };

  return Object.keys(deps).map((name) => ({ name, source: "package.json" as const }));
}

/** Extract package names from requirements.txt (first token before ==/>=/etc). */
function detectFromRequirements(cwd: string): DetectedTool[] {
  const lines = readTextLines(path.join(cwd, "requirements.txt"));
  return lines
    .map((line) => line.trim().split(/[=><!\[;\s]/)[0]?.trim() ?? "")
    .filter((name) => name.length > 0 && !name.startsWith("#"))
    .map((name) => ({ name, source: "requirements.txt" as const }));
}

/** Extract MCP server names from .mcp.json or .claude/mcp.json. */
function detectFromMcpConfig(cwd: string): DetectedTool[] {
  const candidates = [
    path.join(cwd, ".mcp.json"),
    path.join(cwd, ".claude", "mcp.json"),
  ];

  for (const filePath of candidates) {
    const config = readJsonSafe(filePath);
    if (!config) continue;

    // MCP config format: { "mcpServers": { "server-name": { ... } } }
    const servers = config["mcpServers"] as Record<string, unknown> | undefined;
    if (!servers) continue;

    return Object.keys(servers).map((name) => ({
      name,
      source: "mcp-config" as const,
    }));
  }
  return [];
}

/** List installed Claude Code plugins from .claude/commands/. */
function detectFromClaudeCommands(cwd: string): DetectedTool[] {
  const commandsDir = path.join(cwd, ".claude", "commands");
  return listDir(commandsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      name: f.replace(/\.md$/, ""),
      source: "claude-commands" as const,
    }));
}

/**
 * Detect all tools installed in the project at `cwd`.
 * Returns deduplicated list (same name across sources appears once, first source wins).
 */
export function detectInstalledTools(cwd: string): DetectedTool[] {
  const all = [
    ...detectFromPackageJson(cwd),
    ...detectFromRequirements(cwd),
    ...detectFromMcpConfig(cwd),
    ...detectFromClaudeCommands(cwd),
  ];

  const seen = new Set<string>();
  return all.filter(({ name }) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
