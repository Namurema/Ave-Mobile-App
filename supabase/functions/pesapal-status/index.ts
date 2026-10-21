// The app's "did my payment go through?" check, after PesaPal sends the person
// back. Confirms with PesaPal directly, so it works even before the IPN arrives.
//   POST { orderTrackingId } → { status }
import { adminClient, corsHeaders, json, requestUser, syncPayment } from "../_shared/pesapal.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  try {
    const user = await requestUser(req);
    if (!user) return json({ error: "Sign in first" }, 401);

    const { orderTrackingId } = await req.json().catch(() => ({}));
    if (typeof orderTrackingId !== "string" || !orderTrackingId) return json({ error: "Missing order" }, 400);

    const admin = adminClient();
    // Only the person who paid can check their order
    const { data: owned } = await admin
      .from("payments")
      .select("user_id")
      .eq("order_tracking_id", orderTrackingId)
      .maybeSingle();
    if (!owned || owned.user_id !== user.id) return json({ error: "Order not found" }, 404);

    const payment = await syncPayment(admin, orderTrackingId);
    return json({ status: payment?.status ?? "pending" });
  } catch (error) {
    console.error("status check failed:", error);
    return json({ error: "Couldn't check the payment" }, 500);
  }
});
