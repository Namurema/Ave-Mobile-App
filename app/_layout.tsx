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
import { startRoutineSync } from "../store/routineStore";
import { startAccessSync } from "../store/accessStore";
import { AuthDialog } from "../components/auth/AuthDialog";
import { AuthGate } from "../components/AuthGate";
import { AccessGate } from "../components/AccessGate";
import { SITE_URL } from "../constants/site";
import { languageInfo } from "../constants/languages";


export default function RootLayout() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  const language = useLanguageStore((state) => state.language);
  const pathname = usePathname();

  useEffect(() => {
    if (LOGIN_ENABLED) loadSession();
    loadLanguage();
    startUserDataSync();
    startRoutineSync();
    startAccessSync();
    registerServiceWorker();
    startUpdateChecks();
  }, []);

  // Canonical link and page language for search engines. Set directly: the
  // root layout sits outside any screen, where expo-router's <Head> renders nothing.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    document.documentElement.lang = languageInfo(language).htmlLang;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    // The welcome page has one address for search engines
    canonical.href = SITE_URL + (pathname === "/splash" ? "/" : pathname);
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
      <AuthGate />
      <AccessGate />
      <AuthDialog />
      <InstallDialog />
      <UpdateBanner />
    </SafeAreaProvider>
  );
}