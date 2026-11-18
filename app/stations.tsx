import { useTranslation } from "react-i18next";
import { Alert } from "../components/ui/alert";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { stations } from "../constants/content/stations";
import { useContent } from "../lib/i18n/content";
import { PrayerActionBar } from "../components/PrayerActionBar";
import { useReadAloud } from "../lib/speech";
import { itemKey } from "../lib/items";
import { images } from "../constants/images";

export default function StationsScreen() {
  const { t } = useTranslation();
  const tc = useContent();
  const speech = useReadAloud(
    stations.map((station) => ({ heading: `${station.number}. ${tc(station.title)}`, body: tc(station.reflection) }))
  );
  return (
    <Page bottomBar={<PrayerActionBar itemKey={itemKey.stations} speech={speech} />}>
      <PageHeader
        back
        tone="primary"
        image={images.silhouette}
        title={t("home.stationsOfCross")}
        description={t("stations.description")}
      />

      <Alert tone="accent">{t("stations.info")}</Alert>


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
    </Page>
  );
}
