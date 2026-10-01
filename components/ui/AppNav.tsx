import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { cn } from "../../lib/utils";

export const NAV_ITEMS = [
  { label: "Home", segment: "home", route: "/(tabs)/home" },
  { label: "Prayers", segment: "prayers", route: "/(tabs)/prayers" },
  { label: "Rosary", segment: "rosary", route: "/(tabs)/rosary" },
  { label: "Settings", segment: "profile", route: "/(tabs)/profile" },
];

export function useActiveSegment() {
  const pathname = usePathname();
  return (segment: string) => pathname.includes(segment);
}

// Desktop / tablet navigation. Phones use the bottom bar in Footer instead.
export function TopNav() {
  const router = useRouter();
  const isActive = useActiveSegment();

  return (
    <View className="hidden md:flex border-b border-border bg-background">
      <View className="w-full max-w-6xl self-center h-16 px-6 flex-row items-center justify-between">
        <Pressable onPress={() => router.push("/(tabs)/home")}>
          <Text className="text-xl font-bold tracking-tight text-primary">Ave</Text>
        </Pressable>
        <View role="navigation" className="flex-row items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.segment);
            return (
              <Pressable
                key={item.label}
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
