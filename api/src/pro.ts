/**
 * pro.ts — Pro tier: Stripe checkout, webhook, watchlist.
 *
 * KV schema (PRO_KEYS namespace):
 *   Key:   pro:{api_key}
 *   Value: ProRecord JSON
 *
 * Stripe flow:
 *   1. POST /api/v1/pro/checkout → create Stripe Checkout Session → return session URL
 *   2. Stripe redirects to success_url with api_key in query param
 *   3. Stripe sends checkout.session.completed webhook → Worker writes KV record
 *   4. customer.subscription.deleted → Worker marks status: cancelled
 */

import type { Env } from "./types.js";

export interface ProRecord {
  email: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: "pro";
  status: "active" | "cancelled";
  subscribed_at: string;
  watchlist: string[];  // tool IDs
}

const PRO_MONTHLY_PRICE_CENTS = 900; // $9.00 USD
const API_KEY_HEADER = "X-AgentRadar-Key";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return "ar_pro_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Stripe uses HMAC-SHA256 with timestamp prefix: t=...,v1=...
  const parts = Object.fromEntries(
    signature.split(",").map((p) => p.split("=") as [string, string])
  );
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) return false;

  const payload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare
  if (computed.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return diff === 0;
}

async function requireProKey(
  request: Request,
  kv: KVNamespace
): Promise<{ record: ProRecord; apiKey: string } | Response> {
  const apiKey = request.headers.get(API_KEY_HEADER);
  if (!apiKey) {
    return jsonError("Missing " + API_KEY_HEADER + " header", 401);
  }
  const raw = await kv.get(`pro:${apiKey}`);
  if (!raw) return jsonError("Invalid API key", 401);
  const record = JSON.parse(raw) as ProRecord;
  if (record.status !== "active") return jsonError("Subscription inactive", 403);
  return { record, apiKey };
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Route handlers ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/pro/checkout
 * Body: { email: string }
 * Returns: { checkout_url: string }
 *
 * Creates a Stripe Checkout Session. On success, Stripe redirects to
 * /pro/success?api_key={api_key} (the api_key is set via metadata).
 */
export async function handleCheckout(request: Request, env: Env): Promise<Response> {
  let body: { email?: string };
  try {
    body = await request.json() as { email?: string };
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const email = body.email?.trim();
  if (!email || !email.includes("@")) {
    return jsonError("Valid email required", 400);
  }

  const apiKey = generateApiKey();
  const stripeKey = (env as unknown as Record<string, string>)["STRIPE_SECRET_KEY"];
  if (!stripeKey) return jsonError("Stripe not configured", 503);

  // Pre-create KV record (status: pending) so the success redirect works
  // even before the webhook fires.
  const pending: Partial<ProRecord> = {
    email,
    plan: "pro",
    status: "cancelled", // upgraded to active on webhook
    subscribed_at: new Date().toISOString(),
    watchlist: [],
  };
  await (env as unknown as Record<string, KVNamespace>)["PRO_KEYS"].put(
    `pro:${apiKey}`,
    JSON.stringify(pending),
    { expirationTtl: 86400 } // 24h TTL for pending — webhook removes it on success
  );

  // Create Stripe Checkout Session
  const params = new URLSearchParams({
    "payment_method_types[]": "card",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "AgentRadar Pro",
    "line_items[0][price_data][recurring][interval]": "month",
    "line_items[0][price_data][unit_amount]": String(PRO_MONTHLY_PRICE_CENTS),
    "line_items[0][quantity]": "1",
    mode: "subscription",
    customer_email: email,
    "metadata[api_key]": apiKey,
    success_url: `https://agentRadar.dev/pro/success?api_key=${apiKey}`,
    cancel_url: "https://agentRadar.dev/pro",
  });

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!stripeRes.ok) {
    const err = await stripeRes.text();
    console.error("Stripe error:", err);
    return jsonError("Failed to create checkout session", 502);
  }

  const session = await stripeRes.json<{ url: string }>();
  return jsonOk({ checkout_url: session.url, api_key: apiKey });
}

/**
 * POST /api/v1/webhooks/stripe
 * Handles: checkout.session.completed, customer.subscription.deleted
 */
export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  const signature = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = (env as unknown as Record<string, string>)["STRIPE_WEBHOOK_SECRET"];
  if (!webhookSecret) return jsonError("Webhook secret not configured", 503);

  const body = await request.text();
  const valid = await verifyStripeSignature(body, signature, webhookSecret);
  if (!valid) return jsonError("Invalid signature", 401);

  const event = JSON.parse(body) as { type: string; data: { object: Record<string, unknown> } };
  const kv = (env as unknown as Record<string, KVNamespace>)["PRO_KEYS"];

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const apiKey = (session["metadata"] as Record<string, string>)?.["api_key"];
    if (!apiKey) return jsonOk({ received: true });

    const raw = await kv.get(`pro:${apiKey}`);
    const record = raw ? (JSON.parse(raw) as ProRecord) : null;
    if (!record) return jsonOk({ received: true });

    const updated: ProRecord = {
      ...record,
      stripe_customer_id: String(session["customer"] ?? ""),
      stripe_subscription_id: String(session["subscription"] ?? ""),
      status: "active",
    };
    // Persistent record — no TTL
    await kv.put(`pro:${apiKey}`, JSON.stringify(updated));
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const customerId = String(sub["customer"] ?? "");

    // Find the api_key for this customer by listing (up to 1000 KV keys)
    const list = await kv.list({ prefix: "pro:" });
    for (const key of list.keys) {
      const raw = await kv.get(key.name);
      if (!raw) continue;
      const record = JSON.parse(raw) as ProRecord;
      if (record.stripe_customer_id === customerId) {
        await kv.put(key.name, JSON.stringify({ ...record, status: "cancelled" }));
        break;
      }
    }
  }

  return jsonOk({ received: true });
}

/**
 * POST /api/v1/pro/watch
 * Headers: X-AgentRadar-Key: <api_key>
 * Body: { tool_id: string }
 * Adds tool_id to the watchlist for the Pro subscriber.
 */
export async function handleWatch(request: Request, env: Env): Promise<Response> {
  const kv = (env as unknown as Record<string, KVNamespace>)["PRO_KEYS"];
  const auth = await requireProKey(request, kv);
  if (auth instanceof Response) return auth;

  let body: { tool_id?: string };
  try {
    body = await request.json() as { tool_id?: string };
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const toolId = body.tool_id?.trim();
  if (!toolId || !/^[a-z0-9-]+$/.test(toolId)) {
    return jsonError("Valid tool_id required", 400);
  }

  const { record, apiKey } = auth;
  if (record.watchlist.includes(toolId)) {
    return jsonOk({ watchlist: record.watchlist, message: "Already watching" });
  }

  const updated = { ...record, watchlist: [...record.watchlist, toolId] };
  await kv.put(`pro:${apiKey}`, JSON.stringify(updated));
  return jsonOk({ watchlist: updated.watchlist });
}

/**
 * GET /api/v1/pro/watchlist
 * Headers: X-AgentRadar-Key: <api_key>
 * Returns the subscriber's watchlist.
 */
export async function handleWatchlist(request: Request, env: Env): Promise<Response> {
  const kv = (env as unknown as Record<string, KVNamespace>)["PRO_KEYS"];
  const auth = await requireProKey(request, kv);
  if (auth instanceof Response) return auth;
  return jsonOk({ watchlist: auth.record.watchlist });
}
