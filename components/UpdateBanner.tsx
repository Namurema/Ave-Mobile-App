import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useUpdateReady, applyUpdate } from "../lib/pwa";
import { Button } from "./ui/button";

// Floating bar shown when a newer version of the web app has been deployed
export function UpdateBanner() {
  const { t } = useTranslation();
  const ready = useUpdateReady();
  if (!ready) return null;
  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 bottom-20 md:bottom-6 items-center px-4"
    >
      <View
        role="status"
        className="w-full max-w-md flex-row items-center gap-3 rounded-xl border border-border bg-background p-4 shadow-lg"
      >
        <Text className="flex-1 text-sm text-foreground">{t("update.ready")}</Text>
        <Button size="sm" onPress={applyUpdate}>
          {t("update.refresh")}
        </Button>
      </View>
    </View>
  );
}
