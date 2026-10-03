import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { Page, PageHeader, ReadingCard } from "../../components/ui/page";
import { FavouriteButton, PrayedCard } from "../../components/PrayerActions";
import { itemKey } from "../../lib/items";
import { prayerContent } from "../../constants/content/otherPrayerTexts";
import { useContent } from "../../lib/i18n/content";

export default function OtherPrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const tc = useContent();
  const prayer = prayerContent[id ?? ""];

  if (!prayer) {
    return (
      <Page>
        <PageHeader back title={t("prayers.notFound")} description={t("prayers.notAvailableYet")} />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        back
        eyebrow={t("prayers.prayer")}
        title={tc(prayer.title)}
        description={tc(prayer.subtitle)}
        actions={<FavouriteButton itemKey={itemKey.other(id!)} />}
      />

      {AUDIO_ENABLED && prayer.audioUrl && <AudioPlayer url={prayer.audioUrl} color={prayer.color} />}

      <ReadingCard sections={prayer.sections.map((s) => ({ heading: tc(s.heading), body: tc(s.body) }))} />

      <PrayedCard itemKey={itemKey.other(id!)} />
    </Page>
  );
}
