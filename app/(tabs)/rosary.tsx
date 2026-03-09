import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const mysteries = {
  0: { // Sunday
    name: "Glorious Mysteries",
    day: "Sunday",
    color: "#007C7C",
    emoji: "✨",
    mysteries: [
      { number: 1, title: "The Resurrection", virtue: "Faith" },
      { number: 2, title: "The Ascension", virtue: "Hope" },
      { number: 3, title: "Descent of the Holy Spirit", virtue: "Love of God" },
      { number: 4, title: "The Assumption", virtue: "Grace of a Happy Death" },
      { number: 5, title: "Coronation of Mary", virtue: "Trust in Mary's Intercession" },
    ],
  },
  1: { // Monday
    name: "Joyful Mysteries",
    day: "Monday",
    color: "#007C7C",
    emoji: "🌸",
    mysteries: [
      { number: 1, title: "The Annunciation", virtue: "Humility" },
      { number: 2, title: "The Visitation", virtue: "Love of Neighbour" },
      { number: 3, title: "The Nativity", virtue: "Poverty & Detachment" },
      { number: 4, title: "The Presentation", virtue: "Obedience" },
      { number: 5, title: "Finding in the Temple", virtue: "Piety" },
    ],
  },
  2: { // Tuesday
    name: "Sorrowful Mysteries",
    day: "Tuesday",
    color: "#5C2D2D",
    emoji: "✝️",
    mysteries: [
      { number: 1, title: "The Agony in the Garden", virtue: "Contrition" },
      { number: 2, title: "The Scourging at the Pillar", virtue: "Purity" },
      { number: 3, title: "The Crowning with Thorns", virtue: "Courage" },
      { number: 4, title: "Carrying of the Cross", virtue: "Patience" },
      { number: 5, title: "The Crucifixion", virtue: "Self-denial" },
    ],
  },
  3: { // Wednesday
    name: "Glorious Mysteries",
    day: "Wednesday",
    color: "#007C7C",
    emoji: "✨",
    mysteries: [
      { number: 1, title: "The Resurrection", virtue: "Faith" },
      { number: 2, title: "The Ascension", virtue: "Hope" },
      { number: 3, title: "Descent of the Holy Spirit", virtue: "Love of God" },
      { number: 4, title: "The Assumption", virtue: "Grace of a Happy Death" },
      { number: 5, title: "Coronation of Mary", virtue: "Trust in Mary's Intercession" },
    ],
  },
  4: { // Thursday
    name: "Luminous Mysteries",
    day: "Thursday",
    color: "#7C6500",
    emoji: "💡",
    mysteries: [
      { number: 1, title: "Baptism of Jesus", virtue: "Openness to the Holy Spirit" },
      { number: 2, title: "Wedding at Cana", virtue: "To Jesus through Mary" },
      { number: 3, title: "Proclamation of the Kingdom", virtue: "Repentance & Trust" },
      { number: 4, title: "The Transfiguration", virtue: "Desire for Holiness" },
      { number: 5, title: "Institution of the Eucharist", virtue: "Eucharistic Adoration" },
    ],
  },
  5: { // Friday
    name: "Sorrowful Mysteries",
    day: "Friday",
    color: "#5C2D2D",
    emoji: "✝️",
    mysteries: [
      { number: 1, title: "The Agony in the Garden", virtue: "Contrition" },
      { number: 2, title: "The Scourging at the Pillar", virtue: "Purity" },
      { number: 3, title: "The Crowning with Thorns", virtue: "Courage" },
      { number: 4, title: "Carrying of the Cross", virtue: "Patience" },
      { number: 5, title: "The Crucifixion", virtue: "Self-denial" },
    ],
  },
  6: { // Saturday
    name: "Joyful Mysteries",
    day: "Saturday",
    color: "#007C7C",
    emoji: "🌸",
    mysteries: [
      { number: 1, title: "The Annunciation", virtue: "Humility" },
      { number: 2, title: "The Visitation", virtue: "Love of Neighbour" },
      { number: 3, title: "The Nativity", virtue: "Poverty & Detachment" },
      { number: 4, title: "The Presentation", virtue: "Obedience" },
      { number: 5, title: "Finding in the Temple", virtue: "Piety" },
    ],
  },
};

export default function RosaryScreen() {
  const router = useRouter();
  const today = new Date().getDay();
  const todaysMystery = mysteries[today as keyof typeof mysteries];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: todaysMystery.color }}>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white/70 text-sm font-medium uppercase tracking-widest">
            Daily Rosary
          </Text>
          <TouchableOpacity className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-white text-sm">↺</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-accent text-sm font-medium mb-1">
          {dayNames[today].toUpperCase()}
        </Text>
        <Text className="text-white text-3xl font-bold">
          {todaysMystery.name}
        </Text>
        <Text className="text-white/70 text-sm mt-2">
          {todaysMystery.emoji} Focus on the virtues of each mystery
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">

        {/* Mysteries List */}
        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
          The 5 Mysteries
        </Text>

        {todaysMystery.mysteries.map((mystery, index) => (
          <TouchableOpacity
            key={mystery.number}
            onPress={() => router.push(`/prayer/${mystery.number}`)}
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: todaysMystery.color + "20" }}
            >
              <Text className="font-bold" style={{ color: todaysMystery.color }}>
                {mystery.number}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">
                {mystery.title}
              </Text>
              <Text className="text-gray-400 text-sm mt-0.5">
                Virtue: {mystery.virtue}
              </Text>
            </View>
            <Text className="text-gray-300 text-lg">›</Text>
          </TouchableOpacity>
        ))}

        {/* Begin Session Button */}
        <TouchableOpacity
          className="rounded-full py-4 items-center mt-4 mb-10"
          style={{ backgroundColor: todaysMystery.color }}
        >
          <Text className="text-white text-lg font-semibold">
            Begin Full Session
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}