// ObPay (https://obpay.online/docs) and the payment bookkeeping shared by the
// obpay-* functions. Runs on Supabase Edge Functions (Deno).
//
// Secrets (set with `node scripts/set-payment-secrets.mjs`):
//   OBPAY_SECRET_KEY      live API key (sk_live_…), Dashboard → API Keys
//   OBPAY_WEBHOOK_SECRET  webhook signing secret (whsec_…), same page
//   SITE_URL              where card payers come back to, e.g. https://aveprayers.com
//
// Uganda pays by mobile money (MTN or Airtel PIN prompt) in UGX; elsewhere by
// card in USD on ObPay's hosted checkout (ObPay has no UGX card payments).
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const BASE = "https://obpay.online/api/public/v1";

// Prices are decided here, never by the app. ObPay takes whole UGX amounts.
export const PRICES = {
  UGX: { monthly: 7000, yearly: 70000 },
  USD: { monthly: 3.99, yearly: 29.99 },
} as const;
export type Currency = keyof typeof PRICES;
export type Plan = keyof (typeof PRICES)["UGX"];

export { adminClient, corsHeaders, env, json, requestUser } from "./common.ts";
import { adminClient, env } from "./common.ts";

// The address ObPay posts payment results to (supabase/functions/obpay-webhook)
export const webhookUrl = () => `${env("SUPABASE_URL")}/functions/v1/obpay-webhook`;

export class ObPayError extends Error {
  constructor(message: string, readonly status: number, readonly body: any) {
    super(message);
  }
}

// ObPay answers { success, data } or { success: false, error }. Always check
// success, not only the HTTP status.
export async function obpay(path: string, init: { method?: string; body?: unknown } = {}) {
  const response = await fetch(BASE + path, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${env("OBPAY_SECRET_KEY")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.success !== true) {
    throw new ObPayError(`ObPay ${path}: ${response.status} ${body?.error ?? ""}`, response.status, body);
  }
  return body.data;
}

// Our order reference: short, unique, and safe in a URL (ObPay allows 40 characters)
export const newReference = () => `AVE-${crypto.randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase()}`;

// "0772 123 456", "+256772123456", "772123456" → "256772123456"; null if it
// isn't a Ugandan mobile number
export function ugandaPhone(input: unknown): string | null {
  const digits = String(input ?? "").replace(/\D/g, "");
  const local = digits.startsWith("256") ? digits.slice(3) : digits.startsWith("0") ? digits.slice(1) : digits;
  return /^7\d{8}$/.test(local) ? `256${local}` : null;
}

// Checks the true state of a payment with ObPay, records it, and extends the
// subscription when it's paid in full. Safe to call any number of times, and
// the only place a payment is ever marked completed.
export async function syncPayment(admin: SupabaseClient, reference: string) {
  const { data: payment } = await admin.from("payments").select("*").eq("merchant_reference", reference).maybeSingle();
  if (!payment) return null;
  if (payment.status !== "pending") return payment;

  let result: any;
  try {
    result = await obpay(`/transactions/${encodeURIComponent(reference)}`);
  } catch (error) {
    // Not found yet (e.g. the request is still being created): stays pending
    if (error instanceof ObPayError && error.status === 404) {
      await admin.from("payments").update({ updated_at: new Date().toISOString() }).eq("id", payment.id);
      return payment;
    }
    throw error;
  }

  let status = result.status === "success" ? "completed" : result.status === "failed" ? "failed" : "pending";
  // Only count it if ObPay received the amount and currency we asked for
  const paidInFull =
    result.type === "collection" &&
    String(result.currency).toUpperCase() === payment.currency &&
    Number(result.amount) >= Number(payment.amount);
  if (status === "completed" && !paidInFull) status = "invalid";

  await admin
    .from("payments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", payment.id);

  if (status === "completed") {
    const { error } = await admin.rpc("apply_payment", { p_reference: reference });
    if (error) throw error;
  }
  return { ...payment, status };
}

// The webhook signature: HMAC-SHA256 (hex) of the raw body with the signing secret
export async function validSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env("OBPAY_WEBHOOK_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
  const expected = [...mac].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  // Constant-time comparison
  const received = signature.trim().toLowerCase();
  if (received.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  return diff === 0;
}

