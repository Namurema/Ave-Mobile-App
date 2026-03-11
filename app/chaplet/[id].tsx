import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AudioPlayer from "../../components/audio/AudioPlayer";

const chapletContent: Record<string, {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  audioUrl: string;
  sections: { heading: string; body: string }[];
}> = {
  "1": {
    title: "Divine Mercy Chaplet",
    subtitle: "Pray on ordinary Rosary beads",
    icon: "✨",
    color: "#5C2D7C",
    audioUrl: "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/divine-mercy-chaplet.mp3",
    sections: [
      {
        heading: "Opening Prayer",
        body: "You expired Jesus,\nBut the source of life gushed forth for souls,\nand the ocean of mercy opened up for the whole world,\nO Fount of Life, unfathomable Divine Mercy,\nenvelop the whole world and empty Yourself out upon us.",
      },
      {
        heading: "O Blood and Water",
        body: "O Blood and Water\nwhich gushed forth from the Heart of Jesus\nas a fount of mercy for us, I trust in you!\n\nHoly God, Holy Mighty One, Holy Immortal One,\nHave Mercy on us and on the whole world.\n(Say 3 times) Amen.\n\nJesus, King of Mercy, I trust in you!",
      },
      {
        heading: "Our Father & Hail Mary",
        body: "Leader: Our Father…\nAll together: Give us this day…\n\nLeader: Hail Mary…\nAll together: Holy Mary…",
      },
      {
        heading: "The Apostles' Creed",
        body: "I believe in God, the Father almighty, the creator of heaven and earth and in Jesus Christ, His only Son, Our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried.\n\nHe descended into hell. On the third day He rose again from the dead. He ascended into heaven and sits at the right hand of God, the Father almighty. From thence He shall come to judge the living and the dead.\n\nI believe in the Holy Spirit, the holy Catholic Church, the Communion of Saints, the forgiveness of sins, the resurrection of the body and life everlasting. Amen.",
      },
      {
        heading: "On the Large Bead (Before Each Decade)",
        body: "All together: Eternal Father, I offer you the Body and Blood, Soul and Divinity of Your dearly beloved Son, Our Lord Jesus Christ in atonement for our sins and those of the whole world.",
      },
      {
        heading: "On the Ten Small Beads (Each Decade)",
        body: "Leader: For the sake of His sorrowful passion\nAll together: Have mercy on us and on the whole world.",
      },
      {
        heading: "Concluding Prayer",
        body: "Holy God, Holy Mighty One, Holy Immortal One,\nHave mercy on us and on the whole world.\n(Say three times) Amen.\n\nJesus, King of Mercy, I trust in you! (say 3 times)",
      },
    ],
  },
};

export default function ChapletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const chaplet = chapletContent[id ?? ""];

  if (!chaplet) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Chaplet not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: chaplet.color }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white text-base">←</Text>
          </TouchableOpacity>
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-base">{chaplet.icon}</Text>
          </View>
        </View>
        <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">
          Chaplet
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">{chaplet.title}</Text>
        <Text className="text-white/70 text-sm mt-1">{chaplet.subtitle}</Text>

        {/* Audio Player */}
        <View className="mt-4">
          <AudioPlayer url={chaplet.audioUrl} color={chaplet.color} />
        </View>
      </View>

      {/* Prayer Sections */}
      <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
        {chaplet.sections.map((section, index) => (
          <View key={index} className="mb-6">
            <Text
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: chaplet.color }}
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