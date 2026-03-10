import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AudioPlayer from "../../components/audio/AudioPlayer";

const prayerContent: Record<string, {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  sections: { heading: string; body: string }[];
}> = {
  morning: {
    title: "Morning Prayers",
    subtitle: "Begin your day with grace",
    icon: "🌅",
    color: "#007C7C",
    sections: [
      {
        heading: "Daily Offering",
        body: "O Jesus, through the Immaculate Heart of Mary, I offer you my prayers, works, joys and sufferings of this day, for all the intentions of your Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, in reparation for sin, for the intentions of all my friends and associates, and in particular for the intentions of the Holy Father.",
      },
      {
        heading: "Act of Faith",
        body: "My God, I believe in you and all that you have taught, because you have said it, and your word is true.",
      },
      {
        heading: "Act of Hope",
        body: "I hope in your promise of Eternal life and I ask for your mercy and strength this day.",
      },
      {
        heading: "Act of Charity",
        body: "O MY God, I love you with my whole heart and above all things, because you are infinitely good and perfect; and I love my neighbours as myself for love of you. Grant that I may love you more and more in this life, and in the next for all eternity.",
      },
      {
        heading: "Other Prayers",
        body: "Merciful Jesus, I consecrate myself today and always to Your Most Sacred Heart.\n\nMost Sacred Heart of Jesus I implore, that I may ever love you more and more.\n\nMost Sacred Heart of Jesus, I trust in you!\n\nMost Sacred Heart of Jesus, have mercy on us!\n\nSacred Heart of Jesus, I believe in your love for me.\n\nJesus, meek and humble of heart, make my heart like your heart.",
      },
    ],
  },
  midday: {
    title: "Mid-Day Prayers",
    subtitle: "A pause for peace and the divine",
    icon: "☀️",
    color: "#7C6500",
    sections: [
      {
        heading: "The Angelus",
        body: "The Angel of the Lord declared to Mary:\nAnd she conceived of the Holy Spirit. Hail Mary...\n\nBehold the handmaid of the Lord:\nBe it done to me according to your word. Hail Mary...\n\nAnd the Word was made flesh:\nAnd dwelt among us. Hail Mary...\n\nPray for us, O holy Mother of God.\nThat we may be made worthy of the promise of Christ.",
      },
      {
        heading: "Let Us Pray",
        body: "Pour forth, we beseech you, O Lord, your grace into our hearts that we, to whom the incarnation of Christ, your Son, was made known by the message of an angel, may by His passion and cross be brought to the glory of His resurrection, through the same Christ our Lord. Amen.",
      },
      {
        heading: "Regina Caeli",
        body: "(During the Easter Season, from Easter to Pentecost, this prayer replaces the Angelus.)\n\nQueen of heaven rejoice, alleluia: for He whom you merited to bear, alleluia. Has risen, as He said, alleluia: pray for us to God, alleluia.\n\nV. Rejoice and be glad, O Virgin Mary, alleluia.\nR. Because the Lord has truly risen, alleluia.",
      },
      {
        heading: "Let Us Pray",
        body: "O God, by the resurrection of Your Son, our Lord Jesus Christ, You have willed to make glad the whole world. Grant, we beseech You, that through His Mother, the Virgin Mary, we may lay hold of the joys of eternal life. We ask this through the same Christ our Lord. Amen.",
      },
    ],
  },
  night: {
    title: "Night Prayers",
    subtitle: "Gratitude, rest, and reflection",
    icon: "🌙",
    color: "#1a1a2e",
    sections: [
      {
        heading: "Prayer of Thanksgiving",
        body: "O MY God, I thank you for all the benefits which I have received from you this day. Give me light to see what sins I have committed, and grant me grace to be truly sorry for them.",
      },
      {
        heading: "Act of Contrition",
        body: "O my God, because you are so good, I am very sorry that I have sinned against you. With the help of your grace I will try not to sin again.",
      },
      {
        heading: "All Praise to You",
        body: "All praise to you, O God, this night\nfor the blessings of the light.\nKeep us, we pray, O King of kings.\nBeneath your own almighty wings.\n\nForgive us, Lord, through Christ Your Son,\nwhatever wrong this day we've done.\nYour peace give to the world, O Lord,\nThat we might live in one accord.\n\nEnlighten us, O blessed light,\nand give us rest throughout this night.\nO strengthen us, that for your sake,\nWe all may serve you when we wake.",
      },
    ],
  },
};

export default function DailyPrayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const prayer = prayerContent[id ?? "morning"] ?? prayerContent["morning"];

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: prayer.color }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-base">{prayer.icon}</Text>
          </View>
        </View>
        <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">
          Daily Prayers
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">{prayer.title}</Text>
        <Text className="text-white/70 text-sm mt-1">{prayer.subtitle}</Text>
      </View>

      {/* Audio Player */}
      <AudioPlayer url={undefined} color={prayer.color} />

      {/* Prayer Sections */}
      <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
        {prayer.sections.map((section, index) => (
          <View key={index} className="mb-6">
            <Text
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: prayer.color }}
            >
              {section.heading}
            </Text>
            <Text className="text-gray-700 text-base leading-7">{section.body}</Text>
          </View>
        ))}

        <View className="mb-12" />
      </ScrollView>
    </View>
  );
}
