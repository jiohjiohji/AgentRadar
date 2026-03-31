export interface ToolSummary {
  id: string;
  name: string;
  category: string;
  status: "active" | "stale" | "archived";
  tags: string[];
  pricing: string;
  composite: number | null;
  eval_count: number;
  confidence: "low" | "medium" | "high" | null;
  versus_refs: string[];
}

export interface ToolsIndex {
  schema_version: string;
  generated: string;
  count: number;
  base_url: string;
  tools: ToolSummary[];
}

export interface DetectedTool {
  name: string;       // raw name as found (e.g. "playwright-mcp", "@anthropic-ai/sdk")
  source: "package.json" | "requirements.txt" | "mcp-config" | "claude-commands";
}

export interface CheckResult {
  detected: DetectedTool;
  matched: ToolSummary | null;
  status: "healthy" | "archived" | "stale" | "upgrade" | "unmatched";
  message: string;
  alternative: ToolSummary | null;
}

export interface RankResult {
  tool: ToolSummary;
  score: number;
  match_reason: string;
}

export interface ScanReport {
  project: string;
  scanned_at: string;
  covered_categories: string[];
  gap_categories: string[];
  recommendations: RankResult[];
}

export interface CheckReport {
  project: string;
  checked_at: string;
  results: CheckResult[];
  exit_code: 0 | 1;
}
