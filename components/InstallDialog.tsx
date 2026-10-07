import { useEffect, useState } from "react";
import { View } from "react-native";
import { usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "../lib/pwa";
import { useAuthDialog } from "../store/authDialogStore";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";

// Pop-up inviting web visitors to install Ave. Appears a few seconds into using
// the app; "Not now" or Close hides it for a week. Mounted in the root layout.
const SNOOZE_KEY = "ave-install-snoozed-until";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_AFTER_MS = 6000;
// Only on the main tabs, never while someone is reading or praying
const SHOW_ON = ["/home", "/prayers", "/rosary", "/profile"];

function snoozed() {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

export function InstallDialog() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isWeb, isStandalone, isIOS, isAndroid, canPrompt, promptInstall } = useInstallPrompt();
  const authOpen = useAuthDialog((state) => !!state.view);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  const installable = isWeb && !isStandalone && (canPrompt || isIOS || isAndroid);
  const inApp = SHOW_ON.includes(pathname);

  useEffect(() => {
    if (shown || !installable || !inApp || authOpen || snoozed()) return;
    const timer = setTimeout(() => {
      setOpen(true);
      setShown(true);
    }, SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [shown, installable, inApp, authOpen]);

  if (!open) return null;

  const notNow = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {}
    setOpen(false);
  };

  const install = async () => {
    await promptInstall();
    setOpen(false);
  };

  const description = canPrompt
    ? t("install.promptDescription")
    : isIOS
      ? t("install.iosDescription")
      : t("install.androidDescription");

  return (
    <Dialog glass open onClose={notNow} title={t("install.title")} description={description} closeLabel={t("common.close")}>
      <View className="gap-2">
        {canPrompt && (
          <Button size="lg" onPress={install}>
            {t("install.install")}
          </Button>
        )}
        <Button variant="ghost" onPress={notNow}>
          {t("install.notNow")}
        </Button>
      </View>
    </Dialog>
  );
}
