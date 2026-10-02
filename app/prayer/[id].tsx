import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { getPrayerById, getAudioTrack } from "../../lib/supabase/queries";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { Page, PageHeader, ReadingCard, LoadingCard } from "../../components/ui/page";

export default function PrayerOutputScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const [prayer, setPrayer] = useState<any>(null);
  const [audioTrack, setAudioTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrayer();
  }, [id]);

  async function loadPrayer() {
    try {
      const [prayerData, audioData] = await Promise.all([
        getPrayerById(id as string),
        AUDIO_ENABLED ? getAudioTrack(id as string) : null,
      ]);
      setPrayer(prayerData);
      setAudioTrack(audioData);
    } catch (e) {
      console.log('Error loading prayer:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Page>
        <LoadingCard />
      </Page>
    );
  }

  if (!prayer) {
    return (
      <Page>
        <PageHeader back title={t("prayers.notFound")} description={t("prayers.notAvailableYet")} />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader back eyebrow={t("prayers.prayer")} title={prayer.title} />

      {audioTrack && <AudioPlayer url={audioTrack.url} />}

      <ReadingCard sections={[{ body: prayer.body }]} />
    </Page>
  );
}
