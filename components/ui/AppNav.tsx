import { View, Text, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";

type IconName = keyof typeof Ionicons.glyphMap;

// Bottom bar (phones) and top bar (wider screens). Icons: outline, filled when active.
export const NAV_ITEMS: { labelKey: string; segment: string; route: string; icon: IconName; activeIcon: IconName }[] = [
  { labelKey: "nav.home", segment: "home", route: "/(tabs)/home", icon: "home-outline", activeIcon: "home" },
  { labelKey: "nav.prayers", segment: "prayers", route: "/(tabs)/prayers", icon: "book-outline", activeIcon: "book" },
  // The Rosary is a "garland of roses"
  { labelKey: "nav.rosary", segment: "rosary", route: "/(tabs)/rosary", icon: "rose-outline", activeIcon: "rose" },
  { labelKey: "nav.foryou", segment: "foryou", route: "/(tabs)/foryou", icon: "heart-outline", activeIcon: "heart" },
  { labelKey: "nav.me", segment: "profile", route: "/(tabs)/profile", icon: "person-circle-outline", activeIcon: "person-circle" },
];

export function useActiveSegment() {
  const pathname = usePathname();
  return (segment: string) => pathname.includes(segment);
}

// Desktop / tablet navigation. Phones use the bottom bar in Footer instead.
export function TopNav() {
  const router = useRouter();
  const { t } = useTranslation();
  const isActive = useActiveSegment();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  // The admin link is English only and shown just to the admin
  const items = [
    ...NAV_ITEMS.map((item) => ({ ...item, label: t(item.labelKey) })),
    ...(isAdmin ? [{ label: "Admin", segment: "/admin", route: "/admin" }] : []),
  ];

  return (
    <View className="hidden md:flex border-b border-border bg-background">
      <View className="w-full max-w-6xl self-center h-16 px-6 flex-row items-center justify-between">
        <Pressable onPress={() => router.push("/(tabs)/home")}>
          <Text className="text-xl font-bold tracking-tight text-primary-light">Ave</Text>
        </Pressable>
        <View role="navigation" className="flex-row items-center gap-1">
          {items.map((item) => {
            const active = isActive(item.segment);
            return (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route as any)}
                className={cn(
                  "h-9 px-3 rounded-md items-center justify-center web:transition-colors",
                  active ? "bg-muted" : "web:hover:bg-muted"
                )}
              >
                <Text
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// Settings for phones (the bottom bar has no Settings tab): a gear button
export function SettingsButton({ light }: { light?: boolean }) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      aria-label={t("nav.settings")}
      className={cn("md:hidden h-10 w-10 items-center justify-center rounded-full", light ? "bg-black/30" : "bg-background border border-border")}
    >
      <Ionicons name="settings-outline" size={20} color={light ? "#fff" : "#E5E5E5"} />
    </Pressable>
  );
}
