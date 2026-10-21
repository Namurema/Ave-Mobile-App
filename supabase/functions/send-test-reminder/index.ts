// "Send a test reminder" on the Routine page: pushes one notification to the
// signed-in person's phones, so they can see reminders work.
//   POST { title, body } → { sent }
import { adminClient, corsHeaders, json, requestUser } from "../_shared/common.ts";
import { sendPush, type Subscription } from "../_shared/push.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  try {
    const user = await requestUser(req);
    if (!user) return json({ error: "Sign in first" }, 401);
    const { title, body } = await req.json().catch(() => ({}));

    const admin = adminClient();
    const { data: phones } = await admin
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .eq("user_id", user.id);

    let sent = 0;
    for (const phone of (phones ?? []) as Subscription[]) {
      const result = await sendPush(phone, {
        title: String(title ?? "Ave").slice(0, 80),
        body: String(body ?? "").slice(0, 200),
        url: "/routine",
        tag: "test",
      });
      if (result === "gone") await admin.from("push_subscriptions").delete().eq("id", phone.id);
      else sent++;
    }
    return json({ sent });
  } catch (error) {
    console.error("test reminder failed:", error);
    return json({ error: "Couldn't send the test reminder" }, 500);
  }
});
