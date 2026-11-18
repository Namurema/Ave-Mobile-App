// Starts a payment. Needs a signed-in user.
//   POST { plan: "monthly" | "yearly", currency: "UGX", phone } → { reference, prompt_sent, checkout_url }
//     Uganda: ObPay sends an MTN or Airtel PIN prompt to the phone
//   POST { plan, currency: "USD" } → { reference, checkout_url }
//     Abroad: ObPay's hosted card checkout, which sends the person back to
//     /payment/complete?ref=… afterwards
import {
  ObPayError,
  PRICES,
  adminClient,
  corsHeaders,
  env,
  json,
  newReference,
  obpay,
  requestUser,
  ugandaPhone,
  webhookUrl,
  type Currency,
  type Plan,
} from "../_shared/obpay.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  try {
    const user = await requestUser(req);
    if (!user?.email) return json({ error: "Sign in first" }, 401);

    const { plan, currency, phone } = await req.json().catch(() => ({}));
    if (!(currency in PRICES) || !(plan in PRICES.UGX)) return json({ error: "Unknown plan" }, 400);
    const amount = PRICES[currency as Currency][plan as Plan];
    const phoneNumber = currency === "UGX" ? ugandaPhone(phone) : null;
    if (currency === "UGX" && !phoneNumber) return json({ error: "invalid_phone" }, 400);

    const admin = adminClient();
    const reference = newReference();
    const { error: insertError } = await admin.from("payments").insert({
      user_id: user.id,
      merchant_reference: reference,
      plan,
      currency,
      amount,
      payment_method: currency === "UGX" ? "mobile_money" : "card",
    });
    if (insertError) throw insertError;

    const order = {
      reference,
      amount,
      currency,
      customer_name: (user.user_metadata?.full_name as string | undefined)?.trim() || user.email.split("@")[0],
      customer_email: user.email,
      description: plan === "yearly" ? "Ave yearly plan" : "Ave monthly plan",
      callback_url: webhookUrl(),
      redirect_url: `${env("SITE_URL")}/payment/complete?ref=${reference}`,
      metadata: { plan, user_id: user.id },
    };

    try {
      const data =
        currency === "UGX"
          ? await obpay("/collect", { method: "POST", body: { ...order, phone_number: phoneNumber } })
          : await obpay("/services/cards", { method: "POST", body: order });
      return json({ reference, prompt_sent: !!data.prompt_sent, checkout_url: data.checkout_url ?? null });
    } catch (error) {
      // 202: ObPay isn't sure the request went through. Keep it pending and let
      // the app check this same reference, never charge again.
      if (error instanceof ObPayError && error.status === 202) {
        return json({ reference, prompt_sent: false, checkout_url: null, uncertain: true });
      }
      await admin.from("payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("merchant_reference", reference);
      if (error instanceof ObPayError && error.status === 429) return json({ error: "too_many_requests" }, 429);
      console.error("ObPay refused the payment:", error instanceof ObPayError ? error.body : error);
      return json({ error: "refused" }, 400);
    }
  } catch (error) {
    console.error("checkout failed:", error);
    return json({ error: "Couldn't start the payment" }, 500);
  }
});
