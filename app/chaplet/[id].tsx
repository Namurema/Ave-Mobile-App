import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { Page, PageHeader, ReadingCard } from "../../components/ui/page";
import { FavouriteButton, PrayedCard, ShareButton } from "../../components/PrayerActions";
import { itemKey } from "../../lib/items";
import { chapletContent } from "../../constants/content/chapletTexts";
import { useContent } from "../../lib/i18n/content";
import { images } from "../../constants/images";

export default function ChapletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const tc = useContent();
  const chaplet = chapletContent[id ?? ""];

  if (!chaplet) {
    return (
      <Page>
        <PageHeader back title={t("chaplets.notFound")} description={t("prayers.notAvailableYet")} />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        tone="primary"
        image={images.rosaryWall}
        back
        eyebrow={t("chaplets.eyebrow")}
        title={tc(chaplet.title)}
        description={tc(chaplet.subtitle)}
        actions={
          <>
            <FavouriteButton itemKey={itemKey.chaplet(id!)} />
            <ShareButton />
          </>
        }
      />

      {AUDIO_ENABLED && chaplet.audioUrl && <AudioPlayer url={chaplet.audioUrl} color={chaplet.color} />}

      <ReadingCard sections={chaplet.sections.map((s) => ({ heading: tc(s.heading), body: tc(s.body) }))} />

      <PrayedCard itemKey={itemKey.chaplet(id!)} />
    </Page>
  );
}
