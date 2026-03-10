import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

const mysteries = {
  0: { name: "Glorious Mysteries", day: "SUNDAY", emoji: "✨" },
  1: { name: "Joyful Mysteries", day: "MONDAY", emoji: "🌸" },
  2: { name: "Sorrowful Mysteries", day: "TUESDAY & FRIDAY", emoji: "✝️" },
  3: { name: "Glorious Mysteries", day: "WEDNESDAY", emoji: "✨" },
  4: { name: "Luminous Mysteries", day: "THURSDAY", emoji: "💡" },
  5: { name: "Sorrowful Mysteries", day: "FRIDAY", emoji: "✝️" },
  6: { name: "Joyful Mysteries", day: "SATURDAY", emoji: "🌸" },
};

const mysteryDetails = [
  { number: 1, title: "The Agony in the Garden", virtue: "Contrition", description: "Focus on the virtue of true contrition for our sins." },
  { number: 2, title: "The Scourging at the Pillar", virtue: "Purity", description: "Focus on the virtue of purity." },
  { number: 3, title: "The Crowning with Thorns", virtue: "Courage", description: "Focus on the virtue of moral courage." },
  { number: 4, title: "Carrying of the Cross", virtue: "Patience", description: "Focus on the virtue of patience." },
  { number: 5, title: "The Crucifixion", virtue: "Self-denial", description: "Focus on the virtue of self-denial." },
];

export default function MysterySessionScreen() {
  const router = useRouter();
  const today = new Date().getDay();
  const todaysMystery = mysteries[today as keyof typeof mysteries];
  const [currentMystery, setCurrentMystery] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const current = mysteryDetails[currentMystery];

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
        {/* Image Placeholder */}
        <View className="h-48 bg-white/10 items-center justify-center relative">
          <Text className="text-6xl">{todaysMystery.emoji}</Text>

          {/* Mystery Label */}
          <View className="absolute top-3 left-3 bg-white/30 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-semibold">
              {current.number}st Mystery
            </Text>
          </View>

          {/* Expand Button */}
          <TouchableOpacity
            onPress={() => router.push(`/prayer/${current.number}`)}
            className="absolute top-3 right-3 w-8 h-8 bg-white/30 rounded-lg items-center justify-center"
          >
            <Text className="text-white text-xs">⤢</Text>
          </TouchableOpacity>

          {/* Play Button Overlay */}
          <TouchableOpacity
            onPress={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-3 right-3 w-12 h-12 bg-white/30 rounded-full items-center justify-center border-2 border-white/50"
          >
            <Text className="text-white text-lg">{isPlaying ? "⏸" : "▶"}</Text>
          </TouchableOpacity>
        </View>

        {/* Mystery Info */}
        <View className="p-4">
          <Text className="text-accent text-xs font-semibold">
            {todaysMystery.day}
          </Text>
          <Text className="text-white text-xl font-bold mt-1">
            {current.title}
          </Text>
          <Text className="text-white/70 text-sm mt-1">
            {current.description}
          </Text>
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
          <View className="h-1 bg-accent rounded-full w-2/5" />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-white/60 text-xs">8:14</Text>
          <Text className="text-white/60 text-xs">12:00</Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center gap-10 mb-6">
        <TouchableOpacity
          onPress={() => setCurrentMystery(Math.max(0, currentMystery - 1))}
        >
          <Text className="text-white/70 text-3xl">⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsPlaying(!isPlaying)}
          className="w-16 h-16 bg-white/20 rounded-full items-center justify-center border-2 border-white/40"
        >
          <Text className="text-white text-2xl">{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentMystery(Math.min(4, currentMystery + 1))}
        >
          <Text className="text-white/70 text-3xl">⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info Row */}
      <View className="flex-row items-center justify-between px-6 mb-6">
        <TouchableOpacity className="flex-row items-center gap-2">
          <Text className="text-white/60 text-sm">🔊 Volume</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-2">
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