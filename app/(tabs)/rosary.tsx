import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Footer from "../../components/ui/Footer";

export default function RosaryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const today = new Date().getDay();
  const [expandedMystery, setExpandedMystery] = useState<number | null>(null);

  const mysteries = {
    0: { name: t('rosary.glorious'), day: "Sunday", color: "#007C7C", emoji: "✨", mysteries: [
      { number: 1, title: "The Resurrection", virtue: "Faith", meditation: "Meditate on the glorious resurrection of Jesus Christ from the dead, and how He conquered sin and death." },
      { number: 2, title: "The Ascension", virtue: "Hope", meditation: "Meditate on Jesus ascending into heaven forty days after His resurrection, promising to return." },
      { number: 3, title: "Descent of the Holy Spirit", virtue: "Love of God", meditation: "Meditate on the Holy Spirit descending upon Mary and the Apostles at Pentecost." },
      { number: 4, title: "The Assumption", virtue: "Grace of a Happy Death", meditation: "Meditate on the Blessed Virgin Mary being assumed body and soul into heavenly glory." },
      { number: 5, title: "Coronation of Mary", virtue: "Trust in Mary's Intercession", meditation: "Meditate on the Blessed Virgin Mary being crowned Queen of Heaven and Earth." },
    ]},
    1: { name: t('rosary.joyful'), day: "Monday", color: "#007C7C", emoji: "🌸", mysteries: [
      { number: 1, title: "The Annunciation", virtue: "Humility", meditation: "Meditate on the Angel Gabriel announcing to Mary that she would conceive and bear the Son of God." },
      { number: 2, title: "The Visitation", virtue: "Love of Neighbour", meditation: "Meditate on Mary visiting her cousin Elizabeth, who was pregnant with John the Baptist." },
      { number: 3, title: "The Nativity", virtue: "Poverty & Detachment", meditation: "Meditate on the birth of Jesus Christ in a humble stable in Bethlehem." },
      { number: 4, title: "The Presentation", virtue: "Obedience", meditation: "Meditate on Mary and Joseph presenting the infant Jesus in the Temple in Jerusalem." },
      { number: 5, title: "Finding in the Temple", virtue: "Piety", meditation: "Meditate on the twelve-year-old Jesus being found in the Temple, sitting among the teachers." },
    ]},
    2: { name: t('rosary.sorrowful'), day: "Tuesday", color: "#5C2D2D", emoji: "✝️", mysteries: [
      { number: 1, title: "The Agony in the Garden", virtue: "Contrition", meditation: "Meditate on Jesus praying in the Garden of Gethsemane on the eve of His crucifixion." },
      { number: 2, title: "The Scourging at the Pillar", virtue: "Purity", meditation: "Meditate on Jesus being tied to a pillar and scourged by Roman soldiers." },
      { number: 3, title: "The Crowning with Thorns", virtue: "Courage", meditation: "Meditate on Jesus being crowned with thorns and mocked as King of the Jews." },
      { number: 4, title: "Carrying of the Cross", virtue: "Patience", meditation: "Meditate on Jesus carrying His cross through the streets of Jerusalem to Calvary." },
      { number: 5, title: "The Crucifixion", virtue: "Self-denial", meditation: "Meditate on Jesus being nailed to the cross and dying for our sins." },
    ]},
    3: { name: t('rosary.glorious'), day: "Wednesday", color: "#007C7C", emoji: "✨", mysteries: [
      { number: 1, title: "The Resurrection", virtue: "Faith", meditation: "Meditate on the glorious resurrection of Jesus Christ from the dead." },
      { number: 2, title: "The Ascension", virtue: "Hope", meditation: "Meditate on Jesus ascending into heaven forty days after His resurrection." },
      { number: 3, title: "Descent of the Holy Spirit", virtue: "Love of God", meditation: "Meditate on the Holy Spirit descending upon Mary and the Apostles at Pentecost." },
      { number: 4, title: "The Assumption", virtue: "Grace of a Happy Death", meditation: "Meditate on the Blessed Virgin Mary being assumed body and soul into heavenly glory." },
      { number: 5, title: "Coronation of Mary", virtue: "Trust in Mary's Intercession", meditation: "Meditate on the Blessed Virgin Mary being crowned Queen of Heaven and Earth." },
    ]},
    4: { name: t('rosary.luminous'), day: "Thursday", color: "#7C6500", emoji: "💡", mysteries: [
      { number: 1, title: "Baptism of Jesus", virtue: "Openness to the Holy Spirit", meditation: "Meditate on the baptism of Jesus in the Jordan River by John the Baptist." },
      { number: 2, title: "Wedding at Cana", virtue: "To Jesus through Mary", meditation: "Meditate on Jesus performing His first miracle at the wedding feast in Cana." },
      { number: 3, title: "Proclamation of the Kingdom", virtue: "Repentance & Trust", meditation: "Meditate on Jesus proclaiming the Kingdom of God and calling all to repentance." },
      { number: 4, title: "The Transfiguration", virtue: "Desire for Holiness", meditation: "Meditate on Jesus being transfigured on Mount Tabor before Peter, James and John." },
      { number: 5, title: "Institution of the Eucharist", virtue: "Eucharistic Adoration", meditation: "Meditate on Jesus instituting the Holy Eucharist at the Last Supper." },
    ]},
    5: { name: t('rosary.sorrowful'), day: "Friday", color: "#5C2D2D", emoji: "✝️", mysteries: [
      { number: 1, title: "The Agony in the Garden", virtue: "Contrition", meditation: "Meditate on Jesus praying in the Garden of Gethsemane on the eve of His crucifixion." },
      { number: 2, title: "The Scourging at the Pillar", virtue: "Purity", meditation: "Meditate on Jesus being tied to a pillar and scourged by Roman soldiers." },
      { number: 3, title: "The Crowning with Thorns", virtue: "Courage", meditation: "Meditate on Jesus being crowned with thorns and mocked as King of the Jews." },
      { number: 4, title: "Carrying of the Cross", virtue: "Patience", meditation: "Meditate on Jesus carrying His cross through the streets of Jerusalem to Calvary." },
      { number: 5, title: "The Crucifixion", virtue: "Self-denial", meditation: "Meditate on Jesus being nailed to the cross and dying for our sins." },
    ]},
    6: { name: t('rosary.joyful'), day: "Saturday", color: "#007C7C", emoji: "🌸", mysteries: [
      { number: 1, title: "The Annunciation", virtue: "Humility", meditation: "Meditate on the Angel Gabriel announcing to Mary that she would conceive and bear the Son of God." },
      { number: 2, title: "The Visitation", virtue: "Love of Neighbour", meditation: "Meditate on Mary visiting her cousin Elizabeth, who was pregnant with John the Baptist." },
      { number: 3, title: "The Nativity", virtue: "Poverty & Detachment", meditation: "Meditate on the birth of Jesus Christ in a humble stable in Bethlehem." },
      { number: 4, title: "The Presentation", virtue: "Obedience", meditation: "Meditate on Mary and Joseph presenting the infant Jesus in the Temple in Jerusalem." },
      { number: 5, title: "Finding in the Temple", virtue: "Piety", meditation: "Meditate on the twelve-year-old Jesus being found in the Temple, sitting among the teachers." },
    ]},
  };

  const todaysMystery = mysteries[today as keyof typeof mysteries];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: todaysMystery.color }}>
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.push("/(tabs)/home")}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-white/70 text-sm font-medium uppercase tracking-widest">
            {t('rosary.title')}
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
          {todaysMystery.emoji} {t('rosary.focusVirtues')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">

        {/* Mysteries List */}
        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
          {t('rosary.theFiveMysteries')}
        </Text>

        {todaysMystery.mysteries.map((mystery) => (
          <TouchableOpacity
            key={mystery.number}
            onPress={() => setExpandedMystery(
              expandedMystery === mystery.number ? null : mystery.number
            )}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
          >
            <View className="flex-row items-center">
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
                  {t('rosary.virtue')}: {mystery.virtue}
                </Text>
              </View>
              <Text className="text-gray-300 text-lg">
                {expandedMystery === mystery.number ? "∨" : "›"}
              </Text>
            </View>

            {/* Expanded Meditation Info */}
            {expandedMystery === mystery.number && (
              <View
                className="mt-3 p-3 rounded-xl"
                style={{ backgroundColor: todaysMystery.color + "10" }}
              >
                <Text
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: todaysMystery.color }}
                >
                  Meditation
                </Text>
                <Text className="text-gray-600 text-sm leading-5">
                  {mystery.meditation}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Begin Session Button */}
        <TouchableOpacity
          onPress={() => router.push("/prayer/session")}
          className="rounded-full py-4 items-center mt-4 mb-10"
          style={{ backgroundColor: todaysMystery.color }}
        >
          <Text className="text-white text-lg font-semibold">
            {t('rosary.beginSession')}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <Footer />
    </View>
  );
}