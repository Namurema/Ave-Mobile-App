import { useMemo } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { withAccountPrompt } from "../lib/accountPrompt";
import { useUserDataStore, usePrayedToday, useIsFavourite } from "../store/userDataStore";
import { novenaProgress, splitLogId } from "../lib/progress";
import { itemKey, novenaLength } from "../lib/items";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

// "Save to favourites" / "Saved", for a page header
export function FavouriteButton({ itemKey: key }: { itemKey: string }) {
  const { t } = useTranslation();
  const saved = useIsFavourite(key);
  const toggleFavourite = useUserDataStore((state) => state.toggleFavourite);
  return (
    <Button
      size="sm"
      variant={saved ? "default" : "outline"}
      aria-pressed={saved}
      // Saving asks guests to sign in first; removing never does
      onPress={() => (saved ? toggleFavourite(key) : withAccountPrompt(() => toggleFavourite(key)))}
    >
      {saved ? t("favourites.saved") : t("favourites.save")}
    </Button>
  );
}

// End-of-prayer card: mark today's prayer as prayed, or undo
export function PrayedCard({ itemKey: key, label }: { itemKey: string; label?: string }) {
  const { t } = useTranslation();
  const prayed = usePrayedToday(key);
  const { markPrayed, unmarkPrayed } = useUserDataStore();
  return (
    <Card className="p-5 gap-3">
      {prayed ? (
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-base font-semibold text-primary">{t("progress.prayedToday")}</Text>
          <Button variant="ghost" size="sm" onPress={() => unmarkPrayed(key)}>
            {t("progress.undo")}
          </Button>
        </View>
      ) : (
        <Button size="lg" onPress={() => withAccountPrompt(() => markPrayed(key))}>
          {label ?? t("progress.markPrayed")}
        </Button>
      )}
    </Card>
  );
}

// "Day 3 of 9" for a novena, with a bar of days
export function NovenaProgressCard({ novenaId }: { novenaId: string }) {
  const { t } = useTranslation();
  const key = itemKey.novena(novenaId);
  const log = useUserDataStore((state) => state.log);
  const progress = useMemo(() => {
    const days = new Set([...log].map(splitLogId).filter((e) => e.key === key).map((e) => e.day));
    return novenaProgress(days, novenaLength(novenaId));
  }, [log, key, novenaId]);

  const status = progress.completed
    ? t("progress.novenaComplete")
    : progress.daysDone === 0
      ? t("progress.novenaStart")
      : progress.prayedToday
        ? `${t("progress.novenaNext")} ${progress.nextDay}`
        : `${t("progress.novenaToday")} ${progress.nextDay}`;

  return (
    <Card className="p-5 gap-3">
      <View className="flex-row items-baseline justify-between gap-3">
        <Text className="text-base font-semibold text-card-foreground">{t("progress.novenaTitle")}</Text>
        <Text className="text-sm font-semibold text-primary">
          {t("progress.day")} {progress.daysDone} {t("progress.of")} {progress.length}
        </Text>
      </View>
      <View className="flex-row gap-1" aria-hidden>
        {Array.from({ length: progress.length }, (_, i) => (
          <View
            key={i}
            className={cn("h-2 flex-1 rounded-full", i < progress.daysDone ? "bg-primary" : "bg-muted")}
          />
        ))}
      </View>
      <Text className="text-sm text-foreground">{status}</Text>
      <Text className="text-xs leading-5 text-muted-foreground">{t("progress.novenaRule")}</Text>
    </Card>
  );
}
