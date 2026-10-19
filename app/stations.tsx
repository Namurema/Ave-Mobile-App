import { useTranslation } from "react-i18next";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { stations } from "../constants/content/stations";
import { useContent } from "../lib/i18n/content";
import { FavouriteButton, PrayedCard, ShareButton } from "../components/PrayerActions";
import { itemKey } from "../lib/items";
import { images } from "../constants/images";
import { ReadAloudBar } from "../components/ReadAloud";

export default function StationsScreen() {
  const { t } = useTranslation();
  const tc = useContent();
  return (
    <Page>
      <PageHeader
        back
        tone="primary"
        image={images.silhouette}
        title={t("home.stationsOfCross")}
        description={t("stations.description")}
        actions={
          <>
            <FavouriteButton itemKey={itemKey.stations} />
            <ShareButton />
          </>
        }
      />

      <Alert tone="accent">{t("stations.info")}</Alert>

      <ReadAloudBar
        sections={stations.map((station) => ({
          heading: `${station.number}. ${tc(station.title)}`,
          body: tc(station.reflection),
        }))}
      />

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
