import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardTitle, CardDescription } from "../components/ui/card";

const features = [
  { title: "Daily prayers", description: "Morning, midday and night prayers" },
  { title: "The Holy Rosary", description: "Today's mysteries, with a virtue for each" },
  { title: "Novenas & chaplets", description: "Divine Mercy, Stations of the Cross and more" },
];

export default function SplashScreen() {
  const router = useRouter();
  const getStarted = () => router.push("/Language");

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Top bar */}
      <View className="border-b border-border">
        <View className="w-full max-w-5xl self-center h-16 px-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold tracking-tight text-primary">Ave</Text>
          <Button variant="ghost" size="sm" onPress={getStarted}>
            Open app
          </Button>
        </View>
      </View>

      <ScrollView contentContainerClassName="flex-grow items-center justify-center px-4 py-12">
        <View className="w-full max-w-md">
          {/* Hero */}
          <Badge>Free · No account needed</Badge>
          <Text className="mt-6 text-4xl font-bold tracking-tight text-foreground text-center">
            Pray every day, in your own language
          </Text>
          <Text className="mt-4 text-base leading-7 text-muted-foreground text-center">
            Daily prayers, the Holy Rosary, novenas and chaplets in English, Luganda and
            Runyankore.
          </Text>

          <Button size="lg" className="mt-8 w-full" onPress={getStarted}>
            Get started
          </Button>

          {/* What's inside */}
          <Card className="mt-10">
            {features.map((feature, index) => (
              <View
                key={feature.title}
                className={`flex-row items-start gap-3 p-4 ${
                  index < features.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <View className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                <View className="flex-1 gap-0.5">
                  <CardTitle className="text-sm">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      {/* Footer */}
      <Text className="py-6 text-center text-xs text-muted-foreground">
        A Catholic prayer companion, built for Uganda
      </Text>
    </View>
  );
}
