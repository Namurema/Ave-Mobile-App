import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { AUDIO_ENABLED } from "../../constants/features";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import { getPrayersWithFallback } from "../../lib/supabase/queries";
import { Alert } from "../../components/ui/alert";
import { FavouriteButton, PrayedCard } from "../../components/PrayerActions";
import { itemKey } from "../../lib/items";
import {
  Page,
  PageHeader,
  Section,
  ReadingCard,
  LoadingCard,
  EmptyState,
} from "../../components/ui/page";

const titleKeys: Record<string, string> = {
  morning: "prayers.morningPrayers",
  midday: "prayers.middayPrayers",
  night: "prayers.nightPrayers",
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

// Night prayers are picked out by their English titles (`sourceTitle`), so
// this split only works while Supabase holds these prayers in English
const NIGHT_PRAYERS = ['Prayer of Thanksgiving (Night)', 'Act of Contrition (Night)', 'All Praise to You'];

export default function DailyPrayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [showingEnglish, setShowingEnglish] = useState(false);
  const [loading, setLoading] = useState(true);

  const title = t(titleKeys[id ?? "morning"] ?? "prayers.title");
  const audioUrl = audioMap[id ?? "morning"];
  const slug = slugMap[id ?? "morning"];

  useEffect(() => {
    loadPrayers();
  }, [id, language]);

  async function loadPrayers() {
    try {
      const { prayers: data, fallback } = await getPrayersWithFallback(slug, language);
      setShowingEnglish(fallback && data.length > 0);
      // Filter prayers relevant to morning or night
      let filtered = data;
      if (id === 'morning') {
        filtered = filtered.filter((p: any) => !NIGHT_PRAYERS.includes(p.sourceTitle));
      } else if (id === 'night') {
        filtered = filtered.filter((p: any) => NIGHT_PRAYERS.includes(p.sourceTitle));
      }
      setPrayers(filtered);
    } catch (e) {
      console.error('Error loading prayers:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader
        eyebrow={t("prayers.title")}
        actions={<FavouriteButton itemKey={itemKey.daily(id ?? "morning")} />}
        title={title}
        tabs={[
          { label: t("prayers.morning"), route: "/daily-prayer/morning" },
          { label: t("prayers.midday"), route: "/daily-prayer/midday" },
          { label: t("prayers.night"), route: "/daily-prayer/night" },
        ]}
      />

      {AUDIO_ENABLED && <AudioPlayer url={audioUrl} />}

      {showingEnglish && <Alert>{t("prayers.showingEnglish")}</Alert>}

      {loading ? (
        <LoadingCard label={t("prayers.loadingPrayers")} />
      ) : prayers.length === 0 ? (
        <EmptyState title={t("prayers.loadError")} description={t("prayers.checkConnection")} />
      ) : (
        <Section title={t("prayers.prayersSection")} count={prayers.length}>
          <ReadingCard
            sections={prayers.map((prayer) => ({ heading: prayer.title, body: prayer.body }))}
          />
        </Section>
      )}

      {prayers.length > 0 && <PrayedCard itemKey={itemKey.daily(id ?? "morning")} />}
    </Page>
  );
}
