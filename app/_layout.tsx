import "../global.css";
import "../lib/i18n";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/LanguageStore";
import { LOGIN_ENABLED } from "../constants/features";
import { registerServiceWorker, startUpdateChecks } from "../lib/pwa";
import { UpdateBanner } from "../components/UpdateBanner";
import { InstallDialog } from "../components/InstallDialog";
import { startUserDataSync } from "../store/userDataStore";
import { AuthDialog } from "../components/auth/AuthDialog";

export default function RootLayout() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);

  useEffect(() => {
    if (LOGIN_ENABLED) loadSession();
    loadLanguage();
    startUserDataSync();
    registerServiceWorker();
    startUpdateChecks();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FAFAFA" },
        }}
      />
      <AuthDialog />
      <InstallDialog />
      <UpdateBanner />
    </SafeAreaProvider>
  );
}