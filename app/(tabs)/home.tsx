import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../../store/LanguageStore";
import Footer from "../../components/ui/Footer";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="bg-primary px-6 pt-14 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-accent text-sm">{t('home.greeting')}</Text>
              <Text className="text-white text-2xl font-bold">Ave</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Text className="text-white text-lg">👤</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-white/20 rounded-full flex-row items-center px-4 py-3">
            <Text className="text-white/60 mr-2">🔍</Text>
            <TextInput
              placeholder={t('home.search')}
              placeholderTextColor="rgba(255,255,255,0.6)"
              className="flex-1 text-white"
            />
          </View>
        </View>

        {/* Featured Daily */}
        <View className="px-6 mt-6">
          <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
            {t('home.featuredDaily')}
          </Text>
          <View className="bg-primary rounded-3xl p-5 flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-accent text-xs">📅</Text>
                <Text className="text-accent text-xs font-medium">Daily Rosary</Text>
              </View>
              <Text className="text-white text-lg font-bold mb-3">
                The Sorrowful Mysteries
              </Text>
              <TouchableOpacity
                className="bg-white rounded-full px-4 py-2 self-start flex-row items-center gap-1"
                onPress={() => router.push("/(tabs)/rosary")}
              >
                <Text className="text-primary font-semibold text-sm">▶ Play Now</Text>
              </TouchableOpacity>
            </View>
            <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center ml-4">
              <Text className="text-3xl">📿</Text>
            </View>
          </View>
        </View>

        {/* Daily Routine */}
        <View className="px-6 mt-6">
          <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
            {t('home.dailyRoutine')}
          </Text>
          <View className="flex-row gap-3">
            {[
              { icon: "📅", title: t('home.dailySchedules'), sub: t('home.planAndPersonalise'), route: "/schedule" },
              { icon: "🙏", title: t('home.dailyPrayers'), sub: t('home.startYourDay'), route: "/(tabs)/prayers" },
            ].map((item) => (
              <TouchableOpacity
                key={item.title}
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm"
                onPress={() => item.route && router.push(item.route as any)}
              >
                <Text className="text-2xl mb-2">{item.icon}</Text>
                <Text className="text-gray-800 font-semibold text-sm">{item.title}</Text>
                <Text className="text-gray-400 text-xs mt-1">{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spiritual Practice */}
        <View className="px-6 mt-6">
          <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
            {t('home.spiritualPractice')}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {[
              { icon: "🕯️", title: t('home.novenas'), sub: t('home.ninedays'), route: "/novenas" },
              { icon: "✝️", title: t('home.stationsOfCross'), sub: t('home.meditatePassion'), route: "/stations" },
              { icon: "📍", title: t('home.otherPrayers'), sub: t('home.sacredLocations'), route: "/other-prayers" },
              { icon: "💿", title: t('home.chaplets'), sub: t('home.meditativePrayer'), route: "/chaplets" },
            ].map((item) => (
              <TouchableOpacity
                key={item.title}
                className="bg-white rounded-2xl p-4 shadow-sm"
                style={{ width: "47%" }}
                onPress={() => router.push(item.route as any)}
              >
                <Text className="text-2xl mb-2">{item.icon}</Text>
                <Text className="text-gray-800 font-semibold text-sm">{item.title}</Text>
                <Text className="text-gray-400 text-xs mt-1">{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scripture Quote */}
        <View className="mx-6 mt-6 mb-10 bg-accent rounded-3xl p-6">
          <Text className="text-primary text-base italic text-center leading-6">
            "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures."
          </Text>
          <Text className="text-primary/60 text-xs text-center mt-3 font-semibold">
            PSALM 23:1-2
          </Text>
        </View>

      </ScrollView>

      <Footer />
    </View>
  );
}