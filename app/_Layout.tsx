import "../global.css";
import "../lib/i18n";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/LanguageStore";

export default function RootLayout() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);

  useEffect(() => {
    loadSession();
    loadLanguage();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#007C7C" },
        }}
      />
    </SafeAreaProvider>
  );
}