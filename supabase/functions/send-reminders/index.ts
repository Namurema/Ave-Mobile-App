// Sends notifications that are due. Called every 5 minutes by pg_cron
// (see scripts/reminders-setup.mjs) with the x-cron-secret header.
//
// - Everyone with notifications on gets one "daily prayer" at DAILY_TIME in their
//   own time zone: a novena starting today, else in turn the verse of the day
//   (the same one Home shows), an encouraging word, or the morning prayers.
// - People with a routine also get a reminder at each routine prayer's time.
//
// Something is due when its time was within the last WINDOW_MINUTES. Each one is
// sent at most once a day per person (public.reminders_sent), however many
// times this runs.
import { adminClient, env, json } from "../_shared/common.ts";
import { routeFor, sendPush, type PushMessage, type Subscription } from "../_shared/push.ts";

// Wider than the 5-minute schedule, so a late or skipped run still sends
const WINDOW_MINUTES = 30;
const PAGE = 1000;
const DAILY_TIME = "07:30";
const DAILY_KEY = "daily";
const SITE = "https://aveprayers.com";

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
const isDue = (local: { minutes: number }, time: string) => {
  const since = local.minutes - toMinutes(time);
  return since >= 0 && since < WINDOW_MINUTES;
};

// ---- The daily prayer ----------------------------------------------------------

// Same order as lib/foryou.ts MOODS, so the verse matches the one on Home
const MOODS = [
  "sad", "hopeless", "disappointed", "depressed", "lost",
  "grieving", "pain", "betrayed", "anxious", "lonely",
  "afraid", "guilty", "tired", "thankful", "peaceful",
];
// Encouraging words come from the gentler feelings
const WORD_MOODS = ["hopeless", "sad", "tired", "anxious", "lonely", "lost", "afraid", "peaceful", "thankful"];

// Novenas with set dates (lib/seasons.ts): the feast, and how many days come before it
const NOVENAS: { id: string; title: string; feast: [number, number] | "divine-mercy"; days: number }[] = [
  { id: "6", title: "Novena to St. Jude", feast: [10, 28], days: 9 },
  { id: "2", title: "Novena to Our Lady of Perpetual Help", feast: [6, 27], days: 9 },
  { id: "8", title: "Novena to Pope St. Leo the Great", feast: [11, 10], days: 9 },
  { id: "9", title: "Novena to Our Lady of Guadalupe", feast: [12, 12], days: 9 },
  { id: "10", title: "Novena to the Holy Name of Jesus", feast: [1, 3], days: 9 },
  { id: "11", title: "Novena to Our Lady of Hope", feast: [1, 17], days: 9 },
  { id: "12", title: "30 Day Novena to St. Joseph", feast: [3, 19], days: 30 },
  { id: "14", title: "Novena to Our Lady of Fatima", feast: [5, 13], days: 9 },
  { id: "15", title: "Novena to St. Dominic", feast: [8, 8], days: 9 },
  { id: "16", title: "Novena to Our Lady of Sorrows", feast: [9, 15], days: 9 },
  { id: "5", title: "Divine Mercy Novena", feast: "divine-mercy", days: 9 },
];

// Easter Sunday (Gregorian), as a UTC date
function easter(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(year, month - 1, day);
}

const DAY_MS = 86_400_000;

// The novena that starts on this date, if any ("YYYY-MM-DD")
function novenaStarting(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const today = Date.UTC(y, m - 1, d);
  for (const novena of NOVENAS) {
    for (const year of [y, y + 1]) {
      const feast = novena.feast === "divine-mercy" ? easter(year) + 7 * DAY_MS : Date.UTC(year, novena.feast[0] - 1, novena.feast[1]);
      if (feast - novena.days * DAY_MS === today) return novena;
    }
  }
  return null;
}

const dayOfYear = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / DAY_MS);
};
const clip = (text: string, max = 170) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

// The For You cards (public/foryou), fetched once per run
const moodFiles = new Map<string, Promise<any>>();
const loadMood = (mood: string) => {
  if (!moodFiles.has(mood)) moodFiles.set(mood, fetch(`${SITE}/foryou/en/${mood}.json`).then((r) => r.json()).catch(() => null));
  return moodFiles.get(mood)!;
};

// Today's daily prayer for a local date; the same for everyone on that date
const dailyByDate = new Map<string, Promise<PushMessage>>();
function dailyMessage(date: string): Promise<PushMessage> {
  if (!dailyByDate.has(date)) dailyByDate.set(date, buildDaily(date));
  return dailyByDate.get(date)!;
}

async function buildDaily(date: string): Promise<PushMessage> {
  const novena = novenaStarting(date);
  if (novena) {
    return { title: `${novena.title} starts today`, body: "Pray day 1 with Ave, and keep going for the days ahead.", url: `/novena/${novena.id}`, tag: DAILY_KEY };
  }
  const day = dayOfYear(date);
  const morning: PushMessage = { title: "Good morning", body: "Begin your day with God: your morning prayers are ready in Ave.", url: "/daily-prayer/morning", tag: DAILY_KEY };
  if (day % 3 === 0) {
    const file = await loadMood(MOODS[day % MOODS.length]);
    const verse = file?.verses?.[day % (file?.verses?.length || 1)];
    return verse ? { title: `Verse of the day · ${verse.ref}`, body: clip(verse.text), url: "/home", tag: DAILY_KEY } : morning;
  }
  if (day % 3 === 1) {
    const file = await loadMood(WORD_MOODS[day % WORD_MOODS.length]);
    const word = file?.messages?.[day % (file?.messages?.length || 1)];
    return word ? { title: "A word for today", body: clip(word.text), url: "/foryou", tag: DAILY_KEY } : morning;
  }
  return morning;
}

// ---- Sending ----------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== env("REMINDERS_CRON_SECRET")) return json({ error: "Forbidden" }, 403);

  const admin = adminClient();
  const now = new Date();
  let sent = 0;
  let removed = 0;

  // Claims a notification for today first, so two runs can't both send it
  const claim = async (userId: string, key: string, date: string) => {
    const { data } = await admin
      .from("reminders_sent")
      .upsert({ user_id: userId, item_key: key, sent_on: date }, { onConflict: "user_id,item_key,sent_on", ignoreDuplicates: true })
      .select();
    return !!data?.length;
  };

  const deliver = async (phones: Row[], message: PushMessage) => {
    for (const phone of phones) {
      try {
        if ((await sendPush(phone, message)) === "gone") {
          await admin.from("push_subscriptions").delete().eq("id", phone.id);
          removed++;
        } else {
          sent++;
        }
      } catch (error) {
        console.error("push failed:", error);
      }
    }
  };

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
    const routineOf = new Map((routines ?? []).map((routine) => [routine.user_id, (routine.entries ?? []) as Entry[]]));

    for (const [userId, phones] of byUser) {
      const local = localNow(now, phones[0].timezone);

      // One daily prayer for everyone
      if (isDue(local, DAILY_TIME) && (await claim(userId, DAILY_KEY, local.date))) {
        await deliver(phones, await dailyMessage(local.date));
      }

      // Routine reminders at their own times
      const due = (routineOf.get(userId) ?? []).filter((entry) => entry.time && entry.days?.includes(local.weekday) && isDue(local, entry.time));
      for (const entry of due) {
        if (!(await claim(userId, entry.key, local.date))) continue;
        await deliver(phones, { title: phones[0].heading, body: entry.title ?? "Ave", url: routeFor(entry.key), tag: entry.key });
      }
    }
    if (subs.length < PAGE) break;
  }

  return json({ sent, removed });
});
