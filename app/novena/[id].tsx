import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AudioPlayer from "../../components/audio/AudioPlayer";

const novenaContent: Record<string, {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  audioUrl?: string;
  sections: { heading: string; body: string }[];
}> = {
  "7": {
    title: "Novena to the 13 Blessed Souls",
    subtitle: "Jesus & His 12 Apostles — 13 consecutive days",
    icon: "",
    color: "#5C2D7C",
    audioUrl: "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/novena-13-blessed-souls.mp3",
    sections: [
      {
        heading: "Opening Prayer (Read Twice)",
        body: "Oh my 13 Blessed souls so wise and understanding, I ask you for the Love of God that my request be answered.\n\nOh my 13 Blessed souls so wise and understanding, I ask you for the Love of God that my request be answered.\n\nOf you I ask for the sake of the blood that Jesus shed that my request be answered.",
      },
      {
        heading: "Prayer to Our Lord",
        body: "My Lord Jesus Christ that your protection wrap me with your arms. Guard me with your eyes. O God of kindness you have been my defender in life and death. I ask that you free me from the difficulties that torment me.",
      },
      {
        heading: "Closing Prayer",
        body: "My 13 blessed souls so wise and understanding having received the grace I seek from you (state your request) I will be devoted to you.",
      },
      {
        heading: "Instruction",
        body: "Say 13 Our Father's and 13 Hail Mary's for 13 consecutive days.",
      },
    ],
  },
};

export default function NovenaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const novena = novenaContent[id ?? ""];

  if (!novena) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Novena not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: novena.color }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white text-base">←</Text>
          </TouchableOpacity>
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-base">{novena.icon}</Text>
          </View>
        </View>
        <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">
          Novena
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">{novena.title}</Text>
        <Text className="text-white/70 text-sm mt-1">{novena.subtitle}</Text>

        {/* Audio Player */}
        {novena.audioUrl && (
          <View className="mt-4">
            <AudioPlayer url={novena.audioUrl} color={novena.color} />
          </View>
        )}
      </View>

      {/* Prayer Sections */}
      <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
        {novena.sections.map((section, index) => (
          <View key={index} className="mb-6">
            <Text
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: novena.color }}
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