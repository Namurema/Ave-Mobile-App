import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AudioPlayer from "../../components/audio/AudioPlayer";

const prayerContent: Record<string, {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  audioUrl?: string;
  sections: { heading: string; body: string }[];
}> = {
  guadalupe: {
    title: "Prayers to Our Lady of Guadalupe",
    subtitle: "Patroness of the Americas",
    icon: "",
    color: "#B91C1C",
    audioUrl: "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/our-lady-of-guadalupe.mp3",
    sections: [
      {
        heading: "First Prayer",
        body: "Our Lady Of Guadalupe, mystical rose, make intercession for the Holy Church; protect the Holy Father; help all those who invoke you in their needs.\n\nSince you are the ever Virgin Mary and Mother of the true God, obtain for us from your most holy Son Jesus the grace of keeping our faith, sweet hope in the midst of the difficulties of life, burning charity, and the precious gift of final perseverance. Amen.",
      },
      {
        heading: "Second Prayer",
        body: "O most gracious Virgin of Guadalupe, in your apparitions on Mount Tepeyac, you promised to show pity and compassion to all who, loving and trusting you, seek your help and protection.\n\nListen to our supplications and grant us consolation and relief. We are full of hope that, relying on your help, nothing can trouble or affect us. As you have remained with us through your admirable image, so now obtain for us the graces we need. Amen.",
      },
    ],
  },
  fatima: {
    title: "Our Lady of Fatima Novena Prayer",
    subtitle: "Our Lady of the Rosary of Fatima",
    icon: "",
    color: "#4A6FA5",
    audioUrl: "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/our-lady-of-fatima.mp3",
    sections: [
      {
        heading: "Novena Prayer",
        body: "Most Holy Virgin, who deigned to come to Fatima, to reveal the treasures of grace hidden in the recitation of the Rosary, inspire our hearts with a sincere love of this devotion, that meditating on the Mysteries of our Redemption recalled therein, we may obtain the conversion of sinners, the conversion of Russia, and (here name the other favors you are praying for), which we ask of you in this Novena, for the greater glory of God, for your own honor, and for the good of souls. Amen.",
      },
      {
        heading: "Closing",
        body: "Our Lady of the Rosary of Fatima,\nPray for us.",
      },
    ],
  },
  magnificat: {
    title: "Magnificat",
    subtitle: "The Canticle of Mary — Luke 1:46-55",
    icon: "",
    color: "#007C7C",
    audioUrl: "https://mwleayefcrmtzhqymlvf.supabase.co/storage/v1/object/public/audio/en/magnificant.mp3",
    sections: [
      {
        heading: "The Canticle of Mary",
        body: "My soul proclaims the greatness of the Lord,\nmy spirit rejoices in God, my savior,\nfor he has looked with favor on his lowly servant.\nFrom this day all generations will call me blessed:\nthe Almighty has done great things for me,\nand holy is his Name.\n\nHe has shown mercy on those who fear him\nin every generation.\n\nHe has shown the strength of his arm,\nhe has scattered the proud in their conceit.\n\nHe has cast down the mighty from their thrones,\nand has lifted up the lowly.\n\nHe has filled the hungry with good things,\nand the rich he has sent away empty.\n\nHe has come to the help of his servant Israel\nfor he has remembered his promise of mercy,\nthe promise he made to our fathers,\nto Abraham and his children forever.",
      },
      {
        heading: "Scripture Reference",
        body: "Luke 1:46-55",
      },
    ],
  },
};

export default function OtherPrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const prayer = prayerContent[id ?? ""];

  if (!prayer) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Prayer not found.</Text>
      </View>
    );
  }

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
            <Text className="text-white text-base">←</Text>
          </TouchableOpacity>
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-base">{prayer.icon}</Text>
          </View>
        </View>
        <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">
          Prayer
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">{prayer.title}</Text>
        <Text className="text-white/70 text-sm mt-1">{prayer.subtitle}</Text>

        {/* Audio Player */}
        {prayer.audioUrl && (
          <View className="mt-4">
            <AudioPlayer url={prayer.audioUrl} color={prayer.color} />
          </View>
        )}
      </View>

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