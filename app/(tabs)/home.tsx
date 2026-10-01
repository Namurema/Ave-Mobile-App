import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import { getPrayersByCategory } from "../../lib/supabase/queries";
import Footer from "../../components/ui/Footer";
import { TopNav } from "../../components/ui/AppNav";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { InstallCard } from "../../components/InstallCard";
import { cn } from "../../lib/utils";

// Rosary mysteries by weekday, Sunday first
const MYSTERY_BY_DAY = ["glorious", "joyful", "sorrowful", "glorious", "luminous", "sorrowful", "joyful"];

// App language codes → locale codes the browser knows for dates
const DATE_LOCALES: Record<string, string> = { en: "en-GB", lg: "lg", rny: "nyn" };

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
          key={row.route}
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
  const [prayerOfDay, setPrayerOfDay] = useState<any>(null);
  const [prayerLoading, setPrayerLoading] = useState(true);

  const today = new Date();
  const mysteryKey = MYSTERY_BY_DAY[today.getDay()];
  const todaysMystery = t(`rosary.${mysteryKey}`);
  let dateLabel: string;
  try {
    dateLabel = today.toLocaleDateString(DATE_LOCALES[language] ?? "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    dateLabel = today.toDateString();
  }

  // A different morning/evening prayer each day
  useEffect(() => {
    getPrayersByCategory("morning-evening", "en")
      .then((prayers) => {
        if (prayers?.length) setPrayerOfDay(prayers[dayOfYear(today) % prayers.length]);
      })
      .catch(() => {})
      .finally(() => setPrayerLoading(false));
  }, []);

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

  const todayRows: LinkRow[] = [
    { title: "Today's mystery", value: todaysMystery.split(" ")[0], route: "/(tabs)/rosary" },
    { title: t("home.dailyPrayers"), value: "3", route: "/(tabs)/prayers" },
    { title: t("home.stationsOfCross"), value: "14", route: "/stations" },
  ];

  return (
    <View className="flex-1 bg-zinc-50">
      <StatusBar style="dark" />
      <TopNav />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-6xl self-center px-4 md:px-6 pt-6 pb-12 gap-4 lg:flex-row lg:items-start lg:gap-6">
          {/* Left sidebar */}
          <View className="gap-4 lg:w-64">
            <Card className="overflow-hidden">
              <View className="h-8 lg:h-14 bg-primary" />
              <View className="p-5 gap-1">
                <Text className="text-sm text-muted-foreground">{dateLabel}</Text>
                <Text className="text-xl font-bold tracking-tight text-card-foreground">
                  {t("home.greeting")}
                </Text>
                <View className="mt-2 flex-row items-center gap-1.5">
                  <Text className="text-sm text-muted-foreground">
                    Praying in {LANGUAGE_NAMES[language] ?? "English"}
                  </Text>
                  <Text className="text-sm text-muted-foreground">·</Text>
                  <Pressable onPress={() => router.push("/Language")}>
                    <Text className="text-sm font-semibold text-primary">Change</Text>
                  </Pressable>
                </View>
              </View>
            </Card>

            <View className="hidden lg:flex">
              <SidebarList title="Today" rows={todayRows} />
            </View>

            <InstallCard />
          </View>

          {/* Center feed */}
          <View className="gap-4 lg:flex-1 min-w-0">
            {/* Quick start, like a "start a post" box */}
            <Card className="p-4 gap-3">
              <Pressable
                onPress={() => router.push("/(tabs)/rosary")}
                className="h-12 justify-center rounded-full border border-input px-5 web:hover:bg-muted web:transition-colors"
              >
                <Text className="text-sm font-medium text-muted-foreground">
                  Pray today's Rosary: {todaysMystery}
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
                  Pray now
                </Button>
              </View>
            </Card>

            {/* Prayer of the day */}
            <Card className="overflow-hidden">
              <View className="px-5 py-3 border-b border-border">
                <Text className="text-sm font-medium text-muted-foreground">Prayer of the day</Text>
              </View>
              <View className="p-5 gap-3">
                {prayerLoading ? (
                  <Text className="text-sm text-muted-foreground">Loading…</Text>
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
                      <Text className="text-sm font-semibold text-primary">Read morning prayers</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text className="text-sm text-muted-foreground">
                    Connect to the internet to see today's prayer.
                  </Text>
                )}
              </View>
            </Card>
          </View>

          {/* Right sidebar */}
          <View className="gap-4 lg:w-80">
            <SidebarList
              title={t("home.spiritualPractice")}
              rows={devotions}
              footer={{ label: "Show all prayers", route: "/(tabs)/prayers" }}
            />

            <Card className={cn("p-5 border-l-4 border-l-primary")}>
              <Text className="text-base italic leading-7 text-card-foreground">
                "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures."
              </Text>
              <Text className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Psalm 23:1–2
              </Text>
            </Card>
          </View>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
}
