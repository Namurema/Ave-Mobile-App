import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useAudioStore } from "../../store/audioStore";

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
  const router = useRouter();
  const today = new Date().getDay();
  const todaysMystery = mysteries[today as keyof typeof mysteries];
  const mysteryDetails = mysteryDetailsMap[today];
  const [currentMystery, setCurrentMystery] = useState(0);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

  const { isPlaying, duration, position, loadAndPlay, togglePlayPause, seek, currentTrackUrl } = useAudioStore();

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

  const handlePrevMystery = () => {
    setCurrentMystery(Math.max(0, currentMystery - 1));
  };

  const handleNextMystery = () => {
    setCurrentMystery(Math.min(4, currentMystery + 1));
  };

  const ordinals = ["1st", "2nd", "3rd", "4th", "5th"];

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 pt-14 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-white font-semibold text-base">Daily Rosary</Text>
        </View>
        <TouchableOpacity className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
          <Text className="text-white text-sm">⤴</Text>
        </TouchableOpacity>
      </View>

      {/* Mystery Card */}
      <View className="mx-6 rounded-3xl overflow-hidden bg-white/10 mb-4">
        <View className="h-48 bg-white/10 items-center justify-center relative">
          <Text className="text-6xl">{todaysMystery.emoji}</Text>

          <View className="absolute top-3 left-3 bg-white/30 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-semibold">
              {ordinals[currentMystery]} Mystery
            </Text>
          </View>

          <TouchableOpacity
            className="absolute top-3 right-3 w-8 h-8 bg-white/30 rounded-lg items-center justify-center"
          >
            <Text className="text-white text-xs">⤢</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            className="absolute bottom-3 right-3 w-12 h-12 bg-white/30 rounded-full items-center justify-center border-2 border-white/50"
          >
            <Text className="text-white text-lg">
              {isCurrentTrack && isPlaying ? "⏸" : "▶"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <Text className="text-accent text-xs font-semibold">{todaysMystery.day}</Text>
          <Text className="text-white text-xl font-bold mt-1">{current.title}</Text>
          <Text className="text-white/70 text-sm mt-1">{current.description}</Text>
        </View>
      </View>

      {/* Virtue Card */}
      <View className="mx-6 bg-white/10 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
          <Text className="text-lg">🕊️</Text>
        </View>
        <View>
          <Text className="text-white font-semibold">{current.virtue}</Text>
          <Text className="text-white/60 text-sm">Recommended virtue for meditation</Text>
        </View>
      </View>

      {/* Audio Progress */}
      <View className="mx-6 mb-4">
        <View className="h-1 bg-white/20 rounded-full mb-2">
          <View
            className="h-1 bg-accent rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-white/60 text-xs">
            {isCurrentTrack ? formatTime(position) : "0:00"}
          </Text>
          <Text className="text-white/60 text-xs">
            {isCurrentTrack ? formatTime(duration) : "--:--"}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center gap-10 mb-6">
        <TouchableOpacity onPress={handlePrevMystery}>
          <Text className="text-white/70 text-3xl">⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePlayPause}
          className="w-16 h-16 bg-white/20 rounded-full items-center justify-center border-2 border-white/40"
        >
          <Text className="text-white text-2xl">
            {isCurrentTrack && isPlaying ? "⏸" : "▶"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextMystery}>
          <Text className="text-white/70 text-3xl">⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info Row */}
      <View className="flex-row items-center justify-between px-6 mb-6">
        <TouchableOpacity onPress={() => seek(Math.max(0, position - 10000))}>
          <Text className="text-white/60 text-sm">🔊 Volume</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-white/60 text-sm">ℹ️ Meditation Info</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-white/60 text-sm">•••</Text>
        </TouchableOpacity>
      </View>

      {/* Mystery Navigation Dots */}
      <View className="flex-row justify-center gap-2 mb-6">
        {mysteryDetails.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentMystery(index)}
            className={`h-2 rounded-full ${
              index === currentMystery ? "w-6 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </View>

    </View>
  );
}