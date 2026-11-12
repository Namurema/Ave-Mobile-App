import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet, type LayoutChangeEvent } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import { getPrayersWithFallback } from "../../lib/supabase/queries";
import Footer from "../../components/ui/Footer";
import { TopNav } from "../../components/ui/AppNav";
import { Card } from "../../components/ui/card";
import { formatDate, greetingKeys } from "../../lib/i18n/helpers";
import { useContent } from "../../lib/i18n/content";
import { scripture } from "../../constants/content/scripture";
import { useAuthStore, displayName } from "../../store/authStore";
import { usePrayedToday } from "../../store/userDataStore";
import { cn } from "../../lib/utils";
import { art, novenaImage } from "../../constants/images";
import { useSeasonNovenas, novenaCardText } from "../../components/NovenaSeason";
import { TrialNotice } from "../../components/AccessGate";
import { HomePopups } from "../../components/Popups";
import { itemKey } from "../../lib/items";
import { MOODS, loadMood, shareCard, type FeedCard } from "../../lib/foryou";

// Home, in the style of the big prayer apps: a featured carousel on navy,
// shortcuts, a verse of the day to share, the prayer of the day and more ways
// to pray, each with its illustration.

// Rosary mysteries by weekday, Sunday first
const MYSTERY_BY_DAY = ["glorious", "joyful", "sorrowful", "glorious", "luminous", "sorrowful", "joyful"];
const NAVY = "#0B1E5B";

function dayOfYear(date: Date) {
  return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
}

type Slide = { key: string; image: any; label: string; title: string; subtitle: string; action: string; route: string };

// Swipe sideways through featured prayers; dots show where you are
function FeaturedCarousel({ slides }: { slides: Slide[] }) {
  const router = useRouter();
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const imageHeight = Math.min(width * 0.72, 420);

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={100}
          onScroll={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
        >
          {slides.map((slide) => (
            <View key={slide.key} style={{ width }}>
              <View style={{ height: imageHeight }} className="overflow-hidden">
                <Image source={slide.image} resizeMode="cover" aria-hidden style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} />
                {/* Fades into the navy below (CSS in public/index.html) */}
                <View {...({ dataSet: { tint: "fade" } } as any)} className="absolute inset-0" />
                <View className="absolute bottom-6 left-0 right-0 items-center">
                  <Pressable
                    onPress={() => router.push(slide.route as any)}
                    className="h-14 min-w-[200px] items-center justify-center rounded-full bg-white px-8 web:hover:bg-zinc-200"
                  >
                    <Text className="text-lg font-bold text-zinc-950">{slide.action}</Text>
                  </Pressable>
                </View>
              </View>
              <View className="gap-2 px-5 pt-4">
                <View className="self-start rounded-md bg-white/15 px-2.5 py-1">
                  <Text className="text-sm font-medium text-white/90">{slide.label}</Text>
                </View>
                <Text numberOfLines={2} className="text-3xl font-extrabold tracking-tight text-white">
                  {slide.title}
                </Text>
                <Text numberOfLines={2} className="text-base text-white/75">
                  {slide.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <View className="flex-row justify-center gap-2 pt-5 pb-6">
        {slides.map((slide, i) => (
          <View key={slide.key} className={cn("h-2 w-2 rounded-full", i === index ? "bg-white" : "bg-white/35")} />
        ))}
      </View>
    </View>
  );
}

// Round icon button in the header
function HeaderButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} aria-label={label} className="h-12 w-12 items-center justify-center rounded-full bg-white/15 web:hover:bg-white/25">
      <Ionicons name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

// A verse of the day from the For You cards (exact Bible text), to share
function VerseOfTheDay({ day }: { day: number }) {
  const { t } = useTranslation();
  const tc = useContent();
  const language = useLanguageStore((state) => state.language);
  const [verse, setVerse] = useState<FeedCard | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const mood = MOODS[day % MOODS.length];
    loadMood(language, mood)
      .then((file) => setVerse(file.verses[day % file.verses.length]))
      .catch(() => setVerse({ id: "home", text: tc(scripture.home.body), ref: tc(scripture.home.reference) }));
  }, [language, day]);

  if (!verse) return null;
  const share = async () => {
    if ((await shareCard(verse)) === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View className="items-center gap-4 px-2 py-6">
      <Text className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        {t("home.verseOfTheDay")} · {verse.ref}
      </Text>
      <Text className="text-center font-serif text-2xl leading-9 text-foreground">“{verse.text}”</Text>
      <Pressable onPress={share} className="items-center gap-1.5">
        <View className="h-14 w-14 items-center justify-center rounded-full border border-border web:hover:bg-muted">
          <Ionicons name="share-outline" size={24} color="#FAFAFA" />
        </View>
        <Text className="text-sm text-muted-foreground">{copied ? t("foryou.copied") : t("home.shareVerse")}</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
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
  const day = dayOfYear(now);
  const [prayerOfDay, setPrayerOfDay] = useState<any>(null);
  const [prayerLoading, setPrayerLoading] = useState(true);

  // A different morning/evening prayer each day
  useEffect(() => {
    getPrayersWithFallback("morning-evening", language)
      .then(({ prayers }) => {
        if (prayers?.length) setPrayerOfDay(prayers[day % prayers.length]);
      })
      .catch(() => {})
      .finally(() => setPrayerLoading(false));
  }, [language]);

  // The daily prayer for this time of day
  const hour = now.getHours();
  const daily = hour < 12 ? "morning" : hour < 17 ? "midday" : "night";
  const dailyTitle = t(`prayers.${daily}Prayers`);

  // The novena running now, or the next one
  const [novenaItem] = useSeasonNovenas();
  const novenaPrayedToday = usePrayedToday(itemKey.novena(novenaItem?.novena.id ?? ""));
  const novenaText = novenaItem ? novenaCardText(novenaItem.season, novenaItem.done, novenaPrayedToday, t, language) : null;

  const slides: Slide[] = [
    {
      key: "rosary",
      image: art.rosary,
      label: `${t("home.featuredDaily")} · ${t("rosary.title")}`,
      title: t(`rosary.${MYSTERY_BY_DAY[now.getDay()]}`),
      subtitle: t("rosary.focusVirtues"),
      action: t("home.prayNow"),
      route: "/(tabs)/rosary",
    },
    {
      key: "daily",
      image: art[daily],
      label: t("home.dailyPrayers"),
      title: dailyTitle,
      subtitle: t(greeting.subtitle),
      action: t("home.prayNow"),
      route: `/daily-prayer/${daily}`,
    },
    ...(novenaItem && novenaText
      ? [
          {
            key: "novena",
            image: novenaImage(novenaItem.novena.id),
            label: novenaText.eyebrow,
            title: tc(novenaItem.novena.title),
            subtitle: novenaText.status,
            action: novenaText.action,
            route: `/novena/${novenaItem.novena.id}`,
          },
        ]
      : []),
    {
      key: "foryou",
      image: art.forYou,
      label: t("nav.foryou"),
      title: t("foryou.pickTitle"),
      subtitle: t("splash.forYouDescription"),
      action: t("seasons.open"),
      route: "/(tabs)/foryou",
    },
  ];

  const shortcuts: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
    { label: t("favourites.title"), icon: "star-outline", route: "/favourites" },
    { label: t("nav.foryou"), icon: "heart-outline", route: "/(tabs)/foryou" },
    { label: t("me.routine"), icon: "calendar-outline", route: "/routine" },
    { label: t("home.recents"), icon: "time-outline", route: "/progress" },
  ];

  const moreWays = [
    { title: t("home.novenas"), text: t("home.ninedays"), image: art.stJude, route: "/novenas" },
    { title: t("home.stationsOfCross"), text: t("home.meditatePassion"), image: art.stations, route: "/stations" },
    { title: t("home.chaplets"), text: t("home.meditativePrayer"), image: art.divineMercy, route: "/chaplets" },
    { title: t("home.otherPrayers"), text: t("home.sacredLocations"), image: art.maryChild, route: "/other-prayers" },
  ];

  return (
    <View className="flex-1 bg-background">
      <Head>
        <title>Ave: Catholic Prayers in English, Luganda and Runyankore</title>
      </Head>
      <StatusBar style="light" />
      <TopNav />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Navy top: greeting and the featured carousel */}
        <View style={{ backgroundColor: NAVY }}>
          <View className="w-full max-w-3xl self-center">
            <View className="flex-row items-center gap-3 px-5 pt-5 pb-4">
              <View className="flex-1 gap-0.5">
                <Text className="text-sm text-white/70">{formatDate(now, language)}</Text>
                <Text numberOfLines={2} className="text-4xl font-extrabold tracking-tight text-white">
                  {name ? `${t(greeting.title)}, ${name}` : t(greeting.title)}
                </Text>
              </View>
              <HeaderButton icon="notifications-outline" label={t("home.reminders")} onPress={() => router.push("/routine")} />
              <HeaderButton icon="settings-outline" label={t("nav.settings")} onPress={() => router.push("/settings")} />
            </View>
            <FeaturedCarousel slides={slides} />
          </View>
        </View>

        <View className="w-full max-w-3xl self-center px-4 md:px-6 pt-6 pb-12 gap-6">
          {/* Shortcuts */}
          <View className="flex-row gap-2.5">
            {shortcuts.map((item) => (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route as any)}
                className="flex-1 items-center justify-center gap-2 rounded-2xl bg-card py-4 web:hover:bg-muted"
              >
                <Ionicons name={item.icon} size={26} color="#FAFAFA" />
                <Text numberOfLines={1} className="px-1 text-sm font-semibold text-foreground">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <TrialNotice />
          <HomePopups />

          <VerseOfTheDay day={day} />

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
                  <Text className="text-lg font-semibold tracking-tight text-card-foreground">{prayerOfDay.title}</Text>
                  <Text numberOfLines={6} className="text-base leading-7 text-foreground">
                    {prayerOfDay.body}
                  </Text>
                  <Pressable onPress={() => router.push("/daily-prayer/morning")} className="self-start">
                    <Text className="text-sm font-semibold text-primary-light">{t("home.readMorningPrayers")}</Text>
                  </Pressable>
                </>
              ) : (
                <Text className="text-sm text-muted-foreground">{t("home.prayerOffline")}</Text>
              )}
            </View>
          </Card>

          {/* More ways to pray */}
          <View className="gap-3">
            <Text role="heading" aria-level={2} className="text-2xl font-extrabold tracking-tight text-foreground">
              {t("home.moreWays")}
            </Text>
            <View className="flex-row flex-wrap -m-1.5">
              {moreWays.map((item) => (
                <View key={item.route} className="w-1/2 p-1.5">
                  <Pressable onPress={() => router.push(item.route as any)}>
                    <View className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                      <Image source={item.image} resizeMode="cover" aria-hidden style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} />
                    </View>
                    <Text numberOfLines={1} className="mt-2 text-base font-bold text-foreground">
                      {item.title}
                    </Text>
                    <Text numberOfLines={1} className="text-sm text-muted-foreground">
                      {item.text}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
}
