import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { getPrayerById, getAudioTrack } from "../../lib/supabase/queries";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { Page, PageHeader, ReadingCard, LoadingCard } from "../../components/ui/page";

export default function PrayerOutputScreen() {
  const { id } = useLocalSearchParams();
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
      <Page width="narrow">
        <LoadingCard label="Loading prayer…" />
      </Page>
    );
  }

  if (!prayer) {
    return (
      <Page width="narrow">
        <PageHeader back title="Prayer not found" description="It may have been moved or removed." />
      </Page>
    );
  }

  return (
    <Page width="narrow">
      <PageHeader back eyebrow="Prayer" title={prayer.title} />

      {audioTrack && <AudioPlayer url={audioTrack.url} />}

      <ReadingCard sections={[{ body: prayer.body }]} />
    </Page>
  );
}
