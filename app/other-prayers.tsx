import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Footer from "../components/ui/Footer";

const categories = [
  {
    id: "marian",
    title: "Marian Prayers",
    icon: "👑",
    color: "#4A6FA5",
    prayers: [
      { id: "m1", title: "The Angelus", duration: "3 mins" },
      { id: "m2", title: "Regina Caeli", duration: "2 mins" },
      { id: "m3", title: "Memorare", duration: "2 mins" },
      { id: "m4", title: "Salve Regina", duration: "2 mins" },
    ],
  },
  {
    id: "traditional",
    title: "Traditional Prayers",
    icon: "📖",
    color: "#007C7C",
    prayers: [
      { id: "t1", title: "Act of Contrition", duration: "2 mins" },
      { id: "t2", title: "Act of Faith", duration: "2 mins" },
      { id: "t3", title: "Act of Hope", duration: "2 mins" },
      { id: "t4", title: "Act of Love", duration: "2 mins" },
    ],
  },
  {
    id: "saints",
    title: "Prayers to Saints",
    icon: "⭐",
    color: "#7C6500",
    prayers: [
      { id: "s1", title: "St. Michael the Archangel", duration: "2 mins" },
      { id: "s2", title: "Prayer to Guardian Angel", duration: "2 mins" },
      { id: "s3", title: "Prayer to St. Francis", duration: "3 mins" },
      { id: "s4", title: "Litany of the Saints", duration: "8 mins" },
    ],
  },
  {
    id: "eucharistic",
    title: "Eucharistic Prayers",
    icon: "🍞",
    color: "#8B4513",
    prayers: [
      { id: "e1", title: "Anima Christi", duration: "2 mins" },
      { id: "e2", title: "Prayer before Communion", duration: "2 mins" },
      { id: "e3", title: "Prayer after Communion", duration: "3 mins" },
      { id: "e4", title: "Spiritual Communion", duration: "2 mins" },
    ],
  },
  {
    id: "apparitions",
    title: "Marian Apparitions",
    icon: "🌹",
    color: "#B91C1C",
    prayers: [
      { id: "guadalupe", title: "Our Lady of Guadalupe", duration: "3 mins" },
      { id: "fatima", title: "Our Lady of Fatima Novena", duration: "3 mins" },
      { id: "magnificat", title: "Magnificat", duration: "2 mins" },
    ],
  },
];

export default function OtherPrayersScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
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
          <Text className="text-white text-xl font-bold">Other Prayers</Text>
          <View className="w-8 h-8" />
        </View>
        <Text className="text-accent text-sm mt-1">Sacred prayers from Catholic tradition</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 mt-4">

        {categories.map((category) => (
          <View key={category.id} className="mb-6">
            {/* Category Header */}
            <View className="flex-row items-center gap-2 mb-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: category.color + "20" }}
              >
                <Text className="text-base">{category.icon}</Text>
              </View>
              <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                {category.title}
              </Text>
            </View>

            {/* Prayer items */}
            <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {category.prayers.map((prayer, index) => (
                <View key={prayer.id}>
                  <TouchableOpacity
                    onPress={() =>
                      ["guadalupe", "fatima", "magnificat"].includes(prayer.id)
                        ? router.push(`/other-prayer/${prayer.id}`)
                        : undefined
                    }
                    className="px-4 py-4 flex-row items-center"
                  >
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: category.color + "15" }}
                    >
                      <Text className="text-base">{category.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-semibold text-sm">{prayer.title}</Text>
                      <Text className="text-gray-400 text-xs mt-0.5">⏱ {prayer.duration}</Text>
                    </View>
                    <TouchableOpacity
                      className="w-8 h-8 rounded-full items-center justify-center mr-2"
                      style={{ backgroundColor: category.color }}
                    >
                      <Text className="text-white text-xs">▶</Text>
                    </TouchableOpacity>
                    <Text className="text-gray-300 text-lg">›</Text>
                  </TouchableOpacity>
                  {index < category.prayers.length - 1 && (
                    <View className="h-px bg-gray-100 mx-4" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View className="mb-10" />
      </ScrollView>

      <Footer />
    </View>
  );
}
