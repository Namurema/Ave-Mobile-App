import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { Page, PageHeader, ReadingCard } from "../../components/ui/page";
import { PrayerActionBar } from "../../components/PrayerActionBar";
import { useReadAloud } from "../../lib/speech";
import { itemKey } from "../../lib/items";
import { prayerContent } from "../../constants/content/otherPrayerTexts";
import { useContent } from "../../lib/i18n/content";
import { images } from "../../constants/images";

export default function OtherPrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const tc = useContent();
  const prayer = prayerContent[id ?? ""];
  const sections = prayer ? prayer.sections.map((s) => ({ heading: tc(s.heading), body: tc(s.body) })) : [];
  const speech = useReadAloud(sections);

  if (!prayer) {
    return (
      <Page>
        <PageHeader back title={t("prayers.notFound")} description={t("prayers.notAvailableYet")} />
      </Page>
    );
  }

  return (
    <Page bottomBar={<PrayerActionBar itemKey={itemKey.other(id!)} speech={speech} />}>
      <PageHeader
        tone="primary"
        image={images.rosaryFern}
        back
        eyebrow={t("prayers.prayer")}
        title={tc(prayer.title)}
        description={tc(prayer.subtitle)}
      />

      {AUDIO_ENABLED && prayer.audioUrl && <AudioPlayer url={prayer.audioUrl} color={prayer.color} />}

      <ReadingCard sections={sections} speech={speech} />
    </Page>
  );
}
