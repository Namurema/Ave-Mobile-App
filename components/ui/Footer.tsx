import { View, Text, Pressable, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { NAV_ITEMS, useActiveSegment } from "./AppNav";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

// Bottom tab bar for phones: outline icons, filled and teal when active.
// On wider screens TopNav takes over.
export default function Footer() {
  const router = useRouter();
  const { t } = useTranslation();
  const isActive = useActiveSegment();

  return (
    <View
      role="navigation"
      className="flex-row bg-background border-t border-border md:hidden"
      style={{ paddingBottom: Platform.OS === "ios" ? 20 : 0 }}
    >
      {NAV_ITEMS.map((tab) => {
        const active = isActive(tab.segment);
        return (
          <Pressable
            key={tab.route}
            role="link"
            aria-current={active ? "page" : undefined}
            onPress={() => router.push(tab.route as any)}
            className="flex-1 items-center gap-1 pt-2.5 pb-3"
          >
            <Ionicons name={active ? tab.activeIcon : tab.icon} size={24} color={active ? "#01758F" : "#71717A"} />
            <Text className={cn("px-0.5 text-[11px] text-center", active ? "text-primary font-semibold" : "text-muted-foreground font-medium")}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
