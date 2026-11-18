import { useEffect, useState } from "react";
import { View, Text, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "../lib/pwa";
import { useAuthStore } from "../store/authStore";
import { enableReminders, reminderSupport } from "../lib/reminders";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

// Pop-ups on Home, at most one a visit: "Add Ave to your phone" for browser
// visitors, then "Turn on notifications" for signed-in people who haven't
// answered yet (a daily prayer, plus their routine reminders).

const DAY = 24 * 60 * 60 * 1000;
const INSTALL_KEY = "ave-install-asked";
const NOTIFY_KEY = "ave-notify-asked";

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};
const askedWithin = (key: string, ms: number) => Date.now() - Number(read(key) ?? 0) < ms;

let shownThisVisit = false;

export function HomePopups() {
  const { isWeb, isStandalone, isIOS, isAndroid, canPrompt } = useInstallPrompt();
  const session = useAuthStore((state) => state.session);
  const [popup, setPopup] = useState<"install" | "notify" | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || shownThisVisit) return;
    const wantsInstall = isWeb && !isStandalone && (isIOS || isAndroid || canPrompt) && !askedWithin(INSTALL_KEY, 14 * DAY);
    // Notifications need an account (they're sent to it) and a phone that
    // supports them (an iPhone only once Ave is on the Home Screen). Asked
    // until answered; "Not now" waits 3 days.
    const wantsNotify =
      !!session &&
      reminderSupport() === "supported" &&
      Notification.permission === "default" &&
      !askedWithin(NOTIFY_KEY, 3 * DAY);
    const next = wantsInstall ? "install" : wantsNotify ? "notify" : null;
    if (!next) return;
    // Let Home appear first
    const timer = setTimeout(() => {
      shownThisVisit = true;
      write(next === "install" ? INSTALL_KEY : NOTIFY_KEY, String(Date.now()));
      setPopup(next);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isStandalone, canPrompt, session]);

  if (popup === "install") return <InstallDialog onClose={() => setPopup(null)} />;
  if (popup === "notify") return <NotifyDialog onClose={() => setPopup(null)} />;
  return null;
}

// One numbered step with an icon, e.g. "1. Tap Share [icon]"
function Step({ number, text, icon }: { number: number; text: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
        <Text className="text-sm font-bold text-white">{number}</Text>
      </View>
      <Text className="flex-1 text-sm leading-5 text-foreground">{text}</Text>
      {icon ? <Ionicons name={icon} size={22} color="#01758F" /> : null}
    </View>
  );
}

export function InstallDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { isIOS, canPrompt, promptInstall } = useInstallPrompt();

  const install = async () => {
    await promptInstall();
    onClose();
  };

  return (
    <Dialog open onClose={onClose} title={t("install.popupTitle")} description={t("install.popupDescription")} closeLabel={t("common.close")}>
      <View className="gap-4">
        {isIOS ? (
          <View className="gap-3">
            <Step number={1} text={t("install.iosStep1")} icon="share-outline" />
            <Step number={2} text={t("install.iosStep2")} icon="add-circle-outline" />
            <Step number={3} text={t("install.iosStep3")} />
            <Text className="text-xs leading-5 text-muted-foreground">{t("install.iosNote")}</Text>
          </View>
        ) : canPrompt ? null : (
          <View className="gap-3">
            <Step number={1} text={t("install.androidStep1")} icon="ellipsis-vertical" />
            <Step number={2} text={t("install.androidStep2")} icon="phone-portrait-outline" />
            <Step number={3} text={t("install.androidStep3")} />
          </View>
        )}
        <View className="flex-row flex-wrap gap-2">
          {canPrompt && <Button onPress={install}>{t("install.install")}</Button>}
          <Button variant={canPrompt ? "ghost" : "outline"} onPress={onClose}>
            {isIOS || !canPrompt ? t("install.gotIt") : t("install.notNow")}
          </Button>
        </View>
      </View>
    </Dialog>
  );
}

// "Get a daily prayer?" Turning on must start from the tap (iPhones only ask
// for permission in response to one).
function NotifyDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const turnOn = () => {
    setBusy(true);
    enableReminders(t("reminders.heading")).then((result) => {
      setBusy(false);
      if (result === "on") return onClose();
      setNote(t(result === "denied" ? "reminders.denied" : "reminders.failed"));
    });
  };

  return (
    <Dialog open onClose={onClose} title={t("reminders.askTitle")} description={t("reminders.askText")} closeLabel={t("common.close")}>
      <View className="gap-3">
        <View className="flex-row items-center gap-3 rounded-xl bg-accent/40 p-3">
          <Ionicons name="notifications-outline" size={24} color="#01758F" />
          <Text className="flex-1 text-sm leading-5 text-foreground">{t("reminders.askExample")}</Text>
        </View>
        {note ? <Text className="text-sm text-destructive">{note}</Text> : null}
        <View className="flex-row flex-wrap gap-2">
          <Button loading={busy} onPress={turnOn}>
            {t("reminders.turnOn")}
          </Button>
          <Button variant="ghost" disabled={busy} onPress={onClose}>
            {t("install.notNow")}
          </Button>
        </View>
      </View>
    </Dialog>
  );
}
