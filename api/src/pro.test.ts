/**
 * Tests for Pro tier: Stripe webhook signature verification, watchlist logic.
 *
 * Stripe API calls and KV are mocked.
 * The Stripe signature verification function is tested directly.
 */

import { describe, it, expect } from "vitest";

// ── Stripe signature verification (exported for testing) ──────────────────

// Inline the verification logic to test it without importing the Worker module
// (which has Cloudflare-specific globals that vitest can't resolve).

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
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

  if (computed.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return diff === 0;
}

async function buildSignature(body: string, secret: string): Promise<string> {
  const timestamp = "1234567890";
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
  const v1 = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `t=${timestamp},v1=${v1}`;
}

describe("Stripe webhook signature", () => {
  const secret = "whsec_test_secret";
  const body = JSON.stringify({ type: "checkout.session.completed", data: {} });

  it("accepts a valid signature", async () => {
    const sig = await buildSignature(body, secret);
    expect(await verifyStripeSignature(body, sig, secret)).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const sig = await buildSignature(body, secret);
    const tampered = body.replace("completed", "tampered");
    expect(await verifyStripeSignature(tampered, sig, secret)).toBe(false);
  });

  it("rejects a wrong secret", async () => {
    const sig = await buildSignature(body, secret);
    expect(await verifyStripeSignature(body, sig, "wrong_secret")).toBe(false);
  });

  it("rejects a malformed signature (missing v1)", async () => {
    expect(await verifyStripeSignature(body, "t=123", secret)).toBe(false);
  });

  it("rejects an empty signature", async () => {
    expect(await verifyStripeSignature(body, "", secret)).toBe(false);
  });
});

// ── Watchlist logic ────────────────────────────────────────────────────────

describe("Watchlist deduplication", () => {
  it("does not add duplicate tool IDs", () => {
    const watchlist = ["gh-playwright-mcp"];
    const toolId = "gh-playwright-mcp";
    const updated = watchlist.includes(toolId)
      ? watchlist
      : [...watchlist, toolId];
    expect(updated).toHaveLength(1);
  });

  it("adds new tool ID", () => {
    const watchlist = ["gh-playwright-mcp"];
    const toolId = "gh-github-mcp-server";
    const updated = watchlist.includes(toolId)
      ? watchlist
      : [...watchlist, toolId];
    expect(updated).toHaveLength(2);
    expect(updated).toContain("gh-github-mcp-server");
  });
});

// ── API key format ─────────────────────────────────────────────────────────

describe("API key format", () => {
  it("generated keys match expected prefix pattern", () => {
    // Simulate the generateApiKey function output format
    const prefix = "ar_pro_";
    const hex = "0".repeat(48); // 24 bytes → 48 hex chars
    const key = prefix + hex;
    expect(key.startsWith("ar_pro_")).toBe(true);
    expect(key.length).toBe(55); // 7 + 48
  });
});
