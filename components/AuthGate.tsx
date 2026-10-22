import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { LOGIN_ENABLED } from "../constants/features";

// Pages anyone can open; everything else needs an account
const PUBLIC_PAGES = ["/", "/splash", "/Language", "/privacy", "/terms"];
const isPublic = (path: string) => PUBLIC_PAGES.includes(path) || path.startsWith("/auth/");

// Ave needs an account: without one, any other page goes to the welcome
// screen, which brings the person back here after they sign in (`next`).
// While the saved sign-in loads, the teal launch screen stays up so the page
// doesn't flash first.
export function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const blocked = LOGIN_ENABLED && !isPublic(pathname) && (loading || !session);

  useEffect(() => {
    if (!LOGIN_ENABLED || loading || session || isPublic(pathname)) return;
    router.replace({ pathname: "/splash", params: { next: pathname } });
  }, [loading, session, pathname]);

  if (!blocked) return null;
  return (
    <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-primary">
      <Text className="text-5xl font-bold tracking-tight text-white">Ave</Text>
    </View>
  );
}
