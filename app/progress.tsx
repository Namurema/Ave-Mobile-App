import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUserDataStore } from "../store/userDataStore";
import { useAuthStore } from "../store/authStore";
import { useAuthDialog } from "../store/authDialogStore";
import { useLanguageStore } from "../store/LanguageStore";
import { useContent } from "../lib/i18n/content";
import { formatDate } from "../lib/i18n/helpers";
import { describeItem } from "../lib/items";
import {
  currentStreak,
  bestStreak,
  nextMilestone,
  WEEKLY_GOAL,
  lastSevenDays,
  parseDay,
  splitLogId,
  dayString,
} from "../lib/progress";
import { Page, PageHeader, Section, ListCard, EmptyState } from "../components/ui/page";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { images } from "../constants/images";
import { myPrayersTabs } from "../components/MyPrayersCard";

const HISTORY_LIMIT = 30;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="p-1.5 w-1/2 md:w-1/4">
      <Card className="p-4 md:p-5 gap-1">
        <Text className="text-2xl md:text-3xl font-bold tracking-tight text-card-foreground">{value}</Text>
        <Text className="text-xs md:text-sm text-muted-foreground">{label}</Text>
      </Card>
    </View>
  );
}

export default function ProgressScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const { language } = useLanguageStore();
  const log = useUserDataStore((state) => state.log);
  const session = useAuthStore((state) => state.session);

  const { daysPrayed, history } = useMemo(() => {
    const entries = [...log].map(splitLogId);
    return {
      daysPrayed: new Set(entries.map((e) => e.day)),
      // Newest first
      history: entries.sort((a, b) => b.day.localeCompare(a.day)),
    };
  }, [log]);

  const week = lastSevenDays();
  const prayedThisWeek = week.filter((day) => daysPrayed.has(day)).length;
  const today = dayString();
  const streak = currentStreak(daysPrayed);
  const best = bestStreak(daysPrayed);
  const milestone = nextMilestone(streak);
  const goalDone = Math.min(prayedThisWeek, WEEKLY_GOAL);

  const historyItems = history
    .map((entry) => ({ entry, info: describeItem(entry.key, t, tc) }))
    .filter((item) => item.info)
    .slice(0, HISTORY_LIMIT)
    .map(({ entry, info }) => ({
      key: `${entry.day}|${entry.key}`,
      title: info!.title,
      description: formatDate(parseDay(entry.day), language),
      onPress: () => router.push(info!.route as any),
    }));

  return (
    <Page>
      <PageHeader back tone="primary" image={images.prayingHands} title={t("progress.myPrayers")} tabs={myPrayersTabs(t)} />

      <View className="flex-row flex-wrap -m-1.5">
        <Stat label={t("progress.streak")} value={streak} />
        <Stat label={t("progress.bestStreak")} value={best} />
        <Stat label={t("progress.thisWeek")} value={`${prayedThisWeek}/7`} />
        <Stat label={t("progress.totalPrayers")} value={log.size} />
      </View>

      {streak > 0 && (
        <Card className="p-4 gap-1 border-primary/30 bg-accent/30">
          <Text className="text-base font-semibold text-card-foreground">
            {milestone.reached
              ? `${t("progress.milestoneReached")}: ${streak} ${t("common.days")}`
              : `${t("progress.nextMilestone")}: ${milestone.target} ${t("common.days")}`}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {milestone.reached
              ? t("progress.milestoneKeepGoing")
              : `${milestone.remaining} ${t("progress.daysToGo")}`}
          </Text>
        </Card>
      )}

      <Section title={t("progress.thisWeek")}>
        <View className="gap-2 px-4 md:px-5 pt-4">
          <View className="flex-row justify-between">
            <Text className="text-sm font-medium text-card-foreground">{t("progress.weeklyGoal")}</Text>
            <Text className="text-sm font-semibold text-primary">
              {goalDone}/{WEEKLY_GOAL} {t("common.days")}
            </Text>
          </View>
          <View className="h-2 rounded-full bg-muted overflow-hidden">
            <View className="h-2 rounded-full bg-primary" style={{ width: `${(goalDone / WEEKLY_GOAL) * 100}%` }} />
          </View>
          {goalDone === WEEKLY_GOAL && (
            <Text className="text-sm text-primary">{t("progress.weeklyGoalDone")}</Text>
          )}
        </View>
        <View className="flex-row justify-between gap-1 p-4 md:p-5">
          {week.map((day) => {
            const prayed = daysPrayed.has(day);
            return (
              <View key={day} className="flex-1 items-center gap-1.5">
                <View
                  className={cn(
                    "h-9 w-9 md:h-10 md:w-10 rounded-full items-center justify-center",
                    prayed ? "bg-primary" : "bg-muted",
                    day === today && !prayed && "border border-primary"
                  )}
                >
                  <Text className={cn("text-sm font-semibold", prayed ? "text-primary-foreground" : "text-muted-foreground")}>
                    {parseDay(day).getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Section>

      {!session && (
        <Card className="p-4 gap-3">
          <Text className="text-sm leading-5 text-muted-foreground">{t("progress.signInToKeep")}</Text>
          <Button size="sm" className="self-start" onPress={() => useAuthDialog.getState().open("signIn")}>
            {t("auth.signIn")}
          </Button>
        </Card>
      )}

      {historyItems.length === 0 ? (
        <EmptyState title={t("progress.history")} description={t("progress.empty")} />
      ) : (
        <Section title={t("progress.history")} count={historyItems.length}>
          <ListCard items={historyItems} />
        </Section>
      )}
    </Page>
  );
}
