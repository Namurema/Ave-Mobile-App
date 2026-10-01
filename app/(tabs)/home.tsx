import { View, Text, ScrollView, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import Footer from "../../components/ui/Footer";
import { TopNav } from "../../components/ui/AppNav";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { cn } from "../../lib/utils";

// Rosary mysteries by weekday, Sunday first
const MYSTERY_BY_DAY = ["glorious", "joyful", "sorrowful", "glorious", "luminous", "sorrowful", "joyful"];

// App language codes → locale codes the browser knows for dates
const DATE_LOCALES: Record<string, string> = { en: "en-GB", lg: "lg", rny: "nyn" };

type Tile = { title: string; description: string; route: string };

function TileGrid({ tiles, columns }: { tiles: Tile[]; columns: string }) {
  const router = useRouter();
  return (
    <View className="flex-row flex-wrap -m-1.5">
      {tiles.map((tile) => (
        <View key={tile.route} className={cn("p-1.5", columns)}>
          <Pressable onPress={() => router.push(tile.route as any)} className="flex-1">
            <Card className="flex-1 p-4 md:p-5 gap-1 web:transition-colors web:hover:border-primary/40">
              <Text className="text-sm font-semibold text-card-foreground">{tile.title}</Text>
              <Text className="text-sm text-muted-foreground">{tile.description}</Text>
            </Card>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="mb-3 text-lg font-semibold tracking-tight text-foreground">{children}</Text>;
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const today = new Date();
  const todaysMystery = t(`rosary.${MYSTERY_BY_DAY[today.getDay()]}`);
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

  const dailyPrayers: Tile[] = [
    { title: t("prayers.morningPrayers"), description: t("prayers.startYourDay"), route: "/daily-prayer/morning" },
    { title: t("prayers.middayPrayers"), description: t("prayers.pauseForPeace"), route: "/daily-prayer/midday" },
    { title: t("prayers.nightPrayers"), description: t("prayers.gratitudeRest"), route: "/daily-prayer/night" },
  ];

  const devotions: Tile[] = [
    { title: t("home.novenas"), description: t("home.ninedays"), route: "/novenas" },
    { title: t("home.stationsOfCross"), description: t("home.meditatePassion"), route: "/stations" },
    { title: t("home.chaplets"), description: t("home.meditativePrayer"), route: "/chaplets" },
    { title: t("home.otherPrayers"), description: t("home.sacredLocations"), route: "/other-prayers" },
  ];

  return (
    <View className="flex-1 bg-zinc-50">
      <StatusBar style="dark" />
      <TopNav />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-5xl self-center px-4 md:px-6 pt-8 md:pt-10 pb-12 gap-8 md:gap-10">
          {/* Page heading */}
          <View className="gap-1">
            <Text className="text-sm font-medium text-muted-foreground">{dateLabel}</Text>
            <Text className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t("home.greeting")}
            </Text>
          </View>

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

          {/* Daily prayers */}
          <View>
            <SectionTitle>{t("home.dailyPrayers")}</SectionTitle>
            <TileGrid tiles={dailyPrayers} columns="w-full sm:w-1/3" />
          </View>

          {/* Devotions */}
          <View>
            <SectionTitle>{t("home.spiritualPractice")}</SectionTitle>
            <TileGrid tiles={devotions} columns="w-1/2 md:w-1/4" />
          </View>

          {/* Scripture */}
          <Card className="p-6 md:p-8 border-l-4 border-l-primary">
            <Text className="text-base md:text-lg italic leading-7 text-foreground">
              "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures."
            </Text>
            <Text className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Psalm 23:1–2
            </Text>
          </Card>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
}
