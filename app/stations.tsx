import { useTranslation } from "react-i18next";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { stations } from "../constants/content/stations";
import { useContent } from "../lib/i18n/content";
import { FavouriteButton, PrayedCard } from "../components/PrayerActions";
import { itemKey } from "../lib/items";

export default function StationsScreen() {
  const { t } = useTranslation();
  const tc = useContent();
  return (
    <Page>
      <PageHeader
        back
        title={t("home.stationsOfCross")}
        description={t("stations.description")}
        actions={<FavouriteButton itemKey={itemKey.stations} />}
      />

      <Alert>{t("stations.info")}</Alert>

      <Section title={t("stations.section")} count={stations.length}>
        <ListCard
          items={stations.map((station) => ({
            key: String(station.number),
            leading: station.number,
            title: tc(station.title),
            description: tc(station.reflection),
          }))}
        />
      </Section>

      <PrayedCard itemKey={itemKey.stations} />
    </Page>
  );
}
