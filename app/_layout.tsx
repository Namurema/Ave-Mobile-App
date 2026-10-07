import "../global.css";
import "../lib/i18n";
import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack, usePathname } from "expo-router";
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
import { SITE_URL } from "../constants/site";

// Runyankore's ISO 639 code is "nyn"; the app calls it "rny"
const htmlLang: Record<string, string> = { en: "en", lg: "lg", rny: "nyn" };

export default function RootLayout() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  const language = useLanguageStore((state) => state.language);
  const pathname = usePathname();

  useEffect(() => {
    if (LOGIN_ENABLED) loadSession();
    loadLanguage();
    startUserDataSync();
    registerServiceWorker();
    startUpdateChecks();
  }, []);

  // Canonical link and page language for search engines. Set directly: the
  // root layout sits outside any screen, where expo-router's <Head> renders nothing.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    document.documentElement.lang = htmlLang[language] ?? "en";
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = SITE_URL + pathname;
  }, [language, pathname]);

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