import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Footer from "../components/ui/Footer";

const novenas = [
  { id: "1", title: "Novena to the Sacred Heart", days: 9, desc: "A powerful 9-day devotion to the love of Christ", icon: "", color: "#B91C1C" },
  { id: "2", title: "Novena to Our Lady of Perpetual Help", days: 9, desc: "Seek the intercession of Our Blessed Mother", icon: "", color: "#007C7C" },
  { id: "3", title: "Novena to St. Joseph", days: 9, desc: "Patron of workers, families and the Universal Church", icon: "", color: "#7C6500" },
  { id: "4", title: "Novena to the Holy Spirit", days: 9, desc: "Prepare your heart for the gifts of the Spirit", icon: "", color: "#4A6FA5" },
  { id: "5", title: "Divine Mercy Novena", days: 9, desc: "Trust in the ocean of Divine Mercy", icon: "", color: "#5C2D7C" },
  { id: "6", title: "Novena to St. Jude", days: 9, desc: "Patron saint of desperate cases and lost causes", icon: "", color: "#2D5C2D" },
  { id: "7", title: "Novena to the 13 Blessed Souls", days: 13, desc: "Jesus and His 12 Apostles — pray for 13 consecutive days", icon: "", color: "#5C2D7C" },
];

export default function NovenasScreen() {
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
          <Text className="text-white text-xl font-bold">Novenas</Text>
          <View className="w-8 h-8" />
        </View>
        <Text className="text-accent text-sm mt-1">9 days of devoted prayer</Text>
      </View>

      {/* Info Banner */}
      <View className="mx-6 mt-4 bg-accent rounded-2xl p-4 flex-row items-center gap-3">
        <Text className="text-2xl"></Text>
        <Text className="text-primary text-sm flex-1 leading-5">
          A novena is a prayer said over 9 consecutive days, asking for a special grace or favour.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 mt-4">
        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
          Available Novenas
        </Text>

        {novenas.map((novena) => (
          <TouchableOpacity
            key={novena.id}
            onPress={() => router.push(`/novena/${novena.id}`)}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center"
          >
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: novena.color + "15" }}
            >
              <Text className="text-2xl">{novena.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-sm" numberOfLines={1}>
                {novena.title}
              </Text>
              <Text className="text-gray-400 text-xs mt-1" numberOfLines={2}>
                {novena.desc}
              </Text>
              <View className="flex-row items-center mt-2 gap-2">
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: novena.color + "20" }}
                >
                  <Text className="text-xs font-semibold" style={{ color: novena.color }}>
                    {novena.days} Days
                  </Text>
                </View>
              </View>
            </View>
            <Text className="text-gray-300 text-lg ml-2">›</Text>
          </TouchableOpacity>
        ))}

        <View className="mb-10" />
      </ScrollView>

      <Footer />
    </View>
  );
}
