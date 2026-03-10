import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Footer from "../components/ui/Footer";

const stations = [
  { number: 1, title: "Jesus is condemned to death", reflection: "Pilate hands Jesus over to be crucified despite knowing He is innocent." },
  { number: 2, title: "Jesus takes up His Cross", reflection: "Jesus accepts the heavy cross, bearing the weight of our sins with love." },
  { number: 3, title: "Jesus falls the first time", reflection: "Weakened by suffering, Jesus falls — yet rises to continue His journey for us." },
  { number: 4, title: "Jesus meets His Mother", reflection: "A moment of profound sorrow as Mary sees her Son carrying the cross." },
  { number: 5, title: "Simon of Cyrene helps Jesus", reflection: "Simon is compelled to help — reminding us to carry each other's burdens." },
  { number: 6, title: "Veronica wipes the face of Jesus", reflection: "An act of compassion leaves the image of Christ's face on her veil." },
  { number: 7, title: "Jesus falls the second time", reflection: "Jesus falls again, showing the depth of His suffering and love for us." },
  { number: 8, title: "Jesus meets the women of Jerusalem", reflection: "Jesus consoles the weeping women, calling us to weep for our sins." },
  { number: 9, title: "Jesus falls the third time", reflection: "Near Calvary, Jesus falls once more — yet His love does not waver." },
  { number: 10, title: "Jesus is stripped of His garments", reflection: "Jesus is humiliated, stripped of all dignity, for our redemption." },
  { number: 11, title: "Jesus is nailed to the Cross", reflection: "The nails pierce His hands and feet — driven by our sins, held by His love." },
  { number: 12, title: "Jesus dies on the Cross", reflection: "\"It is finished.\" The ultimate sacrifice is made for all of humanity." },
  { number: 13, title: "Jesus is taken down from the Cross", reflection: "Mary receives the body of her Son — a mother's grief beyond words." },
  { number: 14, title: "Jesus is laid in the tomb", reflection: "The tomb is sealed, but death does not have the final word." },
];

export default function StationsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: "#5C2D2D" }}>
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Stations of the Cross</Text>
          <View className="w-8 h-8" />
        </View>
        <Text className="text-yellow-200 text-sm mt-1">14 stations — meditate on the passion</Text>
      </View>

      {/* Info Banner */}
      <View className="mx-6 mt-4 bg-red-50 rounded-2xl p-4 flex-row items-center gap-3">
        <Text className="text-2xl">✝️</Text>
        <Text className="text-red-900 text-sm flex-1 leading-5">
          Walk with Jesus on the path to Calvary. Pause at each station to pray and reflect.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 mt-4">
        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
          The 14 Stations
        </Text>

        {stations.map((station, index) => (
          <TouchableOpacity
            key={station.number}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-start"
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-4 mt-0.5"
              style={{ backgroundColor: "#5C2D2D15" }}
            >
              <Text className="font-bold text-sm" style={{ color: "#5C2D2D" }}>
                {station.number}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-sm">
                {station.title}
              </Text>
              <Text className="text-gray-400 text-xs mt-1 leading-4" numberOfLines={2}>
                {station.reflection}
              </Text>
            </View>
            <Text className="text-gray-300 text-lg ml-2">›</Text>
          </TouchableOpacity>
        ))}

        {/* Begin Full Walk Button */}
        <TouchableOpacity
          className="rounded-full py-4 items-center mt-2 mb-10"
          style={{ backgroundColor: "#5C2D2D" }}
        >
          <Text className="text-white text-base font-semibold">Begin Full Walk</Text>
        </TouchableOpacity>
      </ScrollView>

      <Footer />
    </View>
  );
}
