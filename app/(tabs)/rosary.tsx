import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Page, PageHeader, Section, NumberBadge } from "../../components/ui/page";
import { cn } from "../../lib/utils";
import { rosaryTabs } from "../../constants/navigation";
import { useLanguageStore } from "../../store/LanguageStore";
import { formatWeekday } from "../../lib/i18n/helpers";
import { ROSARY_BY_DAY } from "../../constants/content/rosary";
import { useContent } from "../../lib/i18n/content";

export default function RosaryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const tc = useContent();
  const today = new Date().getDay();
  const [expandedMystery, setExpandedMystery] = useState<number | null>(null);


  const todaysMystery = {
    name: t(`rosary.${ROSARY_BY_DAY[today].key}`),
    mysteries: ROSARY_BY_DAY[today].mysteries,
  };

  return (
    <Page>
      <PageHeader
        eyebrow={`${formatWeekday(new Date(), language)} · ${t("rosary.title")}`}
        title={todaysMystery.name}
        description={t("rosary.focusVirtues")}
        tabs={rosaryTabs(t)}
      />

      <Section title={t("rosary.theFiveMysteries")} count={todaysMystery.mysteries.length}>
        <Card className="overflow-hidden">
          {todaysMystery.mysteries.map((mystery, index) => {
            const open = expandedMystery === mystery.number;
            return (
              <Pressable
                key={mystery.number}
                onPress={() => setExpandedMystery(open ? null : mystery.number)}
                className={cn(
                  "px-4 py-4 gap-3 web:hover:bg-muted/60 web:transition-colors",
                  index < todaysMystery.mysteries.length - 1 && "border-b border-border"
                )}
              >
                <View className="flex-row items-center gap-3">
                  <NumberBadge value={mystery.number} />
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm font-semibold text-card-foreground">{tc(mystery.title)}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {t("rosary.virtue")}: {tc(mystery.virtue)}
                    </Text>
                  </View>
                  <Text className="w-5 text-center text-lg text-muted-foreground">{open ? "−" : "+"}</Text>
                </View>

                {open && (
                  <View className="ml-11 rounded-md bg-muted p-3 gap-1">
                    <Text className="text-xs font-semibold uppercase tracking-widest text-primary">
                      {t("rosary.meditation")}
                    </Text>
                    <Text className="text-sm leading-6 text-foreground">{tc(mystery.meditation)}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </Card>
      </Section>

      <Button
        size="lg"
        className="w-full md:w-auto md:self-start"
        onPress={() => router.push("/prayer/session")}
      >
        {t("rosary.beginSession")}
      </Button>
    </Page>
  );
}
