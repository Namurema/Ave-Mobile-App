import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import { cn } from "../../lib/utils";
import { Card } from "./card";
import { useUserDataStore } from "../../store/userDataStore";
import { availableNovenas, availableChaplets, otherPrayersCount } from "../../constants/content/available";

const LANGUAGE_NAMES: Record<string, string> = { en: "English", lg: "Oluganda", rny: "Orunyankore" };

// Desktop sidebar listing every prayer section, like a "Manage my network" card
export function BrowseSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const favouriteCount = useUserDataStore((state) => state.favourites.length);

  // `match` prefixes also highlight the section's detail pages
  const links = [
    { label: t("prayers.morningPrayers"), route: "/daily-prayer/morning", match: ["/daily-prayer/morning"] },
    { label: t("prayers.middayPrayers"), route: "/daily-prayer/midday", match: ["/daily-prayer/midday"] },
    { label: t("prayers.nightPrayers"), route: "/daily-prayer/night", match: ["/daily-prayer/night"] },
    { label: t("rosary.title"), route: "/(tabs)/rosary", match: ["/rosary", "/prayer/session"], count: 5 },
    { label: t("home.novenas"), route: "/novenas", match: ["/novena"], count: availableNovenas.length },
    { label: t("home.chaplets"), route: "/chaplets", match: ["/chaplet"], count: availableChaplets.length },
    { label: t("home.stationsOfCross"), route: "/stations", match: ["/stations"], count: 14 },
    { label: t("home.otherPrayers"), route: "/other-prayers", match: ["/other-prayer"], count: otherPrayersCount },
  ];

  return (
    <>
      <Card className="overflow-hidden">
        <Text className="px-5 py-4 text-base font-semibold text-card-foreground border-b border-border">
          {t("prayers.browse")}
        </Text>
        <View role="navigation" className="py-2">
          {links.map((link) => {
            const active = link.match.some((prefix) => pathname.startsWith(prefix));
            return (
              <Pressable
                key={link.route}
                onPress={() => router.push(link.route as any)}
                className={cn(
                  "flex-row items-center justify-between px-5 py-3 border-l-2 web:transition-colors",
                  active ? "border-primary bg-primary/5" : "border-transparent web:hover:bg-muted/60"
                )}
              >
                <Text
                  className={cn(
                    "text-sm",
                    active ? "font-semibold text-primary" : "font-medium text-foreground"
                  )}
                >
                  {link.label}
                </Text>
                {link.count !== undefined ? (
                  <Text className="text-sm text-muted-foreground">{link.count}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card className="overflow-hidden py-2">
        {[
          { label: t("favourites.title"), route: "/favourites", count: favouriteCount },
          { label: t("progress.title"), route: "/progress" },
        ].map((link) => {
          const active = pathname.startsWith(link.route);
          return (
            <Pressable
              key={link.route}
              onPress={() => router.push(link.route as any)}
              className={cn(
                "flex-row items-center justify-between px-5 py-3 border-l-2 web:transition-colors",
                active ? "border-primary bg-primary/5" : "border-transparent web:hover:bg-muted/60"
              )}
            >
              <Text className={cn("text-sm", active ? "font-semibold text-primary" : "font-medium text-foreground")}>
                {link.label}
              </Text>
              {link.count ? <Text className="text-sm text-muted-foreground">{link.count}</Text> : null}
            </Pressable>
          );
        })}
      </Card>

      <Card className="p-5 gap-1">
        <Text className="text-sm text-muted-foreground">{t("home.prayingIn")}</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-card-foreground">
            {LANGUAGE_NAMES[language] ?? "English"}
          </Text>
          <Pressable onPress={() => router.push("/Language")}>
            <Text className="text-sm font-semibold text-primary">{t("common.change")}</Text>
          </Pressable>
        </View>
      </Card>
    </>
  );
}
