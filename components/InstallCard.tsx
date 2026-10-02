import { useState } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "../lib/pwa";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const DISMISS_KEY = "ave-install-dismissed";

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

// Invites web visitors to add Ave to their home screen. Renders nothing in the
// native app, inside the installed app, or where installing isn't possible.
export function InstallCard({ dismissible = true }: { dismissible?: boolean }) {
  const { t } = useTranslation();
  const { isWeb, isStandalone, isIOS, isAndroid, canPrompt, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => isWeb && dismissible && readDismissed());

  if (!isWeb || dismissed) return null;

  if (isStandalone) {
    return dismissible ? null : (
      <Card className="p-4">
        <Text className="text-sm text-muted-foreground">{t("install.installed")}</Text>
      </Card>
    );
  }

  let description: string;
  if (canPrompt) {
    description = t("install.promptDescription");
  } else if (isIOS) {
    description = t("install.iosDescription");
  } else if (isAndroid) {
    description = t("install.androidDescription");
  } else {
    // Desktop browsers without an install prompt
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <Card className="p-4 md:p-5 gap-3">
      <View className="gap-0.5">
        <Text className="text-sm font-semibold text-card-foreground">{t("install.title")}</Text>
        <Text className="text-sm leading-5 text-muted-foreground">{description}</Text>
      </View>
      <View className="flex-row gap-2">
        {canPrompt && (
          <Button size="sm" onPress={promptInstall}>
            {t("install.install")}
          </Button>
        )}
        {dismissible && (
          <Button variant="ghost" size="sm" onPress={dismiss}>
            {t("install.notNow")}
          </Button>
        )}
      </View>
    </Card>
  );
}
