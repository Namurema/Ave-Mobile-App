import { useEffect, useState } from "react";
import { View, Text, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "../lib/pwa";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

// Pop-up on Home: "Add Ave to your phone" for browser visitors, at most once a visit.

const DAY = 24 * 60 * 60 * 1000;
const INSTALL_KEY = "ave-install-asked";

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
  const [popup, setPopup] = useState<"install" | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || shownThisVisit) return;
    const wantsInstall = isWeb && !isStandalone && (isIOS || isAndroid || canPrompt) && !askedWithin(INSTALL_KEY, 14 * DAY);
    const next = wantsInstall ? "install" : null;
    if (!next) return;
    // Let Home appear first
    const timer = setTimeout(() => {
      shownThisVisit = true;
      write(INSTALL_KEY, String(Date.now()));
      setPopup(next);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isStandalone, canPrompt]);

  if (popup === "install") return <InstallDialog onClose={() => setPopup(null)} />;
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
