import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { getPrayersByCategory } from "../../lib/supabase/queries";
import {
  Page,
  PageHeader,
  ReadingCard,
  LoadingCard,
  EmptyState,
} from "../../components/ui/page";

const titleMap: Record<string, string> = {
  morning: "Morning Prayers",
  midday: "Mid-Day Prayers",
  night: "Night Prayers",
};

// Map daily prayer id to category slug
const slugMap: Record<string, string> = {
  morning: "morning-evening",
  midday: "afternoon",
  night: "morning-evening",
};

// Map daily prayer id to audio file
const audioMap: Record<string, string> = {
  morning: "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/morning-prayers.mp3",
  midday: "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/afternoon-prayers.mp3",
  night: "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/night-prayers.mp3",
};

const NIGHT_PRAYERS = ['Prayer of Thanksgiving (Night)', 'Act of Contrition (Night)', 'All Praise to You'];

export default function DailyPrayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const title = titleMap[id ?? "morning"] ?? "Daily Prayers";
  const audioUrl = audioMap[id ?? "morning"];
  const slug = slugMap[id ?? "morning"];

  useEffect(() => {
    loadPrayers();
  }, [id]);

  async function loadPrayers() {
    try {
      const data = await getPrayersByCategory(slug, 'en');
      // Filter prayers relevant to morning or night
      let filtered = data ?? [];
      if (id === 'morning') {
        filtered = filtered.filter((p: any) => !NIGHT_PRAYERS.includes(p.title));
      } else if (id === 'night') {
        filtered = filtered.filter((p: any) => NIGHT_PRAYERS.includes(p.title));
      }
      setPrayers(filtered);
    } catch (e) {
      console.error('Error loading prayers:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page width="narrow">
      <PageHeader back eyebrow="Daily Prayers" title={title} />

      {AUDIO_ENABLED && <AudioPlayer url={audioUrl} />}

      {loading ? (
        <LoadingCard label="Loading prayers…" />
      ) : prayers.length === 0 ? (
        <EmptyState
          title="No prayers found"
          description="Check your connection and try again."
        />
      ) : (
        <ReadingCard
          sections={prayers.map((prayer) => ({ heading: prayer.title, body: prayer.body }))}
        />
      )}
    </Page>
  );
}
