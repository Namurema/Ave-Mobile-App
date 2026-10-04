import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Card, CardTitle, CardDescription } from "../components/ui/card";
import { useAuthStore } from "../store/authStore";
import { useAuthDialog } from "../store/authDialogStore";

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const getStarted = () => router.push("/Language");
  const session = useAuthStore((state) => state.session);
  const openAuth = useAuthDialog((state) => state.open);
  // After signing in from here, go straight into the app
  const signIn = () => openAuth("signIn", "/(tabs)/home");

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
            <Button variant="ghost" size="sm" onPress={getStarted}>
              {t("nav.openApp")}
            </Button>
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

          <Button size="lg" className="mt-8 w-full" onPress={getStarted}>
            {t("common.getStarted")}
          </Button>

          {!session && (
            <View className="mt-4 flex-row flex-wrap items-center justify-center gap-1">
              <Text className="text-sm text-muted-foreground">{t("auth.haveAccount")}</Text>
              <Pressable onPress={signIn}>
                <Text className="text-sm font-semibold text-primary">{t("auth.signIn")}</Text>
              </Pressable>
            </View>
          )}

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
