import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import { Card } from "../../components/ui/card";
import {
  Page,
  PageHeader,
  Section,
  ListCard,
  LoadingCard,
  EmptyState,
} from "../../components/ui/page";

const dailyRoutine = [
  { id: "morning", title: "Morning Prayers", subtitle: "Start your day with grace" },
  { id: "midday", title: "Midday Prayers", subtitle: "A pause for peace & grace" },
  { id: "night", title: "Night Prayers", subtitle: "Gratitude, rest, and peace" },
];

export default function PrayersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const { getCategories } = await import("../../lib/supabase/queries");
      const data = await getCategories();
      setCategories(data ?? []);
    } catch (e) {
      console.log('Error loading categories:', e);
    } finally {
      setLoading(false);
    }
  }

  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Page>
      <PageHeader title={t("prayers.title")} description={dateStr} />

      <Section title={t("prayers.dailyRoutine")} count={dailyRoutine.length}>
        <ListCard
          items={dailyRoutine.map((item) => ({
            key: item.id,
            title: item.title,
            description: item.subtitle,
            onPress: () => router.push(`/daily-prayer/${item.id}`),
          }))}
        />
      </Section>

      <Section title={t("prayers.allPrayers")} count={loading ? undefined : categories.length}>
        {loading ? (
          <LoadingCard label="Loading prayers…" />
        ) : categories.length === 0 ? (
          <EmptyState
            title="Couldn't load prayers"
            description="Check your connection and try again."
          />
        ) : (
          <ListCard
            items={categories.map((cat) => ({
              key: String(cat.id),
              title: cat.name,
              onPress: () => router.push(`/prayers/${cat.slug}?lang=${language}`),
            }))}
          />
        )}
      </Section>

      <Card className="p-6 md:p-8 border-l-4 border-l-primary">
        <Text className="text-base md:text-lg italic leading-7 text-foreground">
          "Let all that you do be done in love."
        </Text>
        <Text className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          1 Corinthians 16:14
        </Text>
      </Card>
    </Page>
  );
}
