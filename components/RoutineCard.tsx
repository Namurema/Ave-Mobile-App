import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRoutineStore } from "../store/routineStore";
import { useUserDataStore } from "../store/userDataStore";
import { useContent } from "../lib/i18n/content";
import { describeItem } from "../lib/items";
import { entriesForDay } from "../lib/routines";
import { dayString, logId } from "../lib/progress";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

// Today's prayers from the routine, each ticked off once marked as prayed
export function TodaysRoutine({ showEdit = false }: { showEdit?: boolean }) {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const entries = useRoutineStore((state) => state.entries);
  const log = useUserDataStore((state) => state.log);
  const today = dayString();

  const items = entriesForDay(entries)
    .map((entry) => ({ key: entry.key, info: describeItem(entry.key, t, tc) }))
    .filter((item) => item.info)
    .map((item) => ({ ...item, done: log.has(logId(today, item.key)) }));
  const done = items.filter((item) => item.done).length;

  return (
    <Card className="overflow-hidden">
      <View className="flex-row items-center justify-between gap-3 px-4 md:px-5 py-4 border-b border-border">
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-card-foreground">{t("routine.today")}</Text>
          <Text className="text-sm text-muted-foreground">
            {items.length === 0 ? t("routine.restDay") : `${done} ${t("progress.of")} ${items.length} ${t("routine.prayed")}`}
          </Text>
        </View>
        {showEdit && (
          <Pressable onPress={() => router.push("/routine")} className="rounded-md px-2 py-1 web:hover:bg-muted">
            <Text className="text-sm font-semibold text-primary">{t("routine.edit")}</Text>
          </Pressable>
        )}
      </View>
      {items.length > 0 && (
        <View className="h-1.5 bg-muted">
          <View className="h-1.5 bg-primary" style={{ width: `${(done / items.length) * 100}%` }} />
        </View>
      )}
      {items.map((item, index) => (
        <Pressable
          key={item.key}
          onPress={() => router.push(item.info!.route as any)}
          className={cn(
            "flex-row items-center gap-3 px-4 md:px-5 py-3.5 web:hover:bg-muted/60",
            index < items.length - 1 && "border-b border-border"
          )}
        >
          {/* Filled circle once prayed today */}
          <View
            className={cn(
              "h-5 w-5 rounded-full border-2",
              item.done ? "border-primary bg-primary" : "border-primary/40"
            )}
          />
          <Text
            className={cn(
              "flex-1 text-sm font-medium",
              item.done ? "text-muted-foreground line-through" : "text-card-foreground"
            )}
          >
            {item.info!.title}
          </Text>
          <Text className="text-lg text-primary">›</Text>
        </Pressable>
      ))}
    </Card>
  );
}
