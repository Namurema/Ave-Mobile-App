import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useReadAloud, type SpeechSection } from "../lib/speech";
import { Button } from "./ui/button";

// Listen / Pause / Resume / Stop. Shown where the phone has a voice for the
// app's language. Reads `sections`, or drives a shared `speech` reader so the text it
// reads can highlight the section in progress.
export function ReadAloudBar({
  sections,
  speech,
}: {
  sections?: SpeechSection[];
  // Pass a hook result to share it with the text it highlights
  speech?: ReturnType<typeof useReadAloud>;
}) {
  const own = useReadAloud(sections ?? []);
  const reader = speech ?? own;
  const { t } = useTranslation();
  if (!reader.available) return null;

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      {reader.state === "playing" ? (
        <Button size="sm" variant="outline" onPress={reader.pause}>
          {t("readAloud.pause")}
        </Button>
      ) : (
        <Button size="sm" variant={reader.state === "paused" ? "default" : "outline"} onPress={reader.play}>
          {reader.state === "paused" ? t("readAloud.resume") : t("readAloud.listen")}
        </Button>
      )}
      {reader.state !== "idle" && (
        <>
          <Button size="sm" variant="ghost" onPress={reader.stop}>
            {t("readAloud.stop")}
          </Button>
          <Text aria-live="polite" className="text-xs text-muted-foreground">
            {reader.state === "playing" ? t("readAloud.reading") : t("readAloud.paused")}
          </Text>
        </>
      )}
    </View>
  );
}
