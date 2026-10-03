import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { availableChaplets } from "../constants/content/available";
import { useContent } from "../lib/i18n/content";

export default function ChapletsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();

  return (
    <Page>
      <PageHeader back title={t("home.chaplets")} description={t("categories.chapletsDescription")} />

      <Alert>{t("chaplets.info")}</Alert>

      <Section title={t("chaplets.all")} count={availableChaplets.length}>
        <ListCard
          items={availableChaplets.map((chaplet) => ({
            key: chaplet.id,
            title: tc(chaplet.title),
            description: tc(chaplet.desc),
            meta: `${tc(chaplet.beads)} · ${tc(chaplet.duration)}`,
            onPress: () => router.push(`/chaplet/${chaplet.id}`),
          }))}
        />
      </Section>
    </Page>
  );
}
