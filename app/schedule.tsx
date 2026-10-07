import { View, Text, Pressable, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Page, PageHeader, Section } from "../components/ui/page";
import { cn } from "../lib/utils";

const PRAYER_OPTIONS = [
  { id: "morning", label: "Morning Prayers", time: "6:00 AM", category: "Daily" },
  { id: "midday", label: "Midday Prayers", time: "12:00 PM", category: "Daily" },
  { id: "night", label: "Night Prayers", time: "9:00 PM", category: "Daily" },
  { id: "rosary", label: "Daily Rosary", time: "7:00 AM", category: "Devotion" },
  { id: "novenas", label: "Novenas", time: "8:00 AM", category: "Devotion" },
  { id: "stations", label: "Stations of the Cross", time: "3:00 PM", category: "Devotion" },
  { id: "chaplets", label: "Chaplets", time: "5:00 PM", category: "Devotion" },
];

const TIME_SLOTS = ["5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "12:00 PM", "3:00 PM", "5:00 PM", "7:00 PM", "9:00 PM"];

type Schedule = Record<string, { enabled: boolean; time: string }>;

export default function ScheduleScreen() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule>({
    morning: { enabled: true, time: "6:00 AM" },
    midday: { enabled: false, time: "12:00 PM" },
    night: { enabled: true, time: "9:00 PM" },
    rosary: { enabled: false, time: "7:00 AM" },
    novenas: { enabled: false, time: "8:00 AM" },
    stations: { enabled: false, time: "3:00 PM" },
    chaplets: { enabled: false, time: "5:00 PM" },
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const togglePrayer = (id: string) => {
    setSchedule((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
  };

  const setTime = (id: string, time: string) => {
    setSchedule((prev) => ({ ...prev, [id]: { ...prev[id], time } }));
    setEditingId(null);
  };

  const enabledCount = Object.values(schedule).filter((v) => v.enabled).length;

  const renderGroup = (category: string) => {
    const prayers = PRAYER_OPTIONS.filter((p) => p.category === category);
    return (
      <Card className="overflow-hidden">
        {prayers.map((prayer, index) => (
          <View
            key={prayer.id}
            className={cn(index < prayers.length - 1 && "border-b border-border")}
          >
            <View className="flex-row items-center gap-3 px-4 py-4">
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-card-foreground">{prayer.label}</Text>
                <Pressable
                  onPress={() => setEditingId(editingId === prayer.id ? null : prayer.id)}
                  className="self-start"
                >
                  <Text className="text-sm text-primary">
                    {schedule[prayer.id]?.time} {editingId === prayer.id ? "▲" : "▼"}
                  </Text>
                </Pressable>
              </View>
              <Switch
                value={schedule[prayer.id]?.enabled ?? false}
                onValueChange={() => togglePrayer(prayer.id)}
                trackColor={{ false: "#E4E4E7", true: "#01758F" }}
                thumbColor="white"
              />
            </View>

            {/* Time picker */}
            {editingId === prayer.id && (
              <View className="flex-row flex-wrap gap-2 px-4 pb-4">
                {TIME_SLOTS.map((slot) => {
                  const selected = schedule[prayer.id]?.time === slot;
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => setTime(prayer.id, slot)}
                      className={cn(
                        "px-3 py-1.5 rounded-md border",
                        selected ? "bg-primary border-primary" : "bg-background border-input"
                      )}
                    >
                      <Text
                        className={cn(
                          "text-xs font-medium",
                          selected ? "text-primary-foreground" : "text-foreground"
                        )}
                      >
                        {slot}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </Card>
    );
  };

  return (
    <Page>
      <PageHeader
        back
        title="Prayer schedule"
        description={`${enabledCount} of ${PRAYER_OPTIONS.length} prayers scheduled`}
      />

      <Section title="Daily prayers">{renderGroup("Daily")}</Section>
      <Section title="Devotions">{renderGroup("Devotion")}</Section>

      <Button size="lg" className="w-full md:w-auto md:self-start" onPress={() => router.back()}>
        Save schedule
      </Button>
    </Page>
  );
}
