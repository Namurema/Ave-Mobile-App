import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { supabase } from "./supabase/client";
import { VAPID_PUBLIC_KEY } from "../constants/reminders";

// Prayer reminders on this phone (web push). The server sends them at each
// routine prayer's time (supabase/functions/send-reminders).

// "installFirst": iPhones only allow notifications for apps added to the
// Home Screen (iOS 16.4 and later)
export type ReminderSupport = "supported" | "installFirst" | "unsupported";

export function reminderSupport(): ReminderSupport {
  if (Platform.OS !== "web" || typeof window === "undefined") return "unsupported";
  const iOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const installed =
    window.matchMedia?.("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
  if (iOS && !installed) return "installFirst";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return iOS ? "installFirst" : "unsupported";
  }
  return "supported";
}

// The public key in the form PushManager wants
function keyBytes(base64: string) {
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

async function currentSubscription() {
  if (reminderSupport() !== "supported") return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export type ReminderStatus = "loading" | "off" | "on" | "denied";

// Turns reminders on. Call straight from a tap: iPhones only ask for
// permission in response to one. `heading` is the reminder title in the
// person's language ("Time to pray").
export async function enableReminders(heading: string): Promise<ReminderStatus | "error"> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) }));
    const keys = subscription.toJSON().keys ?? {};
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Kampala",
        heading: heading.slice(0, 80),
      },
      { onConflict: "endpoint" }
    );
    return error ? "error" : "on";
  } catch {
    return "error";
  }
}

export async function disableReminders() {
  const subscription = await currentSubscription();
  if (!subscription) return;
  await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
  await subscription.unsubscribe().catch(() => {});
}

export async function sendTestReminder(title: string, body: string) {
  const { data, error } = await supabase.functions.invoke("send-test-reminder", { body: { title, body } });
  if (error) throw error;
  return (data?.sent ?? 0) as number;
}

// This phone's reminder state, for the Routine page
export function useReminders() {
  const [support] = useState<ReminderSupport>(() => reminderSupport());
  const [status, setStatus] = useState<ReminderStatus>("loading");

  useEffect(() => {
    if (support !== "supported") return;
    if (Notification.permission === "denied") return setStatus("denied");
    currentSubscription()
      .then((subscription) => setStatus(subscription && Notification.permission === "granted" ? "on" : "off"))
      .catch(() => setStatus("off"));
  }, [support]);

  return { support, status, setStatus };
}
