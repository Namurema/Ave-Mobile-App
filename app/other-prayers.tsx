import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { categories } from "../constants/content/otherPrayers";
import { useContent } from "../lib/i18n/content";

// Prayers with full text in app/other-prayer/[id].tsx
const AVAILABLE = new Set(["guadalupe", "fatima", "magnificat"]);

const availableCount = (category: (typeof categories)[number]) =>
  category.prayers.filter((p) => AVAILABLE.has(p.id)).length;

export default function OtherPrayersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  // Categories with readable prayers first
  const sorted = [...categories].sort((a, b) => availableCount(b) - availableCount(a));

  return (
    <Page>
      <PageHeader back title={t("home.otherPrayers")} description={t("categories.otherPrayersDescription")} />

      {sorted.map((category) => (
        <Section key={category.id} title={t(`otherPrayers.${category.id}`)} count={category.prayers.length}>
          <ListCard
            items={category.prayers.map((prayer) => ({
              key: prayer.id,
              title: tc(prayer.title),
              description: tc(prayer.duration),
              ...(AVAILABLE.has(prayer.id)
                ? { onPress: () => router.push(`/other-prayer/${prayer.id}`) }
                : { unavailableLabel: t("common.comingSoon") }),
            }))}
          />
        </Section>
      ))}
    </Page>
  );
}
