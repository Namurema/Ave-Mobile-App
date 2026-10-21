// PesaPal's Instant Payment Notification: PesaPal calls this whenever an
// order's status changes. Nothing in the request is trusted; the status is
// fetched from PesaPal itself. Deployed without JWT checks (PesaPal has none).
import { adminClient, corsHeaders, json, syncPayment } from "../_shared/pesapal.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const orderTrackingId = url.searchParams.get("OrderTrackingId") ?? body.OrderTrackingId ?? "";
  const merchantReference = url.searchParams.get("OrderMerchantReference") ?? body.OrderMerchantReference ?? "";
  const notificationType = url.searchParams.get("OrderNotificationType") ?? body.OrderNotificationType ?? "IPNCHANGE";

  let status = 200;
  try {
    if (orderTrackingId) await syncPayment(adminClient(), orderTrackingId);
  } catch (error) {
    // 500 tells PesaPal to try again later
    console.error("IPN failed:", error);
    status = 500;
  }

  // The acknowledgement PesaPal expects
  return json({
    orderNotificationType: notificationType,
    orderTrackingId,
    orderMerchantReference: merchantReference,
    status,
  });
});
