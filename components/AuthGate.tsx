import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { LOGIN_ENABLED, ACCOUNT_REQUIRED } from "../constants/features";

// Pages anyone can open, even when accounts are required
const PUBLIC_PAGES = ["/", "/splash", "/Language", "/privacy", "/terms"];
const isPublic = (path: string) => PUBLIC_PAGES.includes(path) || path.startsWith("/auth/");

// While the saved sign-in loads, the teal launch screen stays up so the page
// doesn't flash first. When accounts are required (constants/features.ts),
// guests are sent to the welcome screen, which brings them back here after
// they sign in (`next`).
export function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const blocked = LOGIN_ENABLED && !isPublic(pathname) && (loading || (ACCOUNT_REQUIRED && !session));

  useEffect(() => {
    if (!LOGIN_ENABLED || !ACCOUNT_REQUIRED || loading || session || isPublic(pathname)) return;
    router.replace({ pathname: "/splash", params: { next: pathname } });
  }, [loading, session, pathname]);

  if (!blocked) return null;
  return (
    <View style={StyleSheet.absoluteFill} role="status" aria-label="Loading Ave" className="items-center justify-center gap-6 bg-primary">
      <Text className="text-5xl font-bold tracking-tight text-white">Ave</Text>
      {/* Pulsing dots (CSS in public/index.html) */}
      <View {...({ dataSet: { aveDots: "" } } as any)} aria-hidden>
        <View />
        <View />
        <View />
      </View>
    </View>
  );
}
