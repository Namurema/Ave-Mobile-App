import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import { getPrayersWithFallback } from "../../lib/supabase/queries";
import Footer from "../../components/ui/Footer";
import { TopNav } from "../../components/ui/AppNav";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { formatDate, greetingKeys } from "../../lib/i18n/helpers";
import { useContent } from "../../lib/i18n/content";
import { scripture } from "../../constants/content/scripture";
import { useAuthStore, displayName } from "../../store/authStore";
import { useUserDataStore } from "../../store/userDataStore";
import { currentStreak, lastSevenDays, splitLogId } from "../../lib/progress";
import { describeItem } from "../../lib/items";
import { cn } from "../../lib/utils";

// Rosary mysteries by weekday, Sunday first
const MYSTERY_BY_DAY = ["glorious", "joyful", "sorrowful", "glorious", "luminous", "sorrowful", "joyful"];

const LANGUAGE_NAMES: Record<string, string> = { en: "English", lg: "Oluganda", rny: "Orunyankore" };

type LinkRow = { title: string; description?: string; value?: string; route: string };

function dayOfYear(date: Date) {
  return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
}

// Sidebar list in the style of a "Today's puzzles" card: title, rows, footer link
function SidebarList({
  title,
  rows,
  footer,
}: {
  title: string;
  rows: LinkRow[];
  footer?: { label: string; route: string };
}) {
  const router = useRouter();
  return (
    <Card className="py-4">
      <Text className="px-5 pb-2 text-lg font-semibold tracking-tight text-card-foreground">{title}</Text>
      {rows.map((row) => (
        <Pressable
          key={row.title}
          onPress={() => router.push(row.route as any)}
          className="flex-row items-center gap-3 px-5 py-2.5 web:hover:bg-muted/60 web:transition-colors"
        >
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-card-foreground">{row.title}</Text>
            {row.description ? (
              <Text className="text-sm text-muted-foreground">{row.description}</Text>
            ) : null}
          </View>
          {row.value ? (
            <Text className="text-sm font-semibold text-primary">{row.value}</Text>
          ) : (
            <Text className="text-lg text-muted-foreground">›</Text>
          )}
        </Pressable>
      ))}
      {footer ? (
        <Pressable
          onPress={() => router.push(footer.route as any)}
          className="mx-3 mt-1 self-start rounded-md px-2 py-1.5 web:hover:bg-muted"
        >
          <Text className="text-sm font-semibold text-muted-foreground">{footer.label}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const user = useAuthStore((state) => state.user);
  const name = displayName(user);
  // Re-check the time every minute so the greeting changes while the app is open
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const greeting = greetingKeys(now);
  const log = useUserDataStore((state) => state.log);
  const favourites = useUserDataStore((state) => state.favourites);
  const [prayerOfDay, setPrayerOfDay] = useState<any>(null);
  const [prayerLoading, setPrayerLoading] = useState(true);

  const today = new Date();
  const mysteryKey = MYSTERY_BY_DAY[today.getDay()];
  const todaysMystery = t(`rosary.${mysteryKey}`);
  const dateLabel = formatDate(today, language);
  const tc = useContent();

  // A different morning/evening prayer each day
  useEffect(() => {
    getPrayersWithFallback("morning-evening", language)
      .then(({ prayers }) => {
        if (prayers?.length) setPrayerOfDay(prayers[dayOfYear(today) % prayers.length]);
      })
      .catch(() => {})
      .finally(() => setPrayerLoading(false));
  }, [language]);

  const dailyPrayers = [
    { title: t("prayers.morningPrayers"), route: "/daily-prayer/morning" },
    { title: t("prayers.middayPrayers"), route: "/daily-prayer/midday" },
    { title: t("prayers.nightPrayers"), route: "/daily-prayer/night" },
  ];

  const devotions: LinkRow[] = [
    { title: t("home.novenas"), description: t("home.ninedays"), route: "/novenas" },
    { title: t("home.stationsOfCross"), description: t("home.meditatePassion"), route: "/stations" },
    { title: t("home.chaplets"), description: t("home.meditativePrayer"), route: "/chaplets" },
    { title: t("home.otherPrayers"), description: t("home.sacredLocations"), route: "/other-prayers" },
  ];

  const daysPrayed = new Set([...log].map((id) => splitLogId(id).day));
  const streak = currentStreak(daysPrayed);
  const weekCount = lastSevenDays().filter((day) => daysPrayed.has(day)).length;
  const progressRows: LinkRow[] = [
    { title: t("progress.streak"), value: String(streak), route: "/progress" },
    { title: t("progress.thisWeek"), value: `${weekCount}/7`, route: "/progress" },
  ];

  const favouriteRows: LinkRow[] = favourites
    .map((key) => describeItem(key, t, tc))
    .filter((info): info is NonNullable<typeof info> => !!info)
    .slice(0, 4)
    .map((info) => ({ title: info.title, description: info.kind, route: info.route }));

  return (
    <View className="flex-1 bg-zinc-50">
      <Head>
        <title>Ave: Catholic Prayers in English, Luganda and Runyankore</title>
      </Head>
      <StatusBar style="dark" />
      <TopNav />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-6xl self-center px-4 md:px-6 pt-6 pb-12 gap-4 lg:flex-row lg:items-start lg:gap-6">
          {/* Back, on phones only: to the previous screen, or the welcome screen */}
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/splash"))}
            className="md:hidden self-start -ml-2 -mb-1 h-9 px-2 rounded-md justify-center active:bg-muted"
          >
            <Text className="text-sm font-medium text-muted-foreground">← {t("common.back")}</Text>
          </Pressable>

          {/* Left sidebar */}
          <View className="gap-4 lg:w-64">
            {/* Phones: greeting straight on the page, not in a card */}
            <View className="lg:hidden gap-1 pt-1">
              <Text className="text-sm text-muted-foreground">{dateLabel}</Text>
              <Text className="text-2xl font-bold tracking-tight text-foreground">
                {name ? `${t(greeting.title)}, ${name}` : t(greeting.title)}
              </Text>
              <Text className="text-sm text-muted-foreground">{t(greeting.subtitle)}</Text>
            </View>

            <Card className="hidden lg:flex overflow-hidden">
              <View className="h-8 lg:h-14 bg-primary" />
              <View className="p-5 gap-1">
                <Text className="text-sm text-muted-foreground">{dateLabel}</Text>
                <Text className="text-xl font-bold tracking-tight text-card-foreground">
                  {name ? `${t(greeting.title)}, ${name}` : t(greeting.title)}
                </Text>
                <View className="mt-2 flex-row items-center gap-1.5">
                  <Text className="text-sm text-muted-foreground">
                    {t("home.prayingIn")} {LANGUAGE_NAMES[language] ?? "English"}
                  </Text>
                  <Text className="text-sm text-muted-foreground">·</Text>
                  <Pressable onPress={() => router.push("/Language")}>
                    <Text className="text-sm font-semibold text-primary">{t("common.change")}</Text>
                  </Pressable>
                </View>
              </View>
            </Card>

            <View className="hidden lg:flex">
              <SidebarList
                title={t("progress.title")}
                rows={progressRows}
                footer={{ label: t("progress.viewProgress"), route: "/progress" }}
              />
            </View>

          </View>

          {/* Center feed */}
          <View className="gap-4 lg:flex-1 min-w-0">
            {/* Quick start, like a "start a post" box (wide screens; phones get
                the daily prayers below the Rosary card instead) */}
            <Card className="hidden lg:flex p-4 gap-3">
              <Pressable
                onPress={() => router.push("/(tabs)/rosary")}
                className="hidden lg:flex h-12 justify-center rounded-full border border-input px-5 web:hover:bg-muted web:transition-colors"
              >
                <Text className="text-sm font-medium text-muted-foreground">
                  {t("home.prayTodaysRosary")}: {todaysMystery}
                </Text>
              </Pressable>
              <View className="flex-row">
                {dailyPrayers.map((prayer) => (
                  <Pressable
                    key={prayer.route}
                    onPress={() => router.push(prayer.route as any)}
                    className="flex-1 items-center rounded-md px-2 py-2.5 web:hover:bg-muted web:transition-colors"
                  >
                    <Text className="text-sm font-semibold text-foreground text-center">{prayer.title}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            {/* Today's Rosary */}
            <Card className="bg-primary border-primary">
              <View className="p-6 md:p-8 gap-5 md:flex-row md:items-center md:justify-between">
                <View className="gap-1.5 md:flex-1">
                  <Text className="text-xs font-semibold uppercase tracking-widest text-accent">
                    {t("home.featuredDaily")} · {t("rosary.title")}
                  </Text>
                  <Text className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    {todaysMystery}
                  </Text>
                  <Text className="text-sm text-white/80">{t("rosary.focusVirtues")}</Text>
                </View>
                <Button
                  size="lg"
                  onPress={() => router.push("/(tabs)/rosary")}
                  className="self-start md:self-auto bg-white web:hover:bg-white/90"
                  textClassName="text-primary"
                >
                  {t("home.prayNow")}
                </Button>
              </View>
            </Card>

            {/* Progress and favourites in one card, below the Rosary card (phones) */}
            <Card className="lg:hidden overflow-hidden">
              <Pressable
                onPress={() => router.push("/progress")}
                className="flex-row items-center gap-4 p-4 active:bg-muted/60"
              >
                <View className="h-14 w-14 items-center justify-center rounded-full border-4 border-primary/20">
                  <Text className="text-sm font-bold text-primary">{weekCount}/7</Text>
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {t("progress.title")}
                  </Text>
                  <Text className="text-base font-semibold text-card-foreground">
                    {t("progress.streak")}: {streak}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {t("progress.thisWeek")}: {weekCount}/7
                  </Text>
                </View>
                <View className="rounded-full bg-primary/10 px-3 py-2">
                  <Text className="text-sm font-semibold text-primary">{t("progress.viewProgress")}</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => router.push("/favourites")}
                className="flex-row items-center gap-3 border-t border-border px-4 py-3 active:bg-muted/60"
              >
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-card-foreground">
                    {t("favourites.title")}
                    {favourites.length > 0 ? ` (${favourites.length})` : ""}
                  </Text>
                  <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                    {favouriteRows.length > 0
                      ? favouriteRows.map((row) => row.title).join(" · ")
                      : t("favourites.noneYet")}
                  </Text>
                </View>
                <Text className="text-lg text-muted-foreground">›</Text>
              </Pressable>
            </Card>

            {/* Daily prayers, below the progress card (phones) */}
            <Card className="lg:hidden overflow-hidden">
              <Text className="px-4 pt-4 pb-1 text-base font-semibold text-card-foreground">
                {t("home.dailyPrayers")}
              </Text>
              <View className="flex-row px-2 pb-2">
                {dailyPrayers.map((prayer) => (
                  <Pressable
                    key={prayer.route}
                    onPress={() => router.push(prayer.route as any)}
                    className="flex-1 items-center rounded-md px-2 py-3 active:bg-muted"
                  >
                    <Text className="text-sm font-semibold text-primary text-center">{prayer.title}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            {/* Prayer of the day */}
            <Card className="overflow-hidden">
              <View className="px-5 py-3 border-b border-border">
                <Text className="text-sm font-medium text-muted-foreground">{t("home.prayerOfTheDay")}</Text>
              </View>
              <View className="p-5 gap-3">
                {prayerLoading ? (
                  <Text className="text-sm text-muted-foreground">{t("common.loading")}</Text>
                ) : prayerOfDay ? (
                  <>
                    <Text className="text-lg font-semibold tracking-tight text-card-foreground">
                      {prayerOfDay.title}
                    </Text>
                    <Text numberOfLines={6} className="text-base leading-7 text-foreground">
                      {prayerOfDay.body}
                    </Text>
                    <Pressable
                      onPress={() => router.push("/daily-prayer/morning")}
                      className="self-start"
                    >
                      <Text className="text-sm font-semibold text-primary">{t("home.readMorningPrayers")}</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text className="text-sm text-muted-foreground">
                    {t("home.prayerOffline")}
                  </Text>
                )}
              </View>
            </Card>
          </View>

          {/* Right sidebar */}
          <View className="gap-4 lg:w-80">
            {favouriteRows.length > 0 && (
              <View className="hidden lg:flex">
                <SidebarList
                  title={t("favourites.title")}
                  rows={favouriteRows}
                  footer={{ label: t("favourites.viewAll"), route: "/favourites" }}
                />
              </View>
            )}

            <SidebarList
              title={t("home.spiritualPractice")}
              rows={devotions}
              footer={{ label: t("home.showAllPrayers"), route: "/(tabs)/prayers" }}
            />

            <Card className={cn("p-5 border-l-4 border-l-primary")}>
              <Text className="text-base italic leading-7 text-card-foreground">
                {tc(scripture.home.body)}
              </Text>
              <Text className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {tc(scripture.home.reference)}
              </Text>
            </Card>
          </View>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
}
