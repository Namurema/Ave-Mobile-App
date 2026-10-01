import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { useAudioStore } from "../../store/audioStore";
import { AUDIO_ENABLED } from "../../constants/features";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Page, PageHeader } from "../../components/ui/page";
import { cn } from "../../lib/utils";
import { ROSARY_TABS } from "../../constants/navigation";

const mysteries = {
  0: { name: "Glorious Mysteries", day: "SUNDAY", emoji: "" },
  1: { name: "Joyful Mysteries", day: "MONDAY", emoji: "" },
  2: { name: "Sorrowful Mysteries", day: "TUESDAY", emoji: "" },
  3: { name: "Glorious Mysteries", day: "WEDNESDAY", emoji: "" },
  4: { name: "Luminous Mysteries", day: "THURSDAY", emoji: "" },
  5: { name: "Sorrowful Mysteries", day: "FRIDAY", emoji: "" },
  6: { name: "Joyful Mysteries", day: "SATURDAY", emoji: "" },
};

const gloriousMysteries = [
  { number: 1, title: "The Resurrection", virtue: "Faith", description: "Focus on the glorious resurrection of Jesus Christ from the dead." },
  { number: 2, title: "The Ascension", virtue: "Hope", description: "Focus on Jesus ascending into heaven forty days after His resurrection." },
  { number: 3, title: "Descent of the Holy Spirit", virtue: "Love of God", description: "Focus on the Holy Spirit descending upon Mary and the Apostles." },
  { number: 4, title: "The Assumption", virtue: "Grace of a Happy Death", description: "Focus on Mary being assumed body and soul into heavenly glory." },
  { number: 5, title: "Coronation of Mary", virtue: "Trust in Mary's Intercession", description: "Focus on Mary being crowned Queen of Heaven and Earth." },
];

const joyfulMysteries = [
  { number: 1, title: "The Annunciation", virtue: "Humility", description: "Focus on the Angel Gabriel announcing to Mary the Incarnation." },
  { number: 2, title: "The Visitation", virtue: "Love of Neighbour", description: "Focus on Mary visiting her cousin Elizabeth." },
  { number: 3, title: "The Nativity", virtue: "Poverty & Detachment", description: "Focus on the birth of Jesus Christ in Bethlehem." },
  { number: 4, title: "The Presentation", virtue: "Obedience", description: "Focus on Mary and Joseph presenting Jesus in the Temple." },
  { number: 5, title: "Finding in the Temple", virtue: "Piety", description: "Focus on the twelve-year-old Jesus found among the teachers." },
];

const sorrowfulMysteries = [
  { number: 1, title: "The Agony in the Garden", virtue: "Contrition", description: "Focus on the virtue of true contrition for our sins." },
  { number: 2, title: "The Scourging at the Pillar", virtue: "Purity", description: "Focus on the virtue of purity." },
  { number: 3, title: "The Crowning with Thorns", virtue: "Courage", description: "Focus on the virtue of moral courage." },
  { number: 4, title: "Carrying of the Cross", virtue: "Patience", description: "Focus on the virtue of patience." },
  { number: 5, title: "The Crucifixion", virtue: "Self-denial", description: "Focus on the virtue of self-denial." },
];

const luminousMysteries = [
  { number: 1, title: "Baptism of Jesus", virtue: "Openness to the Holy Spirit", description: "Focus on the baptism of Jesus in the Jordan River." },
  { number: 2, title: "Wedding at Cana", virtue: "To Jesus through Mary", description: "Focus on Jesus performing His first miracle at Cana." },
  { number: 3, title: "Proclamation of the Kingdom", virtue: "Repentance & Trust", description: "Focus on Jesus proclaiming the Kingdom of God." },
  { number: 4, title: "The Transfiguration", virtue: "Desire for Holiness", description: "Focus on Jesus being transfigured on Mount Tabor." },
  { number: 5, title: "Institution of the Eucharist", virtue: "Eucharistic Adoration", description: "Focus on Jesus instituting the Holy Eucharist." },
];

const mysteryDetailsMap: Record<number, typeof sorrowfulMysteries> = {
  0: gloriousMysteries,
  1: joyfulMysteries,
  2: sorrowfulMysteries,
  3: gloriousMysteries,
  4: luminousMysteries,
  5: sorrowfulMysteries,
  6: joyfulMysteries,
};

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
  const today = new Date().getDay();
  const todaysMystery = mysteries[today as keyof typeof mysteries];
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
  const ordinals = ["1st", "2nd", "3rd", "4th", "5th"];
  const dayName = todaysMystery.day.charAt(0) + todaysMystery.day.slice(1).toLowerCase();

  return (
    <Page>
      <PageHeader
        eyebrow={`${dayName} · ${todaysMystery.name}`}
        title="Daily Rosary"
        tabs={ROSARY_TABS}
      />

      <Card className="p-6 md:p-8 gap-5">
        <View className="flex-row items-center justify-between">
          <Badge className="self-start">{`${ordinals[currentMystery]} Mystery`}</Badge>
          {AUDIO_ENABLED && (
            <Button variant="outline" size="sm" onPress={handlePlayPause}>
              {isCurrentTrack && isPlaying ? "Pause" : "Play"}
            </Button>
          )}
        </View>

        <View className="gap-2">
          <Text role="heading" className="text-2xl font-bold tracking-tight text-card-foreground">
            {current.title}
          </Text>
          <Text className="text-base leading-7 text-muted-foreground">{current.description}</Text>
        </View>

        <View className="rounded-md bg-muted p-4 gap-1">
          <Text className="text-xs font-semibold uppercase tracking-widest text-primary">Virtue</Text>
          <Text className="text-base font-semibold text-foreground">{current.virtue}</Text>
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
          Previous
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
          Next
        </Button>
      </View>
    </Page>
  );
}
