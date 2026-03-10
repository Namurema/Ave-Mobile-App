import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AudioPlayer from "../../components/audio/AudioPlayer";

const prayerTexts: Record<string, { title: string; day: string; intro: string; prayers: { title: string; text: string }[] }> = {
  "1": {
    title: "The Agony in the Garden",
    day: "TUESDAY & FRIDAY",
    intro: "Focus on the virtue of true contrition for our sins.",
    prayers: [
      {
        title: "The Apostles' Creed",
        text: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried...",
      },
      {
        title: "Our Father",
        text: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us...",
      },
      {
        title: "Hail Mary",
        text: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      },
      {
        title: "Glory Be",
        text: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
      },
    ],
  },
  "2": {
    title: "The Scourging at the Pillar",
    day: "TUESDAY & FRIDAY",
    intro: "Focus on the virtue of purity.",
    prayers: [
      {
        title: "Our Father",
        text: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses...",
      },
      {
        title: "Hail Mary (×10)",
        text: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      },
      {
        title: "Glory Be",
        text: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
      },
    ],
  },
};

export default function PrayerOutputScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const prayer = prayerTexts[id as string] ?? prayerTexts["1"];

  return (
    <View className="flex-1 bg-white">
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
          <TouchableOpacity className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-white text-sm">⤴</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-accent text-xs font-semibold tracking-widest">
          {prayer.day}
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">
          {prayer.title}
        </Text>
        <Text className="text-white/70 text-sm mt-2">{prayer.intro}</Text>
      </View>

      {/* Audio Player */}
      <AudioPlayer
        url={undefined}
        color="#007C7C"
      />

      {/* Prayer Text */}
      <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
        {prayer.prayers.map((p, index) => (
          <View key={index} className="mb-6">
            <Text className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
              {p.title}
            </Text>
            <Text className="text-gray-700 text-base leading-7">
              {p.text}
            </Text>
          </View>
        ))}

        {/* Start Session Button */}
        <TouchableOpacity className="bg-primary rounded-full py-4 items-center mb-10">
          <Text className="text-white text-lg font-semibold">Start Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}