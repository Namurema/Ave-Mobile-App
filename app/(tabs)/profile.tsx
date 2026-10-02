import { View, Text, ActivityIndicator, Platform } from "react-native";
import { InstallCard } from "../../components/InstallCard";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/LanguageStore";
import { LOGIN_ENABLED } from "../../constants/features";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Page, PageHeader, Section } from "../../components/ui/page";

const languageLabels: Record<string, string> = {
  en: "English",
  lg: "Oluganda",
  rny: "Orunyankore",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, session, signIn, signOut, loadSession } = useAuthStore();
  const { language } = useLanguageStore();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (LOGIN_ENABLED) loadSession();
  }, []);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setSigningIn(false);
    }
  };

  const isSignedIn = !!session;
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? t("settings.guestUser");

  return (
    <Page sidebar={false}>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />

      <Section title={t("settings.language")}>
        <Card className="p-4 flex-row items-center gap-3">
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-card-foreground">
              {languageLabels[language] ?? "English"}
            </Text>
            <Text className="text-sm text-muted-foreground">{t("settings.languageHint")}</Text>
          </View>
          <Button variant="outline" size="sm" onPress={() => router.push("/Language")}>
            {t("common.change")}
          </Button>
        </Card>
      </Section>

      {LOGIN_ENABLED && (
        <Section title={t("settings.account")}>
          <Card className="p-4 flex-row items-center gap-3">
            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-semibold text-card-foreground">
                {isSignedIn ? displayName : t("settings.guestUser")}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {isSignedIn ? user?.email : t("settings.signInToSync")}
              </Text>
            </View>
            {isSignedIn ? (
              <Button variant="outline" size="sm" onPress={signOut}>
                {t("common.signOut")}
              </Button>
            ) : signingIn ? (
              <ActivityIndicator color="#007C7C" />
            ) : (
              <Button size="sm" onPress={handleSignIn}>
                {t("settings.signInWithGoogle")}
              </Button>
            )}
          </Card>
        </Section>
      )}

      {Platform.OS === "web" && (
        <Section title={t("settings.app")}>
          <InstallCard dismissible={false} />
        </Section>
      )}

      <Section title={t("settings.about")}>
        <Card className="p-4 gap-1">
          <Text className="text-sm font-semibold text-card-foreground">Ave</Text>
          <Text className="text-sm leading-6 text-muted-foreground">
            {t("settings.aboutText")}
          </Text>
          <Text className="mt-2 text-xs text-muted-foreground">{t("settings.version")} 1.0.0</Text>
        </Card>
      </Section>
    </Page>
  );
}
