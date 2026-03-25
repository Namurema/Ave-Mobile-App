import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { getCategories } from "../../lib/supabase/queries";
import { useLanguageStore } from "../../store/LanguageStore";

const categoryIcons: Record<string, string> = {
  "daily-rosary": "",
  "morning-evening": "",
  "novenas": "",
  "chaplets": "",
  "litanies": "",
  "afternoon": "",
  "other-prayers": "",
};

const dailyRoutine = [
  { id: "morning", title: "Morning Prayers", subtitle: "Start your day with grace", icon: "" },
  { id: "midday", title: "Midday Prayers", subtitle: "A pause for peace & divine", icon: "" },
  { id: "night", title: "Night Prayers", subtitle: "Gratitude, rest, and peace", icon: "" },
];

export default function PrayersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const { getCategories } = await import("../../lib/supabase/queries");
      const data = await getCategories();
      setCategories(data ?? []);
    } catch (e) {
      console.log('Error loading categories:', e);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-primary px-6 pt-14 pb-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-2xl font-bold">{t('prayers.title')}</Text>
          <TouchableOpacity className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-white text-sm">↺</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-accent text-sm mt-1">{dateStr}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Daily Routine */}
        <View className="px-6 mt-6">
          <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
            {t('prayers.dailyRoutine')}
          </Text>
          {dailyRoutine.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/daily-prayer/${item.id}`)}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
            >
              <View className="w-12 h-12 bg-accent rounded-2xl items-center justify-center mr-4">
                <Text className="text-2xl">{item.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">{item.title}</Text>
                <Text className="text-gray-400 text-sm mt-0.5">{item.subtitle}</Text>
              </View>
              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                <Text className="text-white text-xs">▶</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* All Prayer Categories */}
        <View className="px-6 mt-6">
          <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
            {t('prayers.allPrayers')}
          </Text>

          {loading ? (
            <ActivityIndicator color="#007C7C" />
          ) : (
            categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => router.push(`/prayers/${cat.slug}?lang=${language}`)}
                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
              >
                <View className="w-12 h-12 bg-accent rounded-2xl items-center justify-center mr-4">
                  <Text className="text-2xl">{categoryIcons[cat.slug] ?? "🙏"}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold text-base">{cat.name}</Text>
                </View>
                <Text className="text-gray-300 text-lg">›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Scripture Quote */}
        <View className="mx-6 mt-6 mb-10 bg-accent rounded-3xl p-6">
          <Text className="text-primary text-base italic text-center leading-6">
            "Let all that you do be done in love."
          </Text>
          <Text className="text-primary/60 text-xs text-center mt-3 font-semibold">
            1 CORINTHIANS 16:14
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}