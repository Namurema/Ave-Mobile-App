import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import { categoryText, formatDate } from "../../lib/i18n/helpers";
import { useContent } from "../../lib/i18n/content";
import { scripture } from "../../constants/content/scripture";
import { Card } from "../../components/ui/card";
import {
  Page,
  PageHeader,
  Section,
  ListCard,
  LoadingCard,
  EmptyState,
} from "../../components/ui/page";

export default function PrayersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const tc = useContent();
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

  const dailyRoutine = [
    { id: "morning", title: t("prayers.morningPrayers"), subtitle: t("prayers.startYourDay") },
    { id: "midday", title: t("prayers.middayPrayers"), subtitle: t("prayers.pauseForPeace") },
    { id: "night", title: t("prayers.nightPrayers"), subtitle: t("prayers.gratitudeRest") },
  ];

  return (
    <Page>
      <PageHeader title={t("prayers.title")} description={formatDate(new Date(), language)} />

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
          <LoadingCard label={t("prayers.loadingPrayers")} />
        ) : categories.length === 0 ? (
          <EmptyState title={t("prayers.loadError")} description={t("prayers.checkConnection")} />
        ) : (
          <ListCard
            items={categories.map((cat) => ({
              key: String(cat.id),
              title: categoryText(t, cat.slug, cat.name).title,
              onPress: () => router.push(`/prayers/${cat.slug}?lang=${language}`),
            }))}
          />
        )}
      </Section>

      <Card className="p-6 md:p-8 border-l-4 border-l-primary">
        <Text className="text-base md:text-lg italic leading-7 text-foreground">
          {tc(scripture.prayers.body)}
        </Text>
        <Text className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {tc(scripture.prayers.reference)}
        </Text>
      </Card>
    </Page>
  );
}
