/**
 * watch.ts — Subscribe to tool status change notifications.
 *
 * Stores the Pro API key in ~/.agentRadar/config.json.
 * Calls POST /api/v1/pro/watch with the stored key.
 */

import axios from "axios";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const CONFIG_DIR = path.join(os.homedir(), ".agentRadar");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const DEFAULT_API_BASE = "https://api.agentRadar.dev";

interface Config {
  api_key?: string;
  api_base?: string;
}

function readConfig(): Config {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")) as Config;
  } catch {
    return {};
  }
}

function writeConfig(config: Config): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

export async function runWatch(toolId: string): Promise<void> {
  const config = readConfig();
  let apiKey = config.api_key;

  if (!apiKey) {
    // Prompt user to set their API key
    console.error(
      `No Pro API key configured. Set it first:\n` +
      `  agentRadar config set api_key <your-key>\n\n` +
      `Get a key at: https://agentRadar.dev/pro`
    );
    process.exit(1);
  }

  const base = config.api_base ?? DEFAULT_API_BASE;

  try {
    const res = await axios.post(
      `${base}/api/v1/pro/watch`,
      { tool_id: toolId },
      {
        headers: { "X-AgentRadar-Key": apiKey },
        timeout: 10_000,
      }
    );

    const { watchlist, message } = res.data as { watchlist: string[]; message?: string };
    const note = message ? ` (${message})` : "";
    console.log(`Watching ${toolId}${note}. Watchlist: ${watchlist.join(", ")}`);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const msg = (err.response.data as { error?: string }).error ?? "Unknown error";
      console.error(`Error: ${msg}`);
      process.exit(1);
    }
    throw err;
  }
}

export function runConfigSet(key: string, value: string): void {
  const config = readConfig();
  (config as Record<string, string>)[key] = value;
  writeConfig(config);
  console.log(`Config updated: ${key} = ${value}`);
}
