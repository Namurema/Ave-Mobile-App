import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { Page, PageHeader, ReadingCard } from "../../components/ui/page";
import { PrayerActionBar } from "../../components/PrayerActionBar";
import { useReadAloud } from "../../lib/speech";
import { itemKey } from "../../lib/items";
import { chapletContent } from "../../constants/content/chapletTexts";
import { useContent } from "../../lib/i18n/content";
import { art } from "../../constants/images";

export default function ChapletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const tc = useContent();
  const chaplet = chapletContent[id ?? ""];
  const sections = chaplet ? chaplet.sections.map((s) => ({ heading: tc(s.heading), body: tc(s.body) })) : [];
  const speech = useReadAloud(sections);

  if (!chaplet) {
    return (
      <Page>
        <PageHeader back title={t("chaplets.notFound")} description={t("prayers.notAvailableYet")} />
      </Page>
    );
  }

  return (
    <Page bottomBar={<PrayerActionBar itemKey={itemKey.chaplet(id!)} speech={speech} />}>
      <PageHeader
        tone="primary"
        image={art.divineMercy}
        back
        eyebrow={t("chaplets.eyebrow")}
        title={tc(chaplet.title)}
        description={tc(chaplet.subtitle)}
      />

      {AUDIO_ENABLED && chaplet.audioUrl && <AudioPlayer url={chaplet.audioUrl} color={chaplet.color} />}

      <ReadingCard sections={sections} speech={speech} />
    </Page>
  );
}
