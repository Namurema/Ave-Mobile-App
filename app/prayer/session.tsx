import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { useAudioStore } from "../../store/audioStore";
import { AUDIO_ENABLED } from "../../constants/features";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Page, PageHeader } from "../../components/ui/page";
import { cn } from "../../lib/utils";
import { rosaryTabs } from "../../constants/navigation";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import { formatWeekday } from "../../lib/i18n/helpers";
import { mysteryDetailsMap } from "../../constants/content/rosarySession";
import { useContent } from "../../lib/i18n/content";

// Rosary mysteries by weekday, Sunday first
const MYSTERY_BY_DAY = ["glorious", "joyful", "sorrowful", "glorious", "luminous", "sorrowful", "joyful"];

// Rosary prayer audio URLs in order
const rosaryAudioUrls = [
  "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/apostles-creed.mp3",
  "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/our-father.mp3",
  "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/hail-mary.mp3",
  "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/glory-be.mp3",
  "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/fatima-prayer.mp3",
  "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/hail-holy-queen.mp3",
];

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MysterySessionScreen() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const tc = useContent();
  const today = new Date().getDay();
  const mysteryDetails = mysteryDetailsMap[today];
  const [currentMystery, setCurrentMystery] = useState(0);
  const [currentAudioIndex] = useState(0);

  const { isPlaying, duration, position, loadAndPlay, togglePlayPause, currentTrackUrl } = useAudioStore();

  const current = mysteryDetails[currentMystery];
  const currentAudioUrl = rosaryAudioUrls[currentAudioIndex];
  const isCurrentTrack = currentTrackUrl === currentAudioUrl;
  const progress = isCurrentTrack && duration > 0 ? position / duration : 0;

  const handlePlayPause = async () => {
    if (isCurrentTrack) {
      await togglePlayPause();
    } else {
      await loadAndPlay(currentAudioUrl);
    }
  };

  const isFirst = currentMystery === 0;
  const isLast = currentMystery === mysteryDetails.length - 1;

  return (
    <Page>
      <PageHeader
        eyebrow={`${formatWeekday(new Date(), language)} · ${t(`rosary.${MYSTERY_BY_DAY[today]}`)}`}
        title={t("rosary.title")}
        tabs={rosaryTabs(t)}
      />

      <Card className="p-6 md:p-8 gap-5">
        <View className="flex-row items-center justify-between">
          <Badge className="self-start">{`${t("rosary.mystery")} ${currentMystery + 1}`}</Badge>
          {AUDIO_ENABLED && (
            <Button variant="outline" size="sm" onPress={handlePlayPause}>
              {isCurrentTrack && isPlaying ? t("rosary.pause") : t("rosary.play")}
            </Button>
          )}
        </View>

        <View className="gap-2">
          <Text role="heading" className="text-2xl font-bold tracking-tight text-card-foreground">
            {tc(current.title)}
          </Text>
          <Text className="text-base leading-7 text-muted-foreground">{tc(current.description)}</Text>
        </View>

        <View className="rounded-md bg-muted p-4 gap-1">
          <Text className="text-xs font-semibold uppercase tracking-widest text-primary">{t("rosary.virtue")}</Text>
          <Text className="text-base font-semibold text-foreground">{tc(current.virtue)}</Text>
        </View>

        {AUDIO_ENABLED && (
          <View className="gap-1">
            <View className="h-1 bg-muted rounded-full">
              <View className="h-1 bg-primary rounded-full" style={{ width: `${progress * 100}%` }} />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted-foreground">
                {isCurrentTrack ? formatTime(position) : "0:00"}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {isCurrentTrack ? formatTime(duration) : "--:--"}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Mystery navigation */}
      <View className="flex-row items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={isFirst}
          className={cn(isFirst && "opacity-50")}
          onPress={() => setCurrentMystery(Math.max(0, currentMystery - 1))}
        >
          {t("rosary.previous")}
        </Button>

        <View className="flex-row gap-2">
          {mysteryDetails.map((_, index) => (
            <Pressable
              key={index}
              aria-label={`Mystery ${index + 1}`}
              onPress={() => setCurrentMystery(index)}
              className={cn(
                "h-2 rounded-full",
                index === currentMystery ? "w-6 bg-primary" : "w-2 bg-border"
              )}
            />
          ))}
        </View>

        <Button
          disabled={isLast}
          className={cn(isLast && "opacity-50")}
          onPress={() => setCurrentMystery(Math.min(mysteryDetails.length - 1, currentMystery + 1))}
        >
          {t("rosary.next")}
        </Button>
      </View>
    </Page>
  );
}
