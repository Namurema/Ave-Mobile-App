import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { availableOtherPrayers } from "../constants/content/available";
import { useContent } from "../lib/i18n/content";
import { images } from "../constants/images";

export default function OtherPrayersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();

  return (
    <Page>
      <PageHeader back tone="primary" image={images.prayingHands} title={t("home.otherPrayers")} description={t("categories.otherPrayersDescription")} />

      {availableOtherPrayers.map((category) => (
        <Section key={category.id} title={t(`otherPrayers.${category.id}`)} count={category.prayers.length}>
          <ListCard
            items={category.prayers.map((prayer) => ({
              key: prayer.id,
              title: tc(prayer.title),
              tile: { value: parseInt(prayer.duration, 10), unit: t("common.min") },
              onPress: () => router.push(`/other-prayer/${prayer.id}`),
            }))}
          />
        </Section>
      ))}
    </Page>
  );
}
