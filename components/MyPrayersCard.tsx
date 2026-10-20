import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useUserDataStore } from "../store/userDataStore";
import { useRoutineStore } from "../store/routineStore";
import { useContent } from "../lib/i18n/content";
import { describeItem } from "../lib/items";
import { entriesForDay } from "../lib/routines";
import { currentStreak, bestStreak, lastSevenDays, splitLogId, dayString, logId } from "../lib/progress";
import type { PageTab } from "./ui/page";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

// Progress, Routine and Favourites share one page header with tabs
export const myPrayersTabs = (t: TFunction): PageTab[] => [
  { label: t("progress.tab"), route: "/progress" },
  { label: t("routine.tab"), route: "/routine" },
  { label: t("favourites.title"), route: "/favourites" },
];

function Row({
  route,
  first = false,
  children,
}: {
  route: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(route as any)}
      className={cn("flex-row items-center gap-3 px-4 py-3 web:hover:bg-muted/60 active:bg-muted/60", !first && "border-t border-border")}
    >
      {children}
      <Text className="text-lg text-muted-foreground">›</Text>
    </Pressable>
  );
}

// Home: progress, today's routine and favourites in one card
export function MyPrayersCard() {
  const { t } = useTranslation();
  const tc = useContent();
  const log = useUserDataStore((state) => state.log);
  const favourites = useUserDataStore((state) => state.favourites);
  const entries = useRoutineStore((state) => state.entries);

  const daysPrayed = new Set([...log].map((id) => splitLogId(id).day));
  const streak = currentStreak(daysPrayed);
  const best = bestStreak(daysPrayed);
  const weekCount = lastSevenDays().filter((day) => daysPrayed.has(day)).length;

  const today = dayString();
  const todays = entriesForDay(entries).filter((entry) => describeItem(entry.key, t, tc));
  const doneToday = todays.filter((entry) => log.has(logId(today, entry.key))).length;

  const favouriteNames = favourites
    .map((key) => describeItem(key, t, tc)?.title)
    .filter(Boolean)
    .slice(0, 3)
    .join(" · ");

  return (
    <Card className="overflow-hidden">
      <Row route="/progress" first>
        <View className="h-12 w-12 items-center justify-center rounded-full border-4 border-primary/20">
          <Text className="text-xs font-bold text-primary">{weekCount}/7</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-primary">{t("progress.title")}</Text>
          <Text className="text-sm font-semibold text-card-foreground">
            {t("progress.streak")}: {streak}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {t("progress.bestStreak")}: {best} · {t("progress.thisWeek")}: {weekCount}/7
          </Text>
        </View>
      </Row>

      <Row route="/routine">
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-card-foreground">
            {entries.length ? t("routine.today") : t("routine.title")}
          </Text>
          {entries.length === 0 ? (
            <Text className="text-xs text-muted-foreground">{t("routine.promptShort")}</Text>
          ) : todays.length === 0 ? (
            <Text className="text-xs text-muted-foreground">{t("routine.restDay")}</Text>
          ) : (
            <>
              <Text className="text-xs text-muted-foreground">
                {doneToday} {t("progress.of")} {todays.length} {t("routine.prayed")}
              </Text>
              <View className="h-1.5 rounded-full bg-muted overflow-hidden">
                <View className="h-1.5 rounded-full bg-primary" style={{ width: `${(doneToday / todays.length) * 100}%` }} />
              </View>
            </>
          )}
        </View>
      </Row>

      <Row route="/favourites">
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold text-card-foreground">
            {t("favourites.title")}
            {favourites.length > 0 ? ` (${favourites.length})` : ""}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {favouriteNames || t("favourites.noneYet")}
          </Text>
        </View>
      </Row>
    </Card>
  );
}
