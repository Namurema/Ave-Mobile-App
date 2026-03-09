import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary items-center justify-between py-20 px-6">
      <StatusBar style="light" />

      {/* Logo */}
      <View className="flex-1 items-center justify-center gap-6">
        <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center shadow-lg">
          <Text className="text-5xl">🕊️</Text>
        </View>
        <Text className="text-white text-5xl font-bold tracking-wide">
          Ave
        </Text>
        <Text className="text-accent text-center text-base opacity-80 px-8">
          Your companion for daily prayers and spiritual devotion
        </Text>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        onPress={() => router.push("/Language")}
        className="w-full bg-white rounded-full py-4 items-center flex-row justify-center gap-2"
      >
        <Text className="text-primary text-lg font-semibold">
          Get Started →
        </Text>
      </TouchableOpacity>
    </View>
  );
}