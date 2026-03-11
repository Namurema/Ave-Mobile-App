import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getPrayerById, getAudioTrack } from "../../lib/supabase/queries";
import AudioPlayer from "../../components/audio/AudioPlayer";

export default function PrayerOutputScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [prayer, setPrayer] = useState<any>(null);
  const [audioTrack, setAudioTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    loadPrayer();
  }, [id]);

  async function loadPrayer() {
    try {
      const [prayerData, audioData] = await Promise.all([
        getPrayerById(id as string),
        getAudioTrack(id as string),
      ]);
      setPrayer(prayerData);
      setAudioTrack(audioData);
    } catch (e) {
      console.log('Error loading prayer:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator color="#007C7C" size="large" />
    </View>
  );

  if (!prayer) return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-5xl mb-4">🙏</Text>
      <Text className="text-gray-400 text-center">Prayer not found.</Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-4 bg-primary rounded-full px-6 py-3"
      >
        <Text className="text-white font-semibold">Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-primary px-6 pt-14 pb-6">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsFavourite(!isFavourite)}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-lg">{isFavourite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-white text-2xl font-bold mt-1">
          {prayer.title}
        </Text>
      </View>

      {/* Audio Player — only show if audio exists */}
      {audioTrack && (
        <View className="mx-6 mt-4">
          <AudioPlayer
            url={audioTrack.url}
            color="#007C7C"
          />
        </View>
      )}

      {/* Prayer Text */}
      <ScrollView
        className="flex-1 px-6 mt-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-700 text-base leading-8">
          {prayer.body}
        </Text>

        {/* Mark Complete Button */}
        <TouchableOpacity className="bg-primary rounded-full py-4 items-center mt-8 mb-10">
          <Text className="text-white text-lg font-semibold">
            ✓ Mark as Complete
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}