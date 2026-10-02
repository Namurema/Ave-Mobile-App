import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { categoryText } from "../../lib/i18n/helpers";
import { fetchCategoryPrayers } from "../../lib/storage/prayerCache";
import {
  Page,
  PageHeader,
  ListCard,
  LoadingCard,
  EmptyState,
} from "../../components/ui/page";

export default function CategoryPrayersScreen() {
  const { slug, lang } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrayers();
  }, [slug, lang]);

  async function loadPrayers() {
    try {
      const data = await fetchCategoryPrayers(
        slug as string,
        (lang as string) ?? 'en'
      );
      setPrayers(data ?? []);
    } catch (e) {
      console.log('Error loading prayers:', e);
    } finally {
      setLoading(false);
    }
  }

  const fallbackTitle = (slug as string)?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const title = categoryText(t, slug as string, fallbackTitle).title;

  return (
    <Page>
      <PageHeader back title={title ?? t("nav.prayers")} />

      {loading ? (
        <LoadingCard label={t("prayers.loadingPrayers")} />
      ) : prayers.length === 0 ? (
        <EmptyState title={t("prayers.noPrayers")} description={t("prayers.noPrayersInCategory")} />
      ) : (
        <ListCard
          items={prayers.map((prayer) => ({
            key: String(prayer.id),
            title: prayer.title,
            description: prayer.body,
            descriptionLines: 2,
            onPress: () => router.push(`/prayer/${prayer.id}`),
          }))}
        />
      )}
    </Page>
  );
}
