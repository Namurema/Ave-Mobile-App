// ObPay's payment notifications (the callback_url of every payment). The
// signature is checked first; even then nothing in the message is trusted: the
// payment's state is fetched from ObPay itself. Deployed without JWT checks
// (ObPay signs its messages instead). Must answer 200 within 8 seconds and
// never redirect.
import { adminClient, json, syncPayment, validSignature } from "../_shared/obpay.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  const raw = await req.text();
  if (!(await validSignature(raw, req.headers.get("X-ObPay-Signature")))) {
    return json({ error: "Bad signature" }, 401);
  }

  let event: any = {};
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: "Bad JSON" }, 400);
  }

  const reference = event?.data?.reference;
  try {
    if (typeof reference === "string" && event?.data?.type === "collection") {
      await syncPayment(adminClient(), reference);
    }
  } catch (error) {
    // 500 makes ObPay try again later
    console.error("webhook failed:", error);
    return json({ error: "Try again" }, 500);
  }
  return json({ received: true });
});
