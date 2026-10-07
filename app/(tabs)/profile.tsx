import { View, Text, Platform } from "react-native";
import { InstallCard } from "../../components/InstallCard";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAuthStore, displayName } from "../../store/authStore";
import { useAuthDialog } from "../../store/authDialogStore";
import { useUserDataStore } from "../../store/userDataStore";
import { currentStreak, splitLogId } from "../../lib/progress";
import { useLanguageStore } from "../../store/LanguageStore";
import { LOGIN_ENABLED } from "../../constants/features";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Page, PageHeader, Section, ListCard } from "../../components/ui/page";

const languageLabels: Record<string, string> = {
  en: "English",
  lg: "Oluganda",
  rny: "Orunyankore",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, session, signOut, isAdmin } = useAuthStore();
  const { language } = useLanguageStore();
  const [signingOut, setSigningOut] = useState(false);
  const openAuth = useAuthDialog((state) => state.open);
  const log = useUserDataStore((state) => state.log);
  const favouriteCount = useUserDataStore((state) => state.favourites.length);
  const streak = currentStreak(new Set([...log].map((id) => splitLogId(id).day)));

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  const isSignedIn = !!session;

  return (
    <Page sidebar={false}>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />

      <Section title={t("settings.activity")}>
        <ListCard
          items={[
            {
              key: "progress",
              title: t("progress.title"),
              description: `${t("progress.streak")}: ${streak}`,
              onPress: () => router.push("/progress"),
            },
            {
              key: "favourites",
              title: t("favourites.title"),
              description: `${favouriteCount}`,
              onPress: () => router.push("/favourites"),
            },
          ]}
        />
      </Section>

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
          {isSignedIn ? (
            <Card className="p-4 flex-row items-center gap-3">
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-card-foreground">{displayName(user)}</Text>
                <Text className="text-sm text-muted-foreground">{user?.email}</Text>
              </View>
              <Button variant="outline" size="sm" loading={signingOut} onPress={handleSignOut}>
                {t("common.signOut")}
              </Button>
            </Card>
          ) : (
            <Card className="p-4 gap-3">
              <Text className="text-sm leading-6 text-muted-foreground">{t("settings.signInToSync")}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Button size="sm" onPress={() => openAuth("signIn")}>
                  {t("auth.signIn")}
                </Button>
                <Button variant="outline" size="sm" onPress={() => openAuth("signUp")}>
                  {t("auth.createAccount")}
                </Button>
              </View>
            </Card>
          )}
        </Section>
      )}

      {isAdmin && (
        <Section title="Admin">
          <Card className="p-4 flex-row items-center gap-3">
            <Text className="flex-1 text-sm text-muted-foreground">See the accounts that have signed up.</Text>
            <Button variant="outline" size="sm" onPress={() => router.push("/admin")}>
              View accounts
            </Button>
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
