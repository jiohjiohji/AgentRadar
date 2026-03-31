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

export interface RankResult {
  tool: ToolSummary;
  score: number;
  match_reason: string;
}

export interface VersusFrontmatter {
  id: string;
  tool_a: string;
  tool_b: string;
  category: string;
  valid_until: string;
  created: string;
}

export interface VersusResponse {
  meta: VersusFrontmatter;
  content: string;
}

export type Env = {
  RATE_LIMIT: KVNamespace;
  PRO_KEYS: KVNamespace;
  GITHUB_RAW_BASE: string;
  RATE_LIMIT_PER_DAY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
};
