import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { availableNovenas } from "../constants/content/available";
import { useContent } from "../lib/i18n/content";

export default function NovenasScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();

  return (
    <Page>
      <PageHeader back title={t("home.novenas")} description={t("novenas.description")} />

      <Alert>{t("novenas.info")}</Alert>

      <Section title={t("novenas.all")} count={availableNovenas.length}>
        <ListCard
          items={availableNovenas.map((novena) => ({
            key: novena.id,
            title: tc(novena.title),
            description: tc(novena.desc),
            meta: `${novena.days} ${t("common.days")}`,
            onPress: () => router.push(`/novena/${novena.id}`),
          }))}
        />
      </Section>
    </Page>
  );
}
