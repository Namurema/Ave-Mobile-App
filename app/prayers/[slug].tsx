import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { getPrayersWithFallback } from "../../lib/supabase/queries";
import { categoryText } from "../../lib/i18n/helpers";
import { Alert } from "../../components/ui/alert";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Page,
  PageHeader,
  NumberBadge,
  LoadingCard,
  EmptyState,
} from "../../components/ui/page";
import { cn } from "../../lib/utils";

export default function PrayerCategoryScreen() {
  const { slug, lang } = useLocalSearchParams<{ slug: string; lang: string }>();
  const { t } = useTranslation();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [showingEnglish, setShowingEnglish] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const meta = categoryText(t, slug ?? "", slug);

  const load = () => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    getPrayersWithFallback(slug, lang ?? "en")
      .then(({ prayers, fallback }) => {
        setPrayers(prayers);
        setShowingEnglish(fallback && prayers.length > 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [slug, lang]);

  return (
    <Page>
      <PageHeader
        back
        eyebrow={t("nav.prayers")}
        title={meta.title}
        description={meta.description || undefined}
      />

      {showingEnglish && <Alert>{t("prayers.showingEnglish")}</Alert>}

      {loading ? (
        <LoadingCard label={t("prayers.loadingPrayers")} />
      ) : error ? (
        <EmptyState title={t("prayers.loadError")} description={t("prayers.checkConnection")}>
          <Button variant="outline" onPress={load}>
            {t("common.tryAgain")}
          </Button>
        </EmptyState>
      ) : prayers.length === 0 ? (
        <EmptyState title={t("prayers.noPrayers")} description={t("prayers.noPrayersInCategory")} />
      ) : (
        <Card className="overflow-hidden">
          {prayers.map((prayer, index) => {
            const isOpen = expanded === prayer.id;
            const hasAudio = AUDIO_ENABLED && !!prayer.audio_url;
            return (
              <View
                key={prayer.id}
                className={cn(index < prayers.length - 1 && "border-b border-border")}
              >
                {/* Tap a prayer to expand it */}
                <Pressable
                  onPress={() => setExpanded(isOpen ? null : prayer.id)}
                  className="flex-row items-center gap-3 px-4 py-4 web:hover:bg-muted/60 web:transition-colors"
                >
                  <NumberBadge value={index + 1} />
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm font-semibold text-card-foreground">{prayer.title}</Text>
                    {prayer.subtitle ? (
                      <Text className="text-sm text-muted-foreground">{prayer.subtitle}</Text>
                    ) : null}
                  </View>
                  <Text className="w-5 text-center text-lg text-muted-foreground">{isOpen ? "−" : "+"}</Text>
                </Pressable>

                {isOpen && (
                  <View className="px-4 pb-5 gap-3">
                    {hasAudio && <AudioPlayer url={prayer.audio_url} />}
                    <Text selectable className="text-base leading-8 text-foreground">
                      {prayer.body ?? prayer.content ?? ""}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </Card>
      )}
    </Page>
  );
}
