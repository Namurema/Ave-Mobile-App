import { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Card, CardTitle, CardDescription } from "../components/ui/card";
import { useAuthStore } from "../store/authStore";
import { useAuthDialog } from "../store/authDialogStore";
import { useLanguageStore } from "../store/LanguageStore";
import { languageInfo } from "../constants/languages";
import { PAYMENTS_ENABLED } from "../constants/features";

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const openAuth = useAuthDialog((state) => state.open);
  // Where the person was going before signing in (e.g. a shared prayer)
  const { next } = useLocalSearchParams<{ next?: string }>();
  const destination = next && next.startsWith("/") && !next.startsWith("/splash") ? next : "/(tabs)/home";
  const signIn = () => openAuth("signIn", destination);
  const createAccount = () => openAuth("signUp", destination);

  // Ave needs an account: signed in, go straight in
  useEffect(() => {
    if (!loading && session) router.replace(destination as any);
  }, [loading, session]);

  const features = [
    { title: t("splash.dailyTitle"), description: t("splash.dailyDescription") },
    { title: t("splash.rosaryTitle"), description: t("splash.rosaryDescription") },
    { title: t("splash.devotionsTitle"), description: t("splash.devotionsDescription") },
  ];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Top bar */}
      <View className="border-b border-border">
        <View className="w-full max-w-5xl self-center h-16 px-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold tracking-tight text-primary">Ave</Text>
          <View className="flex-row items-center gap-2">
            {!session && (
              <Button variant="outline" size="sm" onPress={signIn}>
                {t("auth.signIn")}
              </Button>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerClassName="flex-grow items-center justify-center px-4 py-12">
        <View className="w-full max-w-md">
          {/* Hero */}
          <Text className="text-4xl font-bold tracking-tight text-foreground text-center">
            {t("splash.headline")}
          </Text>
          <Text className="mt-4 text-base leading-7 text-muted-foreground text-center">
            {t("splash.description")}
          </Text>

          <Button size="lg" className="mt-8 w-full" onPress={createAccount}>
            {t("auth.createAccount")}
          </Button>
          <Button size="lg" variant="outline" className="mt-3 w-full" onPress={signIn}>
            {t("auth.signIn")}
          </Button>
          <Text className="mt-3 text-center text-sm text-muted-foreground">{t(PAYMENTS_ENABLED ? "splash.accountNote" : "splash.accountNoteFree")}</Text>

          {/* Choose the language before signing up */}
          <View className="mt-4 flex-row flex-wrap items-center justify-center gap-1">
            <Text className="text-sm text-muted-foreground">
              {t("settings.language")}: {languageInfo(language).name}
            </Text>
            <Pressable onPress={() => router.push("/Language")}>
              <Text className="text-sm font-semibold text-primary">{t("common.change")}</Text>
            </Pressable>
          </View>

          {/* What's inside */}
          <Card className="mt-10">
            {features.map((feature, index) => (
              <View
                key={feature.title}
                className={`flex-row items-start gap-3 p-4 ${
                  index < features.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <View className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                <View className="flex-1 gap-0.5">
                  <CardTitle className="text-sm">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      {/* Footer */}
      <Text className="py-6 text-center text-xs text-muted-foreground">{t("splash.footer")}</Text>
    </View>
  );
}
