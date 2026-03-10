import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Footer from "../../components/ui/Footer";

const settingsItems = [
  { id: "premium", icon: "👑", title: "Premium Subscription", badge: "Pro", arrow: true },
  { id: "privacy", icon: "🔒", title: "Privacy & Security", arrow: true },
  { id: "audio", icon: "🎧", title: "Audio Preferences", arrow: true },
  { id: "support", icon: "💬", title: "Contact Support", arrow: true },
];

const recentPrayers = [
  { id: "1", title: "Morning Prayer", duration: "5:30", emoji: "🌅" },
  { id: "2", title: "Gratitude Flow", duration: "4:45", emoji: "🙏" },
  { id: "3", title: "Evening Prayer", duration: "6:10", emoji: "🌙" },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-primary px-6 pt-14 pb-10">
        <View className="flex-row items-center justify-between mb-8">
          <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-white text-lg">🕊️</Text>
          </View>
          <TouchableOpacity className="bg-white/20 rounded-full px-4 py-2 flex-row items-center gap-2">
            <Text className="text-white text-sm font-medium">🇬🇧 English</Text>
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View className="items-center">
          <View className="relative mb-3">
            <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center">
              <Text className="text-4xl">👤</Text>
            </View>
            {/* Online indicator */}
            <View className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-primary" />
          </View>
          <Text className="text-white text-xl font-bold">Guest User</Text>
          <TouchableOpacity
            className="mt-2 bg-white/20 rounded-full px-4 py-1"
          >
            <Text className="text-accent text-sm">Sign in to sync →</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Recent Prayers */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between px-6 mb-3">
            <Text className="text-gray-800 font-bold text-base">Recent Prayers</Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {recentPrayers.map((prayer) => (
              <TouchableOpacity
                key={prayer.id}
                className="w-32 h-24 bg-primary/80 rounded-2xl items-center justify-center relative overflow-hidden"
              >
                <Text className="text-4xl">{prayer.emoji}</Text>
                <View className="absolute bottom-0 left-0 right-0 bg-black/30 px-2 py-1">
                  <Text className="text-white text-xs font-medium" numberOfLines={1}>
                    {prayer.title}
                  </Text>
                  <Text className="text-white/70 text-xs">{prayer.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Account Settings */}
        <View className="px-6 mt-6">
          <Text className="text-gray-800 font-bold text-base mb-3">
            Account Settings
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center px-4 py-4 ${
                  index < settingsItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="w-9 h-9 bg-accent rounded-full items-center justify-center mr-3">
                  <Text className="text-lg">{item.icon}</Text>
                </View>
                <Text className="flex-1 text-gray-800 font-medium">{item.title}</Text>
                {item.badge && (
                  <View className="bg-primary rounded-full px-2 py-0.5 mr-2">
                    <Text className="text-white text-xs font-semibold">{item.badge}</Text>
                  </View>
                )}
                {item.arrow && (
                  <Text className="text-gray-300 text-lg">›</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <View className="px-6 mt-4 mb-10">
          <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm">
            <View className="w-9 h-9 bg-red-50 rounded-full items-center justify-center mr-3">
              <Text className="text-lg">🚪</Text>
            </View>
            <Text className="text-red-400 font-medium flex-1">Sign Out</Text>
            <Text className="text-gray-300 text-lg">›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Footer />
    </View>
  );
}