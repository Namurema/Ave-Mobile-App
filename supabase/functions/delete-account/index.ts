// "Delete my account" in Settings. Deletes the signed-in account; its progress,
// favourites, routine, reminders, payments and profile go with it (their
// tables cascade on delete). Feedback would only lose its link to the
// account, so the person's feedback is deleted first, email and all.
//   POST → { deleted: true }
import { adminClient, corsHeaders, json, requestUser } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  try {
    const user = await requestUser(req);
    if (!user) return json({ error: "Sign in first" }, 401);

    const admin = adminClient();
    const { error: feedbackError } = await admin.from("feedback").delete().eq("user_id", user.id);
    // No feedback table yet is fine
    if (feedbackError && feedbackError.code !== "42P01") throw feedbackError;

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return json({ deleted: true });
  } catch (error) {
    console.error("delete account failed:", error);
    return json({ error: "Couldn't delete the account" }, 500);
  }
});
