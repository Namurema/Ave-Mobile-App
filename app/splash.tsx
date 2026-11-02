import { useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useAuthDialog } from "../store/authDialogStore";
import { useLanguageStore } from "../store/LanguageStore";
import { LANGUAGES } from "../constants/languages";
import { PAYMENTS_ENABLED } from "../constants/features";
import { images, dailyTiles, dailyImages } from "../constants/images";
import { formatDate } from "../lib/i18n/helpers";
import { cn } from "../lib/utils";

// The landing page, at aveprayers.com and /splash. Three screens at most:
// the name and languages, what's inside, and an invitation to begin.
export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const openAuth = useAuthDialog((state) => state.open);
  // Where the person was going before signing in (e.g. a shared prayer)
  const { next } = useLocalSearchParams<{ next?: string }>();
  const destination = next && next.startsWith("/") && !next.startsWith("/splash") ? next : "/(tabs)/home";
  const signIn = () => openAuth("signIn", destination);
  const createAccount = (to: string = destination) => openAuth("signUp", to);

  // Ave needs an account: signed in, go straight in
  useEffect(() => {
    if (!loading && session) router.replace(destination as any);
  }, [loading, session]);

  const wordSize = Math.min(width * 0.36, height * 0.26, 240);
  const accountNote = t(PAYMENTS_ENABLED ? "splash.accountNote" : "splash.accountNoteFree");

  const tiles = [
    { title: t("splash.dailyTitle"), text: t("splash.dailyDescription"), image: dailyTiles.morning, route: "/(tabs)/prayers" },
    { title: t("splash.rosaryTitle"), text: t("splash.rosaryDescription"), image: images.rosaryHands, route: "/(tabs)/rosary" },
    { title: t("splash.devotionsTitle"), text: t("splash.devotionsDescription"), image: images.rosaryFern, route: "/novenas" },
    { title: t("nav.foryou"), text: t("splash.forYouDescription"), image: images.prayingHands, route: "/(tabs)/foryou" },
  ];
  const dock = [
    { label: t("nav.prayers"), route: "/(tabs)/prayers" },
    { label: t("nav.rosary"), route: "/(tabs)/rosary" },
    { label: t("categories.novenas"), route: "/novenas" },
    { label: t("nav.foryou"), route: "/(tabs)/foryou" },
  ];

  return (
    <View className="flex-1 bg-[#E8E8E8]">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Screen 1: the name and the languages, with the dark panel rising below */}
        <View style={{ minHeight: height }}>
          <View className="w-full max-w-6xl self-center px-4 md:px-8 h-16 md:h-20 flex-row items-center justify-between gap-3">
            <Text className="text-2xl font-black tracking-tight text-zinc-900">
              Ave<Text className="text-primary">.</Text>
            </Text>
            <View className="flex-row items-center gap-2">
              <Pressable onPress={signIn} className="h-10 px-3 justify-center rounded-lg web:hover:bg-black/5">
                <Text className="text-sm font-semibold text-zinc-900">{t("auth.signIn")}</Text>
              </Pressable>
              <Pressable onPress={() => createAccount()} className="h-10 px-4 justify-center rounded-lg bg-zinc-900 web:hover:bg-zinc-700">
                <Text className="text-sm font-semibold text-white">{t("auth.createAccount")}</Text>
              </Pressable>
            </View>
          </View>

          <View className="items-center px-4 pt-3 md:pt-6">
            <View className="flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <Text className="text-sm text-zinc-700">{t("splash.catholicPrayers")}</Text>
              <View className="rounded border border-zinc-400 px-2 py-0.5">
                <Text className="text-sm font-medium text-zinc-900">{formatDate(new Date(), language)}</Text>
              </View>
            </View>

            <Text
              role="heading"
              aria-level={1}
              className="font-black text-zinc-900"
              style={{ fontSize: wordSize, lineHeight: wordSize * 1.08, letterSpacing: -wordSize * 0.045 }}
            >
              Ave
            </Text>
            <Text className="text-center text-lg md:text-2xl font-semibold tracking-tight text-zinc-900">{t("splash.headline")}</Text>

            {/* Tap a language to switch to it */}
            <View role="radiogroup" aria-label={t("settings.language")} className="mt-4 max-w-3xl flex-row flex-wrap justify-center gap-x-4 gap-y-1">
              {LANGUAGES.map((option) => {
                const active = option.code === language;
                return (
                  <Pressable key={option.code} role="radio" aria-checked={active} onPress={() => setLanguage(option.code)} className="py-1.5">
                    <Text
                      className={cn(
                        "border-b-2 text-sm md:text-base font-semibold",
                        active ? "border-primary text-primary" : "border-zinc-400 text-zinc-800"
                      )}
                    >
                      {option.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* The top of the dark panel, with the floating menu */}
          <View className="mt-5 mx-2 md:mx-4 flex-1 min-h-[190px] overflow-hidden rounded-t-3xl bg-black justify-end items-center p-3 md:p-6">
            <Image source={width < 768 ? dailyTiles.midday : dailyImages.midday} resizeMode="cover" aria-hidden style={[StyleSheet.absoluteFill, { width: "100%", height: "100%", opacity: 0.7 }]} />
            <View className="flex-row items-stretch gap-1.5 rounded-2xl bg-zinc-900/95 p-1.5">
              <View className="w-12 items-center justify-center rounded-xl bg-zinc-800">
                <Text className="text-lg font-black text-white">A.</Text>
              </View>
              <View className="hidden md:flex flex-row gap-1.5 rounded-xl bg-zinc-700/70 p-1.5">
                {dock.map((item) => (
                  <Pressable
                    key={item.route}
                    onPress={() => createAccount(item.route)}
                    className="h-11 px-4 justify-center rounded-lg border border-white/15 web:hover:bg-white/10"
                  >
                    <Text className="text-sm font-medium text-zinc-100">{item.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={() => createAccount()} className="min-h-[56px] px-5 justify-center rounded-xl bg-white web:hover:bg-zinc-200">
                <Text className="text-sm font-bold text-zinc-900">{t("splash.startPraying")}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Screen 2: what's inside, on the same dark panel */}
        <View className="mx-2 md:mx-4 bg-black px-4 md:px-8 pt-8 pb-10">
          <View className="w-full max-w-6xl self-center gap-5">
            <Text role="heading" aria-level={2} className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              {t("splash.insideTitle")}
            </Text>
            <View className="flex-row flex-wrap -m-1.5">
              {tiles.map((tile) => (
                <View key={tile.route} className="w-1/2 lg:w-1/4 p-1.5">
                  <Pressable onPress={() => createAccount(tile.route)} className="aspect-square overflow-hidden rounded-2xl justify-end p-3 md:p-4 bg-zinc-800">
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
        </View>

        {/* Screen 3: begin */}
        <View className="mx-2 md:mx-4 mb-2 md:mb-4 rounded-b-3xl bg-primary px-5 md:px-8 py-12 md:py-20 items-center">
          <Text role="heading" aria-level={2} className="text-center text-4xl md:text-6xl font-bold tracking-tight text-white">
            {t("splash.beginTitle")}
          </Text>
          <Text className="mt-3 max-w-xl text-center text-base leading-6 text-white/90">{t("splash.description")}</Text>
          <Pressable onPress={() => createAccount()} className="mt-7 h-12 px-7 justify-center rounded-xl bg-white web:hover:bg-zinc-200">
            <Text className="text-base font-bold text-zinc-900">{t("auth.createAccount")}</Text>
          </Pressable>
          <Text className="mt-3 text-center text-sm text-white/85">{accountNote}</Text>
        </View>

        <View className="w-full max-w-6xl self-center px-5 pb-6 pt-3 flex-row flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Text className="text-xs text-zinc-600">{t("splash.footer")}</Text>
          <Pressable onPress={() => router.push("/privacy")}>
            <Text className="text-xs font-medium text-zinc-800 underline">{t("legal.privacy")}</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/terms")}>
            <Text className="text-xs font-medium text-zinc-800 underline">{t("legal.terms")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
