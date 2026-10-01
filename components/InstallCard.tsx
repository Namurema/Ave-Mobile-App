import { useState } from "react";
import { View, Text } from "react-native";
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
  const { isWeb, isStandalone, isIOS, isAndroid, canPrompt, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => isWeb && dismissible && readDismissed());

  if (!isWeb || dismissed) return null;

  if (isStandalone) {
    return dismissible ? null : (
      <Card className="p-4">
        <Text className="text-sm text-muted-foreground">Ave is installed on this device.</Text>
      </Card>
    );
  }

  let description: string;
  if (canPrompt) {
    description = "Add Ave to your home screen to open it like an app, even without internet.";
  } else if (isIOS) {
    description = "In Safari, tap the Share button, then choose “Add to Home Screen”.";
  } else if (isAndroid) {
    description = "Open your browser menu and choose “Install app” or “Add to Home screen”.";
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
        <Text className="text-sm font-semibold text-card-foreground">Install Ave</Text>
        <Text className="text-sm leading-5 text-muted-foreground">{description}</Text>
      </View>
      <View className="flex-row gap-2">
        {canPrompt && (
          <Button size="sm" onPress={promptInstall}>
            Install
          </Button>
        )}
        {dismissible && (
          <Button variant="ghost" size="sm" onPress={dismiss}>
            Not now
          </Button>
        )}
      </View>
    </Card>
  );
}
