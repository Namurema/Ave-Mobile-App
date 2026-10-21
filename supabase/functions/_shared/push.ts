// Web push to phones that turned on reminders (public.push_subscriptions).
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...),
// set with `node scripts/reminders-setup.mjs`.
import webpush from "npm:web-push@3.6.7";
import { env } from "./common.ts";

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(env("VAPID_SUBJECT"), env("VAPID_PUBLIC_KEY"), env("VAPID_PRIVATE_KEY"));
  configured = true;
}

export type Subscription = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };
export type PushMessage = { title: string; body: string; url: string; tag?: string };

// "sent", or "gone" when the phone has turned reminders off or uninstalled
// (the subscription should then be deleted)
export async function sendPush(subscription: Subscription, message: PushMessage): Promise<"sent" | "gone"> {
  configure();
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(message),
      { TTL: 60 * 60 }
    );
    return "sent";
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) return "gone";
    throw error;
  }
}

// Where a reminder opens, from a routine item key (lib/items.ts)
export function routeFor(key: string) {
  const [kind, id] = key.split(":");
  switch (kind) {
    case "daily":
      return `/daily-prayer/${id}`;
    case "novena":
      return `/novena/${id}`;
    case "chaplet":
      return `/chaplet/${id}`;
    case "other":
      return `/other-prayer/${id}`;
    case "stations":
      return "/stations";
    case "rosary":
      return "/prayer/session";
    default:
      return "/home";
  }
}
