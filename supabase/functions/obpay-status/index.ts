// The app's "did my payment go through?" check while the person waits.
//   POST { reference } → { status }
// Reads our own record first (the webhook usually settles it within a minute)
// and asks ObPay at most every 30 seconds per payment, as ObPay asks.
import { adminClient, corsHeaders, json, requestUser, syncPayment } from "../_shared/obpay.ts";

const ASK_OBPAY_EVERY_MS = 30_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  try {
    const user = await requestUser(req);
    if (!user) return json({ error: "Sign in first" }, 401);

    const { reference } = await req.json().catch(() => ({}));
    if (typeof reference !== "string" || !reference) return json({ error: "Missing payment" }, 400);

    const admin = adminClient();
    // Only the person who paid can check their payment
    const { data: payment } = await admin
      .from("payments")
      .select("user_id, status, updated_at")
      .eq("merchant_reference", reference)
      .maybeSingle();
    if (!payment || payment.user_id !== user.id) return json({ error: "Payment not found" }, 404);

    if (payment.status !== "pending" || Date.now() - new Date(payment.updated_at).getTime() < ASK_OBPAY_EVERY_MS) {
      return json({ status: payment.status });
    }
    const synced = await syncPayment(admin, reference);
    return json({ status: synced?.status ?? "pending" });
  } catch (error) {
    console.error("status check failed:", error);
    return json({ error: "Couldn't check the payment" }, 500);
  }
});
