import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { chaplets } from "../constants/content/chaplets";
import { useContent } from "../lib/i18n/content";

// Chaplets with full text in app/chaplet/[id].tsx
const AVAILABLE = new Set(["1"]);

export default function ChapletsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const sorted = [...chaplets].sort(
    (a, b) => Number(AVAILABLE.has(b.id)) - Number(AVAILABLE.has(a.id))
  );

  return (
    <Page>
      <PageHeader back title={t("home.chaplets")} description={t("categories.chapletsDescription")} />

      <Alert>{t("chaplets.info")}</Alert>

      <Section title={t("chaplets.all")} count={chaplets.length}>
        <ListCard
          items={sorted.map((chaplet) => ({
            key: chaplet.id,
            title: tc(chaplet.title),
            description: tc(chaplet.desc),
            meta: `${tc(chaplet.beads)} · ${tc(chaplet.duration)}`,
            ...(AVAILABLE.has(chaplet.id)
              ? { onPress: () => router.push(`/chaplet/${chaplet.id}`) }
              : { unavailableLabel: t("common.comingSoon") }),
          }))}
        />
      </Section>
    </Page>
  );
}
