import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRoutineStore } from "../store/routineStore";
import { useUserDataStore } from "../store/userDataStore";
import { useContent } from "../lib/i18n/content";
import { describeItem } from "../lib/items";
import { entriesForDay, defaultTime } from "../lib/routines";
import { formatTime } from "../lib/i18n/helpers";
import { useLanguageStore } from "../store/LanguageStore";
import { dayString, logId } from "../lib/progress";
import { novenaTrack } from "../lib/novenaTrack";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

// Today's prayers from the routine, each ticked off once marked as prayed
export function TodaysRoutine({ showEdit = false }: { showEdit?: boolean }) {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const tc = useContent();
  const entries = useRoutineStore((state) => state.entries);
  const log = useUserDataStore((state) => state.log);
  const today = dayString();

  const items = entriesForDay(entries)
    .map((entry) => ({ key: entry.key, time: entry.time ?? defaultTime(entry.key), info: describeItem(entry.key, t, tc) }))
    .filter((item) => item.info)
    .map((item) => {
      const novenaId = item.key.startsWith("novena:") ? item.key.slice("novena:".length) : null;
      const track = novenaId ? novenaTrack(novenaId, log) : null;
      return {
        ...item,
        done: log.has(logId(today, item.key)),
        // The reminder time, and "Day 4 of 9" for a novena that's running
        detail: [
          formatTime(item.time, language),
          track?.todayNumber ? `${t("progress.day")} ${track.todayNumber} ${t("progress.of")} ${track.length}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    });
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
          <View className="flex-1 gap-0.5">
            <Text
              className={cn(
                "text-sm font-medium",
                item.done ? "text-muted-foreground line-through" : "text-card-foreground"
              )}
            >
              {item.info!.title}
            </Text>
            {item.detail || item.done ? (
              <Text className={cn("text-xs", item.done ? "font-semibold text-primary" : "text-muted-foreground")}>
                {[item.detail, item.done ? t("progress.prayedToday") : null].filter(Boolean).join(" · ")}
              </Text>
            ) : null}
          </View>
          <Text className="text-lg text-primary">›</Text>
        </Pressable>
      ))}
    </Card>
  );
}
