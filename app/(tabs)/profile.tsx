import { View, Text, ActivityIndicator, Platform } from "react-native";
import { InstallCard } from "../../components/InstallCard";
import { useRouter } from "expo-router";
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
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "Guest User";

  return (
    <Page sidebar={false}>
      <PageHeader title="Settings" description="Personalise how you use Ave." />

      <Section title="Language">
        <Card className="p-4 flex-row items-center gap-3">
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-card-foreground">
              {languageLabels[language] ?? "English"}
            </Text>
            <Text className="text-sm text-muted-foreground">Used for prayers and the app</Text>
          </View>
          <Button variant="outline" size="sm" onPress={() => router.push("/Language")}>
            Change
          </Button>
        </Card>
      </Section>

      {LOGIN_ENABLED && (
        <Section title="Account">
          <Card className="p-4 flex-row items-center gap-3">
            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-semibold text-card-foreground">
                {isSignedIn ? displayName : "Guest User"}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {isSignedIn ? user?.email : "Sign in to sync"}
              </Text>
            </View>
            {isSignedIn ? (
              <Button variant="outline" size="sm" onPress={signOut}>
                Sign out
              </Button>
            ) : signingIn ? (
              <ActivityIndicator color="#007C7C" />
            ) : (
              <Button size="sm" onPress={handleSignIn}>
                Sign in with Google
              </Button>
            )}
          </Card>
        </Section>
      )}

      {Platform.OS === "web" && (
        <Section title="App">
          <InstallCard dismissible={false} />
        </Section>
      )}

      <Section title="About">
        <Card className="p-4 gap-1">
          <Text className="text-sm font-semibold text-card-foreground">Ave</Text>
          <Text className="text-sm leading-6 text-muted-foreground">
            A free Catholic prayer companion for daily prayers, the Holy Rosary, novenas and
            chaplets, built for Uganda.
          </Text>
          <Text className="mt-2 text-xs text-muted-foreground">Version 1.0.0</Text>
        </Card>
      </Section>
    </Page>
  );
}
