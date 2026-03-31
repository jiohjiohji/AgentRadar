/**
 * AgentRadar Cloudflare Worker — Git-backed JSON API
 *
 * Routes:
 *   GET /api/v1/tools                          — all tools (from tools-index.json)
 *   GET /api/v1/tools/match?stack=X&need=Y     — ranked matches (1–3)
 *   GET /api/v1/tools/:id                      — single tool profile (from YAML)
 *   GET /api/v1/versus/:id1/:id2               — versus page (frontmatter + markdown)
 *
 * Rate limiting: 100K req/day per IP via KV.
 * Data source: GitHub raw content CDN (no database).
 */

import jsYaml from "js-yaml";
import { rankTools } from "./ranking.js";
import { handleCheckout, handleStripeWebhook, handleWatch, handleWatchlist } from "./pro.js";
import type { Env, ToolsIndex, VersusFrontmatter, VersusResponse } from "./types.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function notFound(message: string): Response {
  return json({ error: message }, 404);
}

function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

// ── Rate limiting ──────────────────────────────────────────────────────────

async function checkRateLimit(
  kv: KVNamespace,
  ip: string,
  limitPerDay: number
): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `rate:${ip}:${today}`;
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  if (count >= limitPerDay) return false;
  // Fire-and-forget increment; TTL slightly over 24h so keys clean themselves up.
  await kv.put(key, String(count + 1), { expirationTtl: 86400 + 3600 });
  return true;
}

// ── GitHub raw content fetchers ────────────────────────────────────────────

async function fetchIndex(base: string): Promise<ToolsIndex> {
  const res = await fetch(`${base}/data/tools-index.json`);
  if (!res.ok) throw new Error(`Index fetch failed: ${res.status}`);
  return res.json<ToolsIndex>();
}

async function fetchToolYaml(base: string, id: string): Promise<unknown> {
  const res = await fetch(`${base}/data/tools/${id}.yaml`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Tool fetch failed: ${res.status}`);
  return jsYaml.load(await res.text());
}

async function fetchVersus(
  base: string,
  id1: string,
  id2: string
): Promise<VersusResponse | null> {
  // Try both orderings.
  for (const [a, b] of [
    [id1, id2],
    [id2, id1],
  ]) {
    const res = await fetch(`${base}/data/versus/${a}-vs-${b}.md`);
    if (res.status === 404) continue;
    if (!res.ok) throw new Error(`Versus fetch failed: ${res.status}`);
    const text = await res.text();
    const meta = parseFrontmatter(text);
    if (!meta) continue;
    const content = text.replace(/^---[\s\S]*?---\n/, "").trim();
    return { meta, content };
  }
  return null;
}

/** Parse YAML frontmatter delimited by --- blocks. */
function parseFrontmatter(text: string): VersusFrontmatter | null {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match || !match[1]) return null;
  try {
    return jsYaml.load(match[1]) as VersusFrontmatter;
  } catch {
    return null;
  }
}

// ── Route handlers ─────────────────────────────────────────────────────────

async function handleToolsList(base: string): Promise<Response> {
  const index = await fetchIndex(base);
  return json(index);
}

async function handleToolMatch(
  base: string,
  url: URL
): Promise<Response> {
  const stack = url.searchParams.get("stack") ?? "";
  const need = url.searchParams.get("need") ?? "";
  if (!stack && !need) {
    return badRequest("Provide at least one of: stack, need");
  }
  const index = await fetchIndex(base);
  const results = rankTools(index.tools, stack, need);
  return json({ results, count: results.length });
}

async function handleToolById(base: string, id: string): Promise<Response> {
  if (!/^[a-z0-9-]+$/.test(id)) {
    return badRequest("Invalid tool id format");
  }
  const profile = await fetchToolYaml(base, id);
  if (profile === null) return notFound(`Tool not found: ${id}`);
  return json(profile);
}

async function handleVersus(
  base: string,
  id1: string,
  id2: string
): Promise<Response> {
  if (!/^[a-z0-9-]+$/.test(id1) || !/^[a-z0-9-]+$/.test(id2)) {
    return badRequest("Invalid id format");
  }
  const versus = await fetchVersus(base, id1, id2);
  if (!versus) return notFound(`No versus page for ${id1} vs ${id2}`);
  return json(versus);
}

// ── Main Worker ────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    const ip =
      request.headers.get("CF-Connecting-IP") ??
      request.headers.get("X-Forwarded-For") ??
      "unknown";
    const limitPerDay = parseInt(env.RATE_LIMIT_PER_DAY, 10);
    const allowed = await checkRateLimit(env.RATE_LIMIT, ip, limitPerDay);
    if (!allowed) {
      return json({ error: "Rate limit exceeded. Try again tomorrow." }, 429);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const base = env.GITHUB_RAW_BASE;

    try {
      // GET /api/v1/tools/match — must be tested before /tools/:id
      if (path === "/api/v1/tools/match") {
        return await handleToolMatch(base, url);
      }

      // GET /api/v1/tools
      if (path === "/api/v1/tools") {
        return await handleToolsList(base);
      }

      // GET /api/v1/tools/:id
      const toolMatch = path.match(/^\/api\/v1\/tools\/([^/]+)$/);
      if (toolMatch?.[1]) {
        return await handleToolById(base, toolMatch[1]);
      }

      // GET /api/v1/versus/:id1/:id2
      const versusMatch = path.match(/^\/api\/v1\/versus\/([^/]+)\/([^/]+)$/);
      if (versusMatch?.[1] && versusMatch?.[2]) {
        return await handleVersus(base, versusMatch[1], versusMatch[2]);
      }

      // Pro routes (no rate limiting — they have their own auth)
      if (path === "/api/v1/pro/checkout" && request.method === "POST") {
        return await handleCheckout(request, env);
      }
      if (path === "/api/v1/webhooks/stripe" && request.method === "POST") {
        return await handleStripeWebhook(request, env);
      }
      if (path === "/api/v1/pro/watch" && request.method === "POST") {
        return await handleWatch(request, env);
      }
      if (path === "/api/v1/pro/watchlist" && request.method === "GET") {
        return await handleWatchlist(request, env);
      }

      return notFound("Unknown route");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal error";
      return json({ error: message }, 502);
    }
  },
};
