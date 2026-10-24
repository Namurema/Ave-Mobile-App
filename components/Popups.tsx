import { useEffect, useState } from "react";
import { View, Text, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "../lib/pwa";
import { DONATE, DONATIONS_ENABLED, DONATE_AFTER_DAYS } from "../constants/donate";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

// Pop-ups on Home: "Add Ave to your phone" for browser visitors, and a
// donation request once someone has prayed with Ave on a few different days.
// At most one pop-up per visit.

const DAY = 24 * 60 * 60 * 1000;
const INSTALL_KEY = "ave-install-asked";
const DONATE_KEY = "ave-donate-asked";
const DAYS_KEY = "ave-active-days";

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

// Records today and returns on how many different days Ave has been opened
function countActiveDays() {
  let days: string[] = [];
  try {
    days = JSON.parse(read(DAYS_KEY) ?? "[]");
  } catch {}
  const today = new Date().toISOString().slice(0, 10);
  if (!days.includes(today)) days = [...days, today].slice(-30);
  write(DAYS_KEY, JSON.stringify(days));
  return days.length;
}

let shownThisVisit = false;

export function HomePopups() {
  const { isWeb, isStandalone, isIOS, isAndroid, canPrompt } = useInstallPrompt();
  const [popup, setPopup] = useState<"install" | "donate" | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || shownThisVisit) return;
    const activeDays = countActiveDays();
    const wantsInstall = isWeb && !isStandalone && (isIOS || isAndroid || canPrompt) && !askedWithin(INSTALL_KEY, 14 * DAY);
    const wantsDonate = DONATIONS_ENABLED && activeDays >= DONATE_AFTER_DAYS && !askedWithin(DONATE_KEY, 30 * DAY);
    const next = wantsInstall ? "install" : wantsDonate ? "donate" : null;
    if (!next) return;
    // Let Home appear first
    const timer = setTimeout(() => {
      shownThisVisit = true;
      write(next === "install" ? INSTALL_KEY : DONATE_KEY, String(Date.now()));
      setPopup(next);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isStandalone, canPrompt]);

  if (popup === "install") return <InstallDialog onClose={() => setPopup(null)} />;
  if (popup === "donate") return <DonateDialog onClose={() => setPopup(null)} />;
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

function InstallDialog({ onClose }: { onClose: () => void }) {
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

// The Airtel Money steps, with a button to copy the merchant code. Also in
// Settings, so people can give at any time.
export function DonateSteps() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DONATE.airtelCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-3 rounded-md bg-muted p-3">
        <View className="gap-0.5">
          <Text className="text-xs font-semibold uppercase tracking-widest text-primary">{t("donate.codeLabel")}</Text>
          <Text className="text-xl font-bold tracking-wider text-foreground">{DONATE.airtelCode}</Text>
          {DONATE.airtelName ? <Text className="text-xs text-muted-foreground">{DONATE.airtelName}</Text> : null}
        </View>
        {Platform.OS === "web" && (
          <Button size="sm" variant="outline" onPress={copy}>
            {copied ? t("donate.copied") : t("donate.copy")}
          </Button>
        )}
      </View>
      <Step number={1} text={t("donate.step1")} />
      <Step number={2} text={`${t("donate.step2")} ${DONATE.airtelCode}`} />
      <Step number={3} text={t("donate.step3")} />
      <Step number={4} text={`${t("donate.step4")} “${DONATE.airtelName}”`} />
      <Step number={5} text={t("donate.step5")} />
    </View>
  );
}

function DonateDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [later, setLater] = useState(false);

  if (later) {
    return (
      <Dialog open onClose={onClose} title={t("donate.laterTitle")} description={t("donate.laterText")} closeLabel={t("common.close")}>
        <Button onPress={onClose}>{t("install.gotIt")}</Button>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={() => setLater(true)} title={t("donate.title")} description={t("donate.text")} closeLabel={t("donate.later")}>
      <View className="gap-4">
        <DonateSteps />
        <View className="flex-row flex-wrap gap-2">
          <Button onPress={onClose}>{t("donate.done")}</Button>
          <Button variant="ghost" onPress={() => setLater(true)}>
            {t("donate.later")}
          </Button>
        </View>
      </View>
    </Dialog>
  );
}

// Settings: "Support Ave"
export function DonateCard() {
  const { t } = useTranslation();
  if (!DONATIONS_ENABLED) return null;
  return (
    <Card className="p-4 gap-3">
      <Text className="text-sm leading-6 text-muted-foreground">{t("donate.text")}</Text>
      <DonateSteps />
    </Card>
  );
}
