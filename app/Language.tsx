import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

const languages = [
  {
    code: "en",
    name: "English",
    description: "International liturgical standard",
    flag: "🇬🇧",
  },
  {
    code: "lg",
    name: "Oluganda",
    flag: "🇺🇬",
    description: "Luganda",
  },
  {
    code: "rny",
    name: "Orunyankore",
    flag: "🇺🇬",
    description: "Runyankore",
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState("en");

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-10">
      <StatusBar style="dark" />

      {/* Logo */}
      <View className="items-center mb-10">
        <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4">
          <Text className="text-3xl">🕊️</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-800">Welcome</Text>
        <Text className="text-gray-500 text-center mt-2 px-6">
          Please select your preferred language for prayers and daily devotionals.
        </Text>
      </View>

      {/* Language Options */}
      <View className="gap-4 mb-8">
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => setSelected(lang.code)}
            className={`flex-row items-center justify-between px-5 py-4 rounded-2xl border-2 ${
              selected === lang.code
                ? "border-primary bg-accent"
                : "border-gray-200 bg-white"
            }`}
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">{lang.flag}</Text>
              <View>
                <Text className="text-base font-semibold text-gray-800">
                  {lang.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {lang.description}
                </Text>
              </View>
            </View>
            {selected === lang.code && (
              <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-xs">✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/home")}
        className="w-full bg-primary rounded-full py-4 items-center"
      >
        <Text className="text-white text-lg font-semibold">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}