import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUserDataStore } from "../store/userDataStore";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/LanguageStore";
import { useContent } from "../lib/i18n/content";
import { formatDate } from "../lib/i18n/helpers";
import { describeItem } from "../lib/items";
import { currentStreak, lastSevenDays, parseDay, splitLogId, dayString } from "../lib/progress";
import { Page, PageHeader, Section, ListCard, EmptyState } from "../components/ui/page";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const HISTORY_LIMIT = 30;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="p-1.5 w-1/3">
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
      <PageHeader title={t("progress.title")} description={t("progress.description")} />

      <View className="flex-row flex-wrap -m-1.5">
        <Stat label={t("progress.streak")} value={currentStreak(daysPrayed)} />
        <Stat label={t("progress.thisWeek")} value={`${prayedThisWeek}/7`} />
        <Stat label={t("progress.totalPrayers")} value={log.size} />
      </View>

      <Section title={t("progress.thisWeek")}>
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
          <Button size="sm" className="self-start" onPress={() => router.push("/auth/sign-in")}>
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
