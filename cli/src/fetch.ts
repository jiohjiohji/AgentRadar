/**
 * fetch.ts — Load the AgentRadar tools index.
 *
 * Priority:
 *   1. AGENTRADAR_API env var (Worker URL) if set
 *   2. GitHub raw content CDN (always available once the repo is public)
 *
 * This fallback ensures the CLI works before the Worker is deployed.
 */

import axios from "axios";
import type { ToolsIndex } from "./types.js";

const GITHUB_RAW_INDEX =
  "https://raw.githubusercontent.com/jiohjiohji/AgentRadar/main/data/tools-index.json";

export async function fetchIndex(): Promise<ToolsIndex> {
  const workerBase = process.env["AGENTRADAR_API"];
  const url = workerBase
    ? `${workerBase.replace(/\/$/, "")}/api/v1/tools`
    : GITHUB_RAW_INDEX;

  const res = await axios.get<ToolsIndex>(url, { timeout: 10_000 });
  // Worker returns { tools: [...] }; GitHub raw returns the full index object.
  // Both shapes satisfy ToolsIndex.
  return res.data;
}
