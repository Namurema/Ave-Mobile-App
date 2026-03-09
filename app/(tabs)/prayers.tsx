import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const dailyRoutine = [
  {
    id: "morning",
    title: "Morning Prayers",
    subtitle: "Start your day with grace",
    time: "6:00 AM",
    icon: "🌅",
    duration: "10 mins",
  },
  {
    id: "midday",
    title: "Midday Prayers",
    subtitle: "A pause for peace & divine",
    time: "12:00 PM",
    icon: "☀️",
    duration: "5 mins",
  },
  {
    id: "night",
    title: "Night Prayers",
    subtitle: "Gratitude, rest, and...",
    time: "9:00 PM",
    icon: "🌙",
    duration: "8 mins",
  },
];

const categories = [
  { id: "novenas", title: "Novenas", icon: "🕯️", count: 12 },
  { id: "litanies", title: "Litanies", icon: "📜", count: 8 },
  { id: "chaplets", title: "Chaplets", icon: "📿", count: 6 },
  { id: "stations", title: "Stations of the Cross", icon: "✝️", count: 14 },
  { id: "afternoon", title: "Afternoon Prayers", icon: "🌤️", count: 5 },
];

export default function PrayersScreen() {
  const router = useRouter();
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
          <Text className="text-white text-2xl font-bold">Daily Prayers</Text>
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
            Daily Routine
          </Text>

          {dailyRoutine.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
            >
              <View className="w-12 h-12 bg-accent rounded-2xl items-center justify-center mr-4">
                <Text className="text-2xl">{item.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-sm mt-0.5">
                  {item.subtitle}
                </Text>
              </View>
              <View className="items-end gap-1">
                <Text className="text-gray-400 text-xs">{item.duration}</Text>
                <TouchableOpacity
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#007C7C" }}
                >
                  <Text className="text-white text-xs">▶</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prayer Categories */}
        <View className="px-6 mt-6">
          <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
            All Prayers
          </Text>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
            >
              <View className="w-12 h-12 bg-accent rounded-2xl items-center justify-center mr-4">
                <Text className="text-2xl">{cat.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">
                  {cat.title}
                </Text>
                <Text className="text-gray-400 text-sm mt-0.5">
                  {cat.count} prayers
                </Text>
              </View>
              <Text className="text-gray-300 text-lg">›</Text>
            </TouchableOpacity>
          ))}
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