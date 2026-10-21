// PesaPal API 3.0 and the payment bookkeeping shared by the pesapal-*
// functions. Runs on Supabase Edge Functions (Deno).
//
// Secrets (set with `node scripts/set-payment-secrets.mjs`):
//   PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET  from the PesaPal dashboard
//   PESAPAL_ENV        "sandbox" (default) or "live"
//   PESAPAL_IPN_ID     from `node scripts/pesapal-register-ipn.mjs`
//   SITE_URL           where PesaPal sends people back, e.g. https://ave-prayers.vercel.app
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const BASE =
  Deno.env.get("PESAPAL_ENV") === "live" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3";

// Prices are decided here, never by the app
export const PRICES = {
  UGX: { monthly: 7000, yearly: 70000 },
  USD: { monthly: 3.99, yearly: 29.99 },
} as const;
export type Currency = keyof typeof PRICES;
export type Plan = keyof (typeof PRICES)["UGX"];

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

export const env = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing secret ${name}`);
  return value;
};

// Service-role client: bypasses row-level security, server only
export const adminClient = () =>
  createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// The signed-in user making the request, from their access token
export async function requestUser(req: Request) {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await adminClient().auth.getUser(token);
  return data.user ?? null;
}

async function pesapal(path: string, init: RequestInit & { token?: string } = {}) {
  const response = await fetch(BASE + path, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.error) {
    throw new Error(`PesaPal ${path}: ${response.status} ${JSON.stringify(body?.error ?? body)}`);
  }
  return body;
}

export async function pesapalToken(): Promise<string> {
  const body = await pesapal("/api/Auth/RequestToken", {
    method: "POST",
    body: JSON.stringify({
      consumer_key: env("PESAPAL_CONSUMER_KEY"),
      consumer_secret: env("PESAPAL_CONSUMER_SECRET"),
    }),
  });
  return body.token;
}

export async function submitOrder(
  token: string,
  order: { id: string; currency: Currency; amount: number; description: string; email: string; name?: string }
): Promise<{ order_tracking_id: string; redirect_url: string }> {
  const [first, ...rest] = (order.name ?? "").trim().split(/\s+/);
  return pesapal("/api/Transactions/SubmitOrderRequest", {
    method: "POST",
    token,
    body: JSON.stringify({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      description: order.description,
      callback_url: `${env("SITE_URL")}/payment/complete`,
      notification_id: env("PESAPAL_IPN_ID"),
      billing_address: {
        email_address: order.email,
        first_name: first || undefined,
        last_name: rest.join(" ") || undefined,
      },
    }),
  });
}

// PesaPal status_code: 0 invalid, 1 completed, 2 failed, 3 reversed
const STATUS: Record<number, string> = { 0: "invalid", 1: "completed", 2: "failed", 3: "reversed" };

// Asks PesaPal for the true state of an order, records it, and extends the
// subscription when it's paid in full. Safe to call any number of times.
export async function syncPayment(admin: SupabaseClient, orderTrackingId: string) {
  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("order_tracking_id", orderTrackingId)
    .maybeSingle();
  if (!payment) return null;

  const token = await pesapalToken();
  const result = await pesapal(
    `/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    { method: "GET", token }
  );

  let status = STATUS[result.status_code as number] ?? "pending";
  // Only count it if PesaPal took the amount and currency we asked for
  const paidInFull =
    String(result.currency).toUpperCase() === payment.currency && Number(result.amount) >= Number(payment.amount);
  if (status === "completed" && !paidInFull) status = "invalid";

  await admin
    .from("payments")
    .update({
      status,
      payment_method: result.payment_method ?? null,
      confirmation_code: result.confirmation_code ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (status === "completed") {
    const { error } = await admin.rpc("apply_payment", { p_reference: payment.merchant_reference });
    if (error) throw error;
  }
  return { ...payment, status };
}
