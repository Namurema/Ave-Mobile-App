import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { novenas } from "../constants/content/novenas";
import { useContent } from "../lib/i18n/content";

// Novenas with full text in app/novena/[id].tsx
const AVAILABLE = new Set(["7"]);

export default function NovenasScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const sorted = [...novenas].sort(
    (a, b) => Number(AVAILABLE.has(b.id)) - Number(AVAILABLE.has(a.id))
  );

  return (
    <Page>
      <PageHeader back title={t("home.novenas")} description={t("novenas.description")} />

      <Alert>{t("novenas.info")}</Alert>

      <Section title={t("novenas.all")} count={novenas.length}>
        <ListCard
          items={sorted.map((novena) => ({
            key: novena.id,
            title: tc(novena.title),
            description: tc(novena.desc),
            meta: `${novena.days} ${t("common.days")}`,
            ...(AVAILABLE.has(novena.id)
              ? { onPress: () => router.push(`/novena/${novena.id}`) }
              : { unavailableLabel: t("common.comingSoon") }),
          }))}
        />
      </Section>
    </Page>
  );
}
