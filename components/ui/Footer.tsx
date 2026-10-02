import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { NAV_ITEMS, useActiveSegment } from "./AppNav";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

// Bottom tab bar for phones. On wider screens TopNav takes over.
export default function Footer() {
  const router = useRouter();
  const { t } = useTranslation();
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
            key={tab.route}
            onPress={() => router.push(tab.route as any)}
            className={cn(
              "flex-1 items-center py-4 border-t-2",
              active ? "border-primary" : "border-transparent"
            )}
          >
            <Text
              className={cn(
                "px-0.5 text-[11px] text-center",
                active ? "text-primary font-semibold" : "text-muted-foreground font-medium"
              )}
            >
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
