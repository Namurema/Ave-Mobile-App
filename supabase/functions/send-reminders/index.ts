// Sends routine reminders that are due. Called every 5 minutes by pg_cron
// (see scripts/reminders-setup.mjs) with the x-cron-secret header.
//
// A prayer is due when today (in the person's own time zone) is one of its
// routine days and its time was within the last WINDOW_MINUTES. Each prayer is
// reminded at most once a day per person (public.reminders_sent), however many
// times this runs.
import { adminClient, env, json } from "../_shared/common.ts";
import { routeFor, sendPush, type Subscription } from "../_shared/push.ts";

// Wider than the 5-minute schedule, so a late or skipped run still sends
const WINDOW_MINUTES = 30;
const PAGE = 1000;

type Entry = { key: string; days: number[]; time?: string; title?: string };
type Row = Subscription & { timezone: string; heading: string };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Local date, weekday and minutes past midnight in a time zone
function localNow(now: Date, timeZone: string) {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
    }).formatToParts(now);
  } catch {
    return localNow(now, "Africa/Kampala");
  }
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    weekday: WEEKDAYS.indexOf(part("weekday")),
    minutes: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== env("REMINDERS_CRON_SECRET")) return json({ error: "Forbidden" }, 403);

  const admin = adminClient();
  const now = new Date();
  let sent = 0;
  let removed = 0;

  for (let from = 0; ; from += PAGE) {
    const { data: subs, error } = await admin
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth, timezone, heading")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!subs?.length) break;

    const byUser = new Map<string, Row[]>();
    for (const sub of subs as Row[]) byUser.set(sub.user_id, [...(byUser.get(sub.user_id) ?? []), sub]);

    const { data: routines } = await admin
      .from("prayer_routines")
      .select("user_id, entries")
      .in("user_id", [...byUser.keys()]);

    for (const routine of routines ?? []) {
      const phones = byUser.get(routine.user_id) ?? [];
      if (!phones.length) continue;
      const local = localNow(now, phones[0].timezone);

      const due = ((routine.entries ?? []) as Entry[]).filter((entry) => {
        if (!entry.time || !entry.days?.includes(local.weekday)) return false;
        const since = local.minutes - toMinutes(entry.time);
        return since >= 0 && since < WINDOW_MINUTES;
      });

      for (const entry of due) {
        // Claim it first, so two runs can't both send it
        const { data: claimed } = await admin
          .from("reminders_sent")
          .upsert({ user_id: routine.user_id, item_key: entry.key, sent_on: local.date }, {
            onConflict: "user_id,item_key,sent_on",
            ignoreDuplicates: true,
          })
          .select();
        if (!claimed?.length) continue;

        for (const phone of phones) {
          try {
            const result = await sendPush(phone, {
              title: phone.heading,
              body: entry.title ?? "Ave",
              url: routeFor(entry.key),
              tag: entry.key,
            });
            if (result === "gone") {
              await admin.from("push_subscriptions").delete().eq("id", phone.id);
              removed++;
            } else {
              sent++;
            }
          } catch (error) {
            console.error("push failed:", error);
          }
        }
      }
    }
    if (subs.length < PAGE) break;
  }

  return json({ sent, removed });
});
