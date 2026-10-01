import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
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

  const title = (slug as string)?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Page>
      <PageHeader back title={title ?? "Prayers"} description={`${prayers.length} prayers`} />

      {loading ? (
        <LoadingCard label="Loading prayers…" />
      ) : prayers.length === 0 ? (
        <EmptyState title="No prayers yet" description="No prayers found for this category yet." />
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
