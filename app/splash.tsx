import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, Linking, StyleSheet, Platform, useWindowDimensions } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useAuthDialog } from "../store/authDialogStore";
import { useLanguageStore } from "../store/LanguageStore";
import { LANGUAGES } from "../constants/languages";
import { images, dailyTiles } from "../constants/images";
import { CONTACT_EMAIL, TIKTOK_URL } from "../constants/site";
import { InstallDialog } from "../components/Popups";
import { describeItem } from "../lib/items";
import { useContent } from "../lib/i18n/content";
import { cn } from "../lib/utils";

// The landing page, at aveprayers.com and /splash: a card to start praying
// (no account needed) over the morning light, what's inside, and a footer of
// prayers that search engines can follow.
export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const { height } = useWindowDimensions();
  const scroll = useRef<ScrollView>(null);
  const [installing, setInstalling] = useState(false);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const openAuth = useAuthDialog((state) => state.open);
  // Where the person was going before signing in (e.g. a shared prayer)
  const { next } = useLocalSearchParams<{ next?: string }>();
  const destination = next && next.startsWith("/") && !next.startsWith("/splash") ? next : "/(tabs)/home";
  const go = (route: string) => router.push(route as any);
  const startPraying = () => go(destination);
  // Short phones: a tighter card so it fits on the first screen
  const short = height < 700;

  // Signed in: go straight in
  useEffect(() => {
    if (!loading && session) router.replace(destination as any);
  }, [loading, session]);

  const tiles = [
    { title: t("splash.dailyTitle"), text: t("splash.dailyDescription"), image: dailyTiles.morning, route: "/(tabs)/prayers" },
    { title: t("splash.rosaryTitle"), text: t("splash.rosaryDescription"), image: images.rosaryHands, route: "/(tabs)/rosary" },
    { title: t("splash.devotionsTitle"), text: t("splash.devotionsDescription"), image: images.novenasTile, route: "/novenas" },
    { title: t("nav.foryou"), text: t("splash.forYouDescription"), image: images.prayingHands, route: "/(tabs)/foryou" },
  ];

  // Footer: real prayers by name, so people and search engines can go straight to them
  const link = (key: string) => {
    const info = describeItem(key, t, tc);
    return info ? { label: info.title, route: info.route } : null;
  };
  const columns = [
    {
      title: t("splash.footerPray"),
      links: [link("daily:morning"), link("daily:midday"), link("daily:night"), link("rosary"), link("chaplet:1"), link("stations")],
    },
    {
      title: t("categories.novenas"),
      links: [link("novena:6"), link("novena:5"), link("novena:2"), link("novena:12"), link("novena:13"), { label: t("novenas.all"), route: "/novenas" }],
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <ScrollView ref={scroll} showsVerticalScrollIndicator={false}>
        {/* Screen 1: the card over the morning light */}
        <View style={{ minHeight: height }} className="overflow-hidden">
          <Image source={images.heroSunrise} resizeMode="cover" aria-hidden style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} />
          <View className="absolute inset-0 bg-white/10" />

          <View className="w-full max-w-6xl self-center px-4 md:px-8 h-16 md:h-20 flex-row items-center justify-between gap-3">
            <Text className="text-2xl font-black tracking-tight text-zinc-900">
              Ave<Text className="text-primary-light">.</Text>
            </Text>
            <View role="navigation" className="hidden md:flex flex-row items-center gap-6">
              {[
                { label: t("nav.prayers"), route: "/(tabs)/prayers" },
                { label: t("nav.rosary"), route: "/(tabs)/rosary" },
                { label: t("categories.novenas"), route: "/novenas" },
                { label: t("nav.foryou"), route: "/(tabs)/foryou" },
              ].map((item) => (
                <Pressable key={item.route} onPress={() => go(item.route)}>
                  <Text className="text-sm font-semibold text-zinc-900 web:hover:underline">{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable onPress={() => openAuth("signIn", destination)} className="h-10 px-3 justify-center rounded-full web:hover:bg-black/5">
                <Text className="text-sm font-semibold text-zinc-900">{t("auth.signIn")}</Text>
              </Pressable>
              <Pressable onPress={startPraying} className="h-10 px-4 justify-center rounded-full bg-zinc-950 web:hover:bg-zinc-800">
                <Text className="text-sm font-semibold text-white">{t("splash.startPraying")}</Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-1 items-center justify-center px-4 pb-8 pt-2">
            <View className={cn("w-full max-w-md items-center rounded-3xl bg-zinc-950/95 px-5 md:px-9 md:py-10", short ? "gap-2 py-5" : "gap-3 py-8")}>
              <Text role="heading" aria-level={1} className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {t("splash.headline")}
              </Text>
              <Text className="mb-3 text-center text-base leading-6 text-white/70">{t("splash.description")}</Text>

              <Pressable onPress={startPraying} className={cn("w-full items-center justify-center rounded-full bg-white web:hover:bg-zinc-200", short ? "h-12" : "h-14")}>
                <Text className="text-base font-bold text-zinc-950">{t("splash.startPraying")}</Text>
              </Pressable>
              <Pressable onPress={() => openAuth("signUp", destination)} className={cn("w-full items-center justify-center rounded-full bg-zinc-800 web:hover:bg-zinc-700", short ? "h-12" : "h-14")}>
                <Text className="text-base font-bold text-white">{t("splash.createFreeAccount")}</Text>
              </Pressable>
              <Text className="text-center text-sm text-white/60">{t("splash.accountNoteFree")}</Text>

              {/* Language, before anything else */}
              <View className={cn("w-full border-t border-white/15 gap-3 items-center", short ? "mt-1 pt-3" : "mt-3 pt-5")}>
                <Text className="text-xs font-semibold uppercase tracking-widest text-white/50">{t("splash.chooseLanguage")}</Text>
                <View role="radiogroup" aria-label={t("splash.chooseLanguage")} className="flex-row flex-wrap justify-center gap-2">
                  {LANGUAGES.map((option) => {
                    const active = option.code === language;
                    return (
                      <Pressable
                        key={option.code}
                        role="radio"
                        aria-checked={active}
                        onPress={() => setLanguage(option.code)}
                        className={cn("h-10 px-4 justify-center rounded-full border", active ? "bg-white border-white" : "border-white/25 web:hover:bg-white/10")}
                      >
                        <Text className={cn("text-sm font-semibold", active ? "text-zinc-950" : "text-white")}>{option.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Text className="mt-3 text-center text-xs leading-5 text-white/50">
                {t("splash.agreeByUsing")}{" "}
                <Text role="link" className="underline" onPress={() => go("/terms")}>
                  {t("legal.terms")}
                </Text>{" "}
                {t("auth.agreeAnd")}{" "}
                <Text role="link" className="underline" onPress={() => go("/privacy")}>
                  {t("legal.privacy")}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Screen 2: what's inside */}
        <View className="w-full max-w-6xl self-center px-4 md:px-8 py-8 md:py-10 gap-4 md:gap-5">
          <Text role="heading" aria-level={2} className="text-2xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {t("splash.insideTitle")}
          </Text>
          <View className="flex-row flex-wrap -m-1.5">
            {tiles.map((tile) => (
              <View key={tile.route} className="w-1/2 md:w-1/4 p-1.5">
                <Pressable onPress={() => go(tile.route)} className="aspect-square overflow-hidden rounded-2xl justify-end p-3 md:p-4 bg-zinc-800">
                  <Image source={tile.image} resizeMode="cover" aria-hidden style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} />
                  <View className="absolute inset-0 bg-black/45" />
                  <Text className="text-base md:text-lg font-bold text-white">{tile.title}</Text>
                  <Text numberOfLines={2} className="text-xs md:text-sm leading-4 md:leading-5 text-white/85">
                    {tile.text}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View role="contentinfo" className="bg-black px-5 md:px-8 pt-8 md:pt-10 pb-5">
          <View className="w-full max-w-6xl self-center gap-6 md:gap-8">
            <View className="gap-6 md:gap-8 md:flex-row">
              <View className="gap-1 md:w-56">
                <Text className="text-2xl font-black tracking-tight text-white">
                  Ave<Text className="text-primary-light">.</Text>
                </Text>
                <Text className="text-sm text-white/60">{t("splash.footer")}</Text>
              </View>

              <View className="flex-1 flex-row flex-wrap gap-y-6 md:gap-y-8">
                {columns.map((column) => (
                  <View key={column.title} className="w-1/2 md:w-1/3 gap-2 md:gap-2.5 pr-4">
                    <Text className="text-xs font-semibold uppercase tracking-widest text-white/50">{column.title}</Text>
                    {column.links.map((item) =>
                      item ? (
                        <Pressable key={item.route} role="link" onPress={() => go(item.route)}>
                          <Text className="text-sm leading-5 text-white web:hover:underline">{item.label}</Text>
                        </Pressable>
                      ) : null
                    )}
                  </View>
                ))}
                <View className="w-full md:w-1/3 gap-2 md:gap-2.5 pr-4">
                  <Text className="text-xs font-semibold uppercase tracking-widest text-white/50">Ave</Text>
                  <View className="flex-row flex-wrap gap-x-5 gap-y-2 md:flex-col md:gap-2.5">
                  <Pressable role="link" onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
                    <Text className="text-sm text-white web:hover:underline">{t("splash.contactUs")}</Text>
                  </Pressable>
                  <Pressable role="link" onPress={() => go("/privacy")}>
                    <Text className="text-sm text-white web:hover:underline">{t("legal.privacy")}</Text>
                  </Pressable>
                  <Pressable role="link" onPress={() => go("/terms")}>
                    <Text className="text-sm text-white web:hover:underline">{t("legal.terms")}</Text>
                  </Pressable>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-3 md:flex-col md:items-end">
                <Pressable role="link" aria-label="TikTok" onPress={() => Linking.openURL(TIKTOK_URL)} className="h-10 w-10 items-center justify-center rounded-full web:hover:bg-white/10">
                  <Ionicons name="logo-tiktok" size={22} color="#fff" />
                </Pressable>
                {Platform.OS === "web" && (
                  <Pressable onPress={() => setInstalling(true)} className="h-12 flex-row items-center gap-2 self-start rounded-full border border-white/60 px-5 web:hover:bg-white/10">
                    <Ionicons name="phone-portrait-outline" size={18} color="#fff" />
                    <Text className="text-sm font-semibold text-white">{t("splash.getApp")}</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <View className="flex-row items-center justify-between gap-4 border-t border-white/15 pt-5">
              <Text className="flex-1 text-xs text-white/50">© {new Date().getFullYear()} Ave</Text>
              <Pressable
                onPress={() => scroll.current?.scrollTo({ y: 0, animated: true })}
                aria-label={t("splash.backToTop")}
                className="h-10 w-10 items-center justify-center rounded-full border border-white/30 web:hover:bg-white/10"
              >
                <Ionicons name="arrow-up" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      {installing && <InstallDialog onClose={() => setInstalling(false)} />}
    </View>
  );
}
