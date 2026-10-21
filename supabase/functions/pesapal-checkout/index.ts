// Starts a payment: records it, creates the PesaPal order and returns the
// PesaPal page to send the person to. Needs a signed-in user.
//   POST { plan: "monthly" | "yearly", currency: "UGX" | "USD" } → { redirect_url }
import { PRICES, adminClient, corsHeaders, json, pesapalToken, requestUser, submitOrder, type Currency, type Plan } from "../_shared/pesapal.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  try {
    const user = await requestUser(req);
    if (!user?.email) return json({ error: "Sign in first" }, 401);

    const { plan, currency } = await req.json().catch(() => ({}));
    if (!(currency in PRICES) || !(plan in PRICES.UGX)) return json({ error: "Unknown plan" }, 400);
    const amount = PRICES[currency as Currency][plan as Plan];

    const admin = adminClient();
    const reference = crypto.randomUUID();
    const { error: insertError } = await admin.from("payments").insert({
      user_id: user.id,
      merchant_reference: reference,
      plan,
      currency,
      amount,
    });
    if (insertError) throw insertError;

    const order = await submitOrder(await pesapalToken(), {
      id: reference,
      currency,
      amount,
      description: plan === "yearly" ? "Ave yearly plan" : "Ave monthly plan",
      email: user.email,
      name: user.user_metadata?.full_name,
    });

    await admin.from("payments").update({ order_tracking_id: order.order_tracking_id }).eq("merchant_reference", reference);
    return json({ redirect_url: order.redirect_url });
  } catch (error) {
    console.error("checkout failed:", error);
    return json({ error: "Couldn't start the payment" }, 500);
  }
});
