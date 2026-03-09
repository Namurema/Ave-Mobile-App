import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-navy-900">
      <Text className="text-gold-500 text-2xl font-bold">
        🙏 Ave
      </Text>
      <Text className="text-white text-sm mt-2 opacity-60">
        NativeWind is working!
      </Text>
    </View>
  );
}