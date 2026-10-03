import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { Page, PageHeader, ReadingCard } from "../../components/ui/page";
import { FavouriteButton, PrayedCard, NovenaProgressCard } from "../../components/PrayerActions";
import { itemKey } from "../../lib/items";
import { novenaContent } from "../../constants/content/novenaTexts";
import { useContent } from "../../lib/i18n/content";

export default function NovenaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const tc = useContent();
  const novena = novenaContent[id ?? ""];

  if (!novena) {
    return (
      <Page>
        <PageHeader back title={t("novenas.notFound")} description={t("prayers.notAvailableYet")} />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        back
        eyebrow={t("novenas.eyebrow")}
        title={tc(novena.title)}
        description={tc(novena.subtitle)}
        actions={<FavouriteButton itemKey={itemKey.novena(id!)} />}
      />

      <NovenaProgressCard novenaId={id!} />

      {AUDIO_ENABLED && novena.audioUrl && <AudioPlayer url={novena.audioUrl} color={novena.color} />}

      <ReadingCard sections={novena.sections.map((s) => ({ heading: tc(s.heading), body: tc(s.body) }))} />

      <PrayedCard itemKey={itemKey.novena(id!)} />
    </Page>
  );
}
