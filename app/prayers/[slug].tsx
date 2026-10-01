import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getPrayersByCategory } from "../../lib/supabase/queries";
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

const slugLabels: Record<string, { title: string; subtitle: string }> = {
  "morning-evening": { title: "Morning & Evening Prayers", subtitle: "Begin and end your day with grace" },
  "afternoon":        { title: "Mid-Day Prayers",           subtitle: "A pause for peace and the divine" },
  "daily-rosary":     { title: "Daily Rosary",              subtitle: "Meditate on the mysteries of Christ" },
  "novenas":          { title: "Novenas",                   subtitle: "Nine days of devoted prayer" },
  "chaplets":         { title: "Chaplets",                  subtitle: "Meditative bead prayers" },
  "litanies":         { title: "Litanies",                  subtitle: "Repetitive prayers of praise" },
  "other-prayers":    { title: "Other Prayers",             subtitle: "Sacred prayers from Catholic tradition" },
};

export default function PrayerCategoryScreen() {
  const { slug, lang } = useLocalSearchParams<{ slug: string; lang: string }>();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const meta = slugLabels[slug ?? ""] ?? { title: slug ?? "Prayers", subtitle: "" };

  const load = () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getPrayersByCategory(slug, lang ?? "en")
      .then((data) => setPrayers(data ?? []))
      .catch((e) => setError(e?.message ?? "Failed to load prayers"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [slug, lang]);

  return (
    <Page>
      <PageHeader back eyebrow="Prayers" title={meta.title} description={meta.subtitle || undefined} />

      {loading ? (
        <LoadingCard label="Loading prayers…" />
      ) : error ? (
        <EmptyState title="Couldn't load prayers" description={error}>
          <Button variant="outline" onPress={load}>
            Try again
          </Button>
        </EmptyState>
      ) : prayers.length === 0 ? (
        <EmptyState title="No prayers yet" description="No prayers found for this category." />
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
