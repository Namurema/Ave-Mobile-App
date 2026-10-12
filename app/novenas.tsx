import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { availableNovenas } from "../constants/content/available";
import { useContent } from "../lib/i18n/content";
import { images } from "../constants/images";

export default function NovenasScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();

  return (
    <Page>
      <PageHeader back tone="primary" image={images.prayingHands} title={t("home.novenas")} description={t("novenas.description")} />

      <Alert tone="accent">{t("novenas.info")}</Alert>

      <Section title={t("novenas.all")} count={availableNovenas.length}>
        <ListCard
          items={availableNovenas.map((novena) => ({
            key: novena.id,
            title: tc(novena.title),
            description: tc(novena.desc),
            tile: { value: novena.days, unit: t("common.days") },
            onPress: () => router.push(`/novena/${novena.id}`),
          }))}
        />
      </Section>
    </Page>
  );
}
