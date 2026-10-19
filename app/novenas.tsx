import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../store/LanguageStore";
import { novenaSeason, type NovenaSeason } from "../lib/seasons";
import { seasonStatus, seasonRange } from "../components/NovenaSeason";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { availableNovenas } from "../constants/content/available";
import { useContent } from "../lib/i18n/content";
import { images } from "../constants/images";

const seasonOrder = (season: NovenaSeason | null) =>
  !season ? 1000 : season.status === "active" ? 0 : season.status === "feast" ? 1 : 2 + season.daysUntil;

export default function NovenasScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const language = useLanguageStore((state) => state.language);

  return (
    <Page>
      <PageHeader back tone="primary" image={images.prayingHands} title={t("home.novenas")} description={t("novenas.description")} />

      <Alert tone="accent">{t("novenas.info")}</Alert>

      <Section title={t("novenas.all")} count={availableNovenas.length}>
        <ListCard
          items={availableNovenas
            .map((novena) => ({ novena, season: novenaSeason(novena.id) }))
            // Running now first, then the feast day, then by start date; novenas
            // for any time of year last
            .sort((x, y) => seasonOrder(x.season) - seasonOrder(y.season))
            .map(({ novena, season }) => ({
              key: novena.id,
              title: tc(novena.title),
              description: tc(novena.desc),
              // Novenas with set dates: when they run, and where today falls
              meta: season ? seasonRange(season, t, language) : undefined,
              badge: season && season.status !== "later" ? seasonStatus(season, t, language) : undefined,
              badgeVariant: "primary" as const,
              tile: { value: novena.days, unit: t("common.days") },
              onPress: () => router.push(`/novena/${novena.id}`),
            }))}
        />
      </Section>
    </Page>
  );
}
