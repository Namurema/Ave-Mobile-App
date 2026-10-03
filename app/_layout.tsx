import "../global.css";
import "../lib/i18n";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/LanguageStore";
import { LOGIN_ENABLED } from "../constants/features";
import { registerServiceWorker } from "../lib/pwa";
import { startUserDataSync } from "../store/userDataStore";

export default function RootLayout() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);

  useEffect(() => {
    if (LOGIN_ENABLED) loadSession();
    loadLanguage();
    startUserDataSync();
    registerServiceWorker();
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
    </SafeAreaProvider>
  );
}