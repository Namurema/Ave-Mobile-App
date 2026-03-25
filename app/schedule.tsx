import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState } from "react";
import Footer from "../components/ui/Footer";

const PRAYER_OPTIONS = [
  { id: "morning", icon: "", label: "Morning Prayers", time: "6:00 AM", category: "Daily" },
  { id: "midday", icon: "", label: "Midday Prayers", time: "12:00 PM", category: "Daily" },
  { id: "night", icon: "", label: "Night Prayers", time: "9:00 PM", category: "Daily" },
  { id: "rosary", icon: "", label: "Daily Rosary", time: "7:00 AM", category: "Devotion" },
  { id: "novenas", icon: "", label: "Novenas", time: "8:00 AM", category: "Devotion" },
  { id: "stations", icon: "", label: "Stations of the Cross", time: "3:00 PM", category: "Devotion" },
  { id: "chaplets", icon: "", label: "Chaplets", time: "5:00 PM", category: "Devotion" },
];

const TIME_SLOTS = ["5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "12:00 PM", "3:00 PM", "5:00 PM", "7:00 PM", "9:00 PM"];

export default function ScheduleScreen() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean; time: string }>>({
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

  const dailyPrayers = PRAYER_OPTIONS.filter((p) => p.category === "Daily");
  const devotionPrayers = PRAYER_OPTIONS.filter((p) => p.category === "Devotion");
  const enabledCount = Object.values(schedule).filter((v) => v.enabled).length;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-primary px-6 pt-14 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Daily Schedule</Text>
          <View className="w-8 h-8" />
        </View>

        {/* Summary pill */}
        <View className="bg-white/15 rounded-2xl p-4 flex-row items-center justify-between">
          <View>
            <Text className="text-accent text-xs font-semibold uppercase tracking-widest">Active Prayers</Text>
            <Text className="text-white text-2xl font-bold mt-1">{enabledCount} / {PRAYER_OPTIONS.length}</Text>
          </View>
          <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center">
            <Text className="text-3xl"></Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

        {/* Daily Prayers */}
        <View className="px-6 mt-6">
          <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
            Daily Prayers
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {dailyPrayers.map((prayer, index) => (
              <View key={prayer.id}>
                <View className="px-4 py-4 flex-row items-center">
                  <View className="w-10 h-10 bg-accent rounded-xl items-center justify-center mr-3">
                    <Text className="text-xl">{prayer.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold text-sm">{prayer.label}</Text>
                    <TouchableOpacity onPress={() => setEditingId(editingId === prayer.id ? null : prayer.id)}>
                      <Text className="text-primary text-xs mt-0.5">
                         {schedule[prayer.id]?.time} {editingId === prayer.id ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Switch
                    value={schedule[prayer.id]?.enabled ?? false}
                    onValueChange={() => togglePrayer(prayer.id)}
                    trackColor={{ false: "#E5E7EB", true: "#007C7C" }}
                    thumbColor="white"
                  />
                </View>

                {/* Time picker dropdown */}
                {editingId === prayer.id && (
                  <View className="bg-gray-50 px-4 pb-3">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <TouchableOpacity
                            key={slot}
                            onPress={() => setTime(prayer.id, slot)}
                            className={`px-3 py-2 rounded-full border ${
                              schedule[prayer.id]?.time === slot
                                ? "bg-primary border-primary"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                schedule[prayer.id]?.time === slot ? "text-white" : "text-gray-600"
                              }`}
                            >
                              {slot}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {index < dailyPrayers.length - 1 && (
                  <View className="h-px bg-gray-100 mx-4" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Devotion Prayers */}
        <View className="px-6 mt-6">
          <Text className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
            Devotions
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {devotionPrayers.map((prayer, index) => (
              <View key={prayer.id}>
                <View className="px-4 py-4 flex-row items-center">
                  <View className="w-10 h-10 bg-accent rounded-xl items-center justify-center mr-3">
                    <Text className="text-xl">{prayer.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold text-sm">{prayer.label}</Text>
                    <TouchableOpacity onPress={() => setEditingId(editingId === prayer.id ? null : prayer.id)}>
                      <Text className="text-primary text-xs mt-0.5">
                         {schedule[prayer.id]?.time} {editingId === prayer.id ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Switch
                    value={schedule[prayer.id]?.enabled ?? false}
                    onValueChange={() => togglePrayer(prayer.id)}
                    trackColor={{ false: "#E5E7EB", true: "#007C7C" }}
                    thumbColor="white"
                  />
                </View>

                {editingId === prayer.id && (
                  <View className="bg-gray-50 px-4 pb-3">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <TouchableOpacity
                            key={slot}
                            onPress={() => setTime(prayer.id, slot)}
                            className={`px-3 py-2 rounded-full border ${
                              schedule[prayer.id]?.time === slot
                                ? "bg-primary border-primary"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                schedule[prayer.id]?.time === slot ? "text-white" : "text-gray-600"
                              }`}
                            >
                              {slot}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {index < devotionPrayers.length - 1 && (
                  <View className="h-px bg-gray-100 mx-4" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <View className="px-6 mt-6 mb-10">
          <TouchableOpacity
            className="bg-primary rounded-full py-4 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-white text-base font-semibold">Save Schedule</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Footer />
    </View>
  );
}
