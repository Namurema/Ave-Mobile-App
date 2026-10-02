import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useLanguageStore } from "../store/LanguageStore";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

const languages = [
  {
    code: "en",
    name: "English",
    description: "International liturgical standard",
  },
  {
    code: "lg",
    name: "Oluganda",
    description: "Luganda",
  },
  {
    code: "rny",
    name: "Orunyankore",
    description: "Runyankore",
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const [selected, setSelected] = useState(language);

  const handleContinue = () => {
    setLanguage(selected);
    router.push("/(tabs)/home");
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Top bar */}
      <View className="border-b border-border">
        <View className="w-full max-w-5xl self-center h-16 px-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold tracking-tight text-primary">Ave</Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/splash"))}
          >
            {t("common.back", { lng: selected })}
          </Button>
        </View>
      </View>

      <ScrollView contentContainerClassName="flex-grow items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("language.title", { lng: selected })}</CardTitle>
            <CardDescription>{t("language.subtitle", { lng: selected })}</CardDescription>
          </CardHeader>

          <CardContent>
            <RadioGroup value={selected} onValueChange={setSelected}>
              {languages.map((lang) => (
                <RadioGroupItem key={lang.code} value={lang.code}>
                  <Text className="text-sm font-medium text-foreground">{lang.name}</Text>
                  <Text className="text-sm text-muted-foreground">{lang.description}</Text>
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </CardContent>

          <CardFooter>
            <Button className="flex-1" onPress={handleContinue}>
              {t("common.continue", { lng: selected })}
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </View>
  );
}
