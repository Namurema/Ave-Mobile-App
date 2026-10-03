import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { availableOtherPrayers } from "../constants/content/available";
import { useContent } from "../lib/i18n/content";

export default function OtherPrayersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();

  return (
    <Page>
      <PageHeader back title={t("home.otherPrayers")} description={t("categories.otherPrayersDescription")} />

      {availableOtherPrayers.map((category) => (
        <Section key={category.id} title={t(`otherPrayers.${category.id}`)} count={category.prayers.length}>
          <ListCard
            items={category.prayers.map((prayer) => ({
              key: prayer.id,
              title: tc(prayer.title),
              description: tc(prayer.duration),
              onPress: () => router.push(`/other-prayer/${prayer.id}`),
            }))}
          />
        </Section>
      ))}
    </Page>
  );
}
