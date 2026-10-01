import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { NAV_ITEMS, useActiveSegment } from "./AppNav";
import { cn } from "../../lib/utils";

// Bottom tab bar for phones. On wider screens TopNav takes over.
export default function Footer() {
  const router = useRouter();
  const isActive = useActiveSegment();

  return (
    <View
      className="flex-row bg-background border-t border-border md:hidden"
      style={{ paddingBottom: Platform.OS === "ios" ? 20 : 0 }}
    >
      {NAV_ITEMS.map((tab) => {
        const active = isActive(tab.segment);
        return (
          <TouchableOpacity
            key={tab.label}
            onPress={() => router.push(tab.route as any)}
            className={cn(
              "flex-1 items-center py-4 border-t-2",
              active ? "border-primary" : "border-transparent"
            )}
          >
            <Text
              className={cn(
                "text-sm",
                active ? "text-primary font-semibold" : "text-muted-foreground font-medium"
              )}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
