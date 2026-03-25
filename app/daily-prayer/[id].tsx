import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AudioPlayer from "../../components/audio/AudioPlayer";
import { getPrayersByCategory, getAudioTrack } from "../../lib/supabase/queries";

const colorMap: Record<string, string> = {
  morning: "#007C7C",
  midday: "#7C6500",
  night: "#1a1a2e",
};

const iconMap: Record<string, string> = {
  morning: "",
  midday: "",
  night: "",
};

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

export default function DailyPrayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const color = colorMap[id ?? "morning"] ?? "#007C7C";
  const icon = iconMap[id ?? "morning"] ?? "";
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
        filtered = filtered.filter((p: any) =>
          !['Prayer of Thanksgiving (Night)', 'Act of Contrition (Night)', 'All Praise to You'].includes(p.title)
        );
      } else if (id === 'night') {
        filtered = filtered.filter((p: any) =>
          ['Prayer of Thanksgiving (Night)', 'Act of Contrition (Night)', 'All Praise to You'].includes(p.title)
        );
      }
      setPrayers(filtered);
    } catch (e) {
      console.error('Error loading prayers:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator color="#007C7C" size="large" />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: color }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-base">{icon}</Text>
          </View>
        </View>
        <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">
          Daily Prayers
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">{title}</Text>

        {/* Single Audio Player in header */}
        <View className="mt-4">
          <AudioPlayer url={audioUrl} color={color} />
        </View>
      </View>

      {/* Prayer Sections */}
      <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
        {prayers.map((prayer) => (
          <View key={prayer.id} className="mb-8">
            <Text
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color }}
            >
              {prayer.title}
            </Text>
            <Text className="text-gray-700 text-base leading-7">{prayer.body}</Text>
          </View>
        ))}
        <View className="mb-12" />
      </ScrollView>
    </View>
  );
}