import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Page, PageHeader, Section, NumberBadge } from "../../components/ui/page";
import { cn } from "../../lib/utils";

export default function RosaryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const today = new Date().getDay();
  const [expandedMystery, setExpandedMystery] = useState<number | null>(null);

  const mysteries = {
    0: { name: t('rosary.glorious'), day: "Sunday", color: "#007C7C", emoji: "", mysteries: [
      { number: 1, title: "The Resurrection", virtue: "Faith", meditation: "Meditate on the glorious resurrection of Jesus Christ from the dead, and how He conquered sin and death." },
      { number: 2, title: "The Ascension", virtue: "Hope", meditation: "Meditate on Jesus ascending into heaven forty days after His resurrection, promising to return." },
      { number: 3, title: "Descent of the Holy Spirit", virtue: "Love of God", meditation: "Meditate on the Holy Spirit descending upon Mary and the Apostles at Pentecost." },
      { number: 4, title: "The Assumption", virtue: "Grace of a Happy Death", meditation: "Meditate on the Blessed Virgin Mary being assumed body and soul into heavenly glory." },
      { number: 5, title: "Coronation of Mary", virtue: "Trust in Mary's Intercession", meditation: "Meditate on the Blessed Virgin Mary being crowned Queen of Heaven and Earth." },
    ]},
    1: { name: t('rosary.joyful'), day: "Monday", color: "#007C7C", emoji: "", mysteries: [
      { number: 1, title: "The Annunciation", virtue: "Humility", meditation: "Meditate on the Angel Gabriel announcing to Mary that she would conceive and bear the Son of God." },
      { number: 2, title: "The Visitation", virtue: "Love of Neighbour", meditation: "Meditate on Mary visiting her cousin Elizabeth, who was pregnant with John the Baptist." },
      { number: 3, title: "The Nativity", virtue: "Poverty & Detachment", meditation: "Meditate on the birth of Jesus Christ in a humble stable in Bethlehem." },
      { number: 4, title: "The Presentation", virtue: "Obedience", meditation: "Meditate on Mary and Joseph presenting the infant Jesus in the Temple in Jerusalem." },
      { number: 5, title: "Finding in the Temple", virtue: "Piety", meditation: "Meditate on the twelve-year-old Jesus being found in the Temple, sitting among the teachers." },
    ]},
    2: { name: t('rosary.sorrowful'), day: "Tuesday", color: "#5C2D2D", emoji: "", mysteries: [
      { number: 1, title: "The Agony in the Garden", virtue: "Contrition", meditation: "Meditate on Jesus praying in the Garden of Gethsemane on the eve of His crucifixion." },
      { number: 2, title: "The Scourging at the Pillar", virtue: "Purity", meditation: "Meditate on Jesus being tied to a pillar and scourged by Roman soldiers." },
      { number: 3, title: "The Crowning with Thorns", virtue: "Courage", meditation: "Meditate on Jesus being crowned with thorns and mocked as King of the Jews." },
      { number: 4, title: "Carrying of the Cross", virtue: "Patience", meditation: "Meditate on Jesus carrying His cross through the streets of Jerusalem to Calvary." },
      { number: 5, title: "The Crucifixion", virtue: "Self-denial", meditation: "Meditate on Jesus being nailed to the cross and dying for our sins." },
    ]},
    3: { name: t('rosary.glorious'), day: "Wednesday", color: "#007C7C", emoji: "", mysteries: [
      { number: 1, title: "The Resurrection", virtue: "Faith", meditation: "Meditate on the glorious resurrection of Jesus Christ from the dead." },
      { number: 2, title: "The Ascension", virtue: "Hope", meditation: "Meditate on Jesus ascending into heaven forty days after His resurrection." },
      { number: 3, title: "Descent of the Holy Spirit", virtue: "Love of God", meditation: "Meditate on the Holy Spirit descending upon Mary and the Apostles at Pentecost." },
      { number: 4, title: "The Assumption", virtue: "Grace of a Happy Death", meditation: "Meditate on the Blessed Virgin Mary being assumed body and soul into heavenly glory." },
      { number: 5, title: "Coronation of Mary", virtue: "Trust in Mary's Intercession", meditation: "Meditate on the Blessed Virgin Mary being crowned Queen of Heaven and Earth." },
    ]},
    4: { name: t('rosary.luminous'), day: "Thursday", color: "#7C6500", emoji: "", mysteries: [
      { number: 1, title: "Baptism of Jesus", virtue: "Openness to the Holy Spirit", meditation: "Meditate on the baptism of Jesus in the Jordan River by John the Baptist." },
      { number: 2, title: "Wedding at Cana", virtue: "To Jesus through Mary", meditation: "Meditate on Jesus performing His first miracle at the wedding feast in Cana." },
      { number: 3, title: "Proclamation of the Kingdom", virtue: "Repentance & Trust", meditation: "Meditate on Jesus proclaiming the Kingdom of God and calling all to repentance." },
      { number: 4, title: "The Transfiguration", virtue: "Desire for Holiness", meditation: "Meditate on Jesus being transfigured on Mount Tabor before Peter, James and John." },
      { number: 5, title: "Institution of the Eucharist", virtue: "Eucharistic Adoration", meditation: "Meditate on Jesus instituting the Holy Eucharist at the Last Supper." },
    ]},
    5: { name: t('rosary.sorrowful'), day: "Friday", color: "#5C2D2D", emoji: "", mysteries: [
      { number: 1, title: "The Agony in the Garden", virtue: "Contrition", meditation: "Meditate on Jesus praying in the Garden of Gethsemane on the eve of His crucifixion." },
      { number: 2, title: "The Scourging at the Pillar", virtue: "Purity", meditation: "Meditate on Jesus being tied to a pillar and scourged by Roman soldiers." },
      { number: 3, title: "The Crowning with Thorns", virtue: "Courage", meditation: "Meditate on Jesus being crowned with thorns and mocked as King of the Jews." },
      { number: 4, title: "Carrying of the Cross", virtue: "Patience", meditation: "Meditate on Jesus carrying His cross through the streets of Jerusalem to Calvary." },
      { number: 5, title: "The Crucifixion", virtue: "Self-denial", meditation: "Meditate on Jesus being nailed to the cross and dying for our sins." },
    ]},
    6: { name: t('rosary.joyful'), day: "Saturday", color: "#007C7C", emoji: "", mysteries: [
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
    <Page>
      <PageHeader
        eyebrow={`${dayNames[today]} · ${t("rosary.title")}`}
        title={todaysMystery.name}
        description={t("rosary.focusVirtues")}
      />

      <Section title={t("rosary.theFiveMysteries")}>
        <Card className="overflow-hidden">
          {todaysMystery.mysteries.map((mystery, index) => {
            const open = expandedMystery === mystery.number;
            return (
              <Pressable
                key={mystery.number}
                onPress={() => setExpandedMystery(open ? null : mystery.number)}
                className={cn(
                  "px-4 py-4 gap-3 web:hover:bg-muted/60 web:transition-colors",
                  index < todaysMystery.mysteries.length - 1 && "border-b border-border"
                )}
              >
                <View className="flex-row items-center gap-3">
                  <NumberBadge value={mystery.number} />
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm font-semibold text-card-foreground">{mystery.title}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {t("rosary.virtue")}: {mystery.virtue}
                    </Text>
                  </View>
                  <Text className="w-5 text-center text-lg text-muted-foreground">{open ? "−" : "+"}</Text>
                </View>

                {open && (
                  <View className="ml-11 rounded-md bg-muted p-3 gap-1">
                    <Text className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Meditation
                    </Text>
                    <Text className="text-sm leading-6 text-foreground">{mystery.meditation}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </Card>
      </Section>

      <Button
        size="lg"
        className="w-full md:w-auto md:self-start"
        onPress={() => router.push("/prayer/session")}
      >
        {t("rosary.beginSession")}
      </Button>
    </Page>
  );
}
