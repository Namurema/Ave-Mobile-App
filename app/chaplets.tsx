import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Footer from "../components/ui/Footer";

const chaplets = [
  {
    id: "1", title: "Divine Mercy Chaplet", icon: "✨", color: "#5C2D7C",
    beads: "5 decades", duration: "20 mins",
    desc: "Pray on ordinary Rosary beads. Begin with Our Father, Hail Mary, and Apostles' Creed.",
  },
  {
    id: "2", title: "Chaplet of St. Michael", icon: "⚔️", color: "#4A6FA5",
    beads: "9 salutations", duration: "15 mins",
    desc: "Honour the nine choirs of angels and seek the protection of St. Michael the Archangel.",
  },
  {
    id: "3", title: "Chaplet of the Immaculate Heart", icon: "💙", color: "#1E88E5",
    beads: "3 groups", duration: "10 mins",
    desc: "A devotion to our Blessed Mother's most pure and sorrowful heart.",
  },
  {
    id: "4", title: "Seven Sorrows Chaplet", icon: "💔", color: "#B91C1C",
    beads: "7 decades", duration: "25 mins",
    desc: "Meditate on the seven sorrows of the Blessed Virgin Mary.",
  },
  {
    id: "5", title: "Chaplet of St. Joseph", icon: "⚒️", color: "#7C6500",
    beads: "3 groups", duration: "12 mins",
    desc: "Seek the intercession of St. Joseph, patron of the Universal Church.",
  },
];

export default function ChapletsScreen() {
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
          <Text className="text-white text-xl font-bold">Chaplets</Text>
          <View className="w-8 h-8" />
        </View>
        <Text className="text-accent text-sm mt-1">Meditative bead prayers</Text>
      </View>

      {/* Info Banner */}
      <View className="mx-6 mt-4 bg-accent rounded-2xl p-4 flex-row items-center gap-3">
        <Text className="text-2xl">📿</Text>
        <Text className="text-primary text-sm flex-1 leading-5">
          Chaplets are shorter bead prayers focused on a particular devotion or mystery.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 mt-4">
        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
          Available Chaplets
        </Text>

        {chaplets.map((chaplet) => (
          <TouchableOpacity
            key={chaplet.id}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: chaplet.color + "15" }}
              >
                <Text className="text-2xl">{chaplet.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-sm">{chaplet.title}</Text>
                <View className="flex-row gap-3 mt-1">
                  <Text className="text-gray-400 text-xs">📿 {chaplet.beads}</Text>
                  <Text className="text-gray-400 text-xs">⏱ {chaplet.duration}</Text>
                </View>
              </View>
              <Text className="text-gray-300 text-lg">›</Text>
            </View>
            <Text className="text-gray-500 text-xs leading-4">{chaplet.desc}</Text>

            <TouchableOpacity
              onPress={() => router.push(`/chaplet/${chaplet.id}`)}
              className="mt-3 rounded-full py-2.5 items-center"
              style={{ backgroundColor: chaplet.color }}
            >
              <Text className="text-white text-xs font-semibold">▶ Begin Chaplet</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View className="mb-10" />
      </ScrollView>

      <Footer />
    </View>
  );
}
