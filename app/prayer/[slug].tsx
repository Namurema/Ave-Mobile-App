import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { fetchCategoryPrayers } from "../../lib/storage/prayerCache";

export default function CategoryPrayersScreen() {
  const { slug, lang } = useLocalSearchParams();
  const router = useRouter();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrayers();
  }, [slug, lang]);

  async function loadPrayers() {
    try {
      const data = await fetchCategoryPrayers(
        slug as string,
        (lang as string) ?? 'en'
      );
      setPrayers(data ?? []);
    } catch (e) {
      console.log('Error loading prayers:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-primary px-6 pt-14 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mb-4"
        >
          <Text className="text-white">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold capitalize">
          {(slug as string)?.replace(/-/g, ' ')}
        </Text>
        <Text className="text-accent text-sm mt-1">
          {prayers.length} prayers
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#007C7C" size="large" />
        </View>
      ) : prayers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">🙏</Text>
          <Text className="text-gray-400 text-center">
            No prayers found for this category yet.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="px-6 mt-6">
          {prayers.map((prayer) => (
            <TouchableOpacity
              key={prayer.id}
              onPress={() => router.push(`/prayer/${prayer.id}`)}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            >
              <Text className="text-gray-800 font-semibold text-base">
                {prayer.title}
              </Text>
              <Text className="text-gray-400 text-sm mt-1" numberOfLines={2}>
                {prayer.body}
              </Text>
              <View className="flex-row items-center justify-between mt-3">
                <View className="bg-accent rounded-full px-3 py-1">
                  <Text className="text-primary text-xs font-medium">Read Prayer</Text>
                </View>
                <Text className="text-gray-300 text-lg">›</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View className="h-10" />
        </ScrollView>
      )}
    </View>
  );
}