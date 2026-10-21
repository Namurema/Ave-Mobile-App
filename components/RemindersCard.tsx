import { useState } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useAuthDialog } from "../store/authDialogStore";
import { disableReminders, enableReminders, sendTestReminder, useReminders } from "../lib/reminders";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

// Routine page: turn reminders on for this phone, send a test, or turn them off
export function RemindersCard() {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const { support, status, setStatus } = useReminders();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  let text: string;
  if (!session) text = t("reminders.signIn");
  else if (support === "installFirst") text = t("reminders.installFirst");
  else if (support === "unsupported") text = t("reminders.unsupported");
  else if (status === "denied") text = t("reminders.denied");
  else if (status === "on") text = t("reminders.on");
  else text = t("reminders.off");

  const turnOn = () => {
    setNote(null);
    setBusy(true);
    // Asking for permission must start right in the tap (iPhone)
    enableReminders(t("reminders.heading")).then((result) => {
      setBusy(false);
      if (result === "error") setNote(t("reminders.failed"));
      else setStatus(result);
    });
  };

  const test = async () => {
    setNote(null);
    setBusy(true);
    try {
      const sent = await sendTestReminder(t("reminders.heading"), t("reminders.testBody"));
      setNote(sent ? t("reminders.testSent") : t("reminders.failed"));
    } catch {
      setNote(t("reminders.failed"));
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setNote(null);
    setBusy(true);
    await disableReminders();
    setBusy(false);
    setStatus("off");
  };

  return (
    <Card className="p-4 gap-3 border-primary/30 bg-accent/30">
      <View className="gap-1">
        <Text className="text-base font-semibold text-card-foreground">{t("reminders.title")}</Text>
        <Text className="text-sm leading-5 text-muted-foreground">{text}</Text>
        {note ? <Text className="text-sm font-medium text-primary">{note}</Text> : null}
      </View>
      {!session ? (
        <Button size="sm" className="self-start" onPress={() => useAuthDialog.getState().open("signIn", "/routine")}>
          {t("auth.signIn")}
        </Button>
      ) : support === "supported" && status === "off" ? (
        <Button size="sm" className="self-start" loading={busy} onPress={turnOn}>
          {t("reminders.turnOn")}
        </Button>
      ) : support === "supported" && status === "on" ? (
        <View className="flex-row flex-wrap gap-2">
          <Button size="sm" variant="outline" loading={busy} onPress={test}>
            {t("reminders.test")}
          </Button>
          <Button size="sm" variant="ghost" disabled={busy} onPress={turnOff}>
            {t("reminders.turnOff")}
          </Button>
        </View>
      ) : null}
    </Card>
  );
}
