import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getPrayersByCategory } from "../../lib/supabase/queries";
import AudioPlayer from "../../components/audio/AudioPlayer";

const slugLabels: Record<string, { title: string; subtitle: string; icon: string; color: string }> = {
  "morning-evening": { title: "Morning & Evening Prayers", subtitle: "Begin and end your day with grace", icon: "🌅", color: "#007C7C" },
  "afternoon":        { title: "Mid-Day Prayers",           subtitle: "A pause for peace and the divine",  icon: "☀️",  color: "#7C6500" },
  "daily-rosary":     { title: "Daily Rosary",              subtitle: "Meditate on the mysteries of Christ", icon: "📿", color: "#5C2D7C" },
  "novenas":          { title: "Novenas",                   subtitle: "Nine days of devoted prayer",        icon: "🕯️", color: "#2D5C7C" },
  "chaplets":         { title: "Chaplets",                  subtitle: "Meditative bead prayers",            icon: "✝️", color: "#5C2D2D" },
  "litanies":         { title: "Litanies",                  subtitle: "Repetitive prayers of praise",       icon: "📜", color: "#2D5C2D" },
  "other-prayers":    { title: "Other Prayers",             subtitle: "Sacred prayers from Catholic tradition", icon: "🙏", color: "#4A6FA5" },
};

export default function PrayerCategoryScreen() {
  const { slug, lang } = useLocalSearchParams<{ slug: string; lang: string }>();
  const router = useRouter();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const meta = slugLabels[slug ?? ""] ?? {
    title: slug ?? "Prayers",
    subtitle: "",
    icon: "🙏",
    color: "#007C7C",
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getPrayersByCategory(slug, lang ?? "en")
      .then((data) => setPrayers(data ?? []))
      .catch((e) => setError(e?.message ?? "Failed to load prayers"))
      .finally(() => setLoading(false));
  }, [slug, lang]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: meta.color }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white text-base">←</Text>
          </TouchableOpacity>
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-base">{meta.icon}</Text>
          </View>
        </View>
        <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">
          Prayers
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">{meta.title}</Text>
        {meta.subtitle ? (
          <Text className="text-white/70 text-sm mt-1">{meta.subtitle}</Text>
        ) : null}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={meta.color} />
          <Text className="text-gray-400 text-sm mt-3">Loading prayers…</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-red-500 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              setError(null);
              getPrayersByCategory(slug ?? "", lang ?? "en")
                .then((data) => setPrayers(data ?? []))
                .catch((e) => setError(e?.message ?? "Failed to load prayers"))
                .finally(() => setLoading(false));
            }}
            className="mt-4 px-6 py-2 rounded-full"
            style={{ backgroundColor: meta.color }}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : prayers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-400 text-center">No prayers found for this category.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 mt-4">
            {prayers.map((prayer, index) => {
              const isOpen = expanded === prayer.id;
              const hasAudio = !!prayer.audio_url;
              return (
                <View key={prayer.id} className="mb-3">
                  {/* Prayer card header — tap to expand */}
                  <TouchableOpacity
                    onPress={() => setExpanded(isOpen ? null : prayer.id)}
                    className="bg-white rounded-2xl px-4 py-4 shadow-sm flex-row items-center"
                  >
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: meta.color + "18" }}
                    >
                      <Text className="text-sm font-bold" style={{ color: meta.color }}>
                        {index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-semibold text-sm leading-5">
                        {prayer.title}
                      </Text>
                      {prayer.subtitle ? (
                        <Text className="text-gray-400 text-xs mt-0.5">{prayer.subtitle}</Text>
                      ) : null}
                    </View>
                    <Text className="text-gray-300 text-lg ml-2">{isOpen ? "∧" : "∨"}</Text>
                  </TouchableOpacity>

                  {/* Expanded prayer body */}
                  {isOpen && (
                    <View className="bg-gray-50 rounded-b-2xl px-5 pt-3 pb-4 -mt-2 border border-gray-100">
                      {hasAudio && (
                        <View className="mb-3">
                          <AudioPlayer url={prayer.audio_url} color={meta.color} />
                        </View>
                      )}
                      <Text className="text-gray-700 text-base leading-7">
                        {prayer.body ?? prayer.content ?? ""}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <View className="mb-12" />
        </ScrollView>
      )}
    </View>
  );
}
