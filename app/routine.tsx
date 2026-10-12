import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRoutineStore } from "../store/routineStore";
import { useLanguageStore } from "../store/LanguageStore";
import { useContent } from "../lib/i18n/content";
import { weekdayName } from "../lib/i18n/helpers";
import { describeItem } from "../lib/items";
import { SUGGESTIONS, ROUTINE_ITEMS, EVERY_DAY, type RoutineEntry } from "../lib/routines";
import { Page, PageHeader, Section, ListCard } from "../components/ui/page";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { TodaysRoutine } from "../components/RoutineCard";
import { images } from "../constants/images";
import { cn } from "../lib/utils";

// "Every day", or the chosen days in week order
function useDaysLabel() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  return (days: number[]) =>
    days.length === 7 ? t("routine.everyDay") : days.map((day) => weekdayName(day, language)).join(", ");
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      role="checkbox"
      aria-checked={selected}
      onPress={onPress}
      className={cn(
        "rounded-full border px-3 py-1.5",
        selected ? "border-primary bg-primary" : "border-border bg-background web:hover:bg-muted"
      )}
    >
      <Text className={cn("text-xs font-semibold", selected ? "text-primary-foreground" : "text-foreground")}>
        {label}
      </Text>
    </Pressable>
  );
}

// Pick prayers and their days
function Editor({ initial, onDone }: { initial: RoutineEntry[]; onDone: () => void }) {
  const { t } = useTranslation();
  const tc = useContent();
  const { language } = useLanguageStore();
  const setRoutine = useRoutineStore((state) => state.setRoutine);
  const [draft, setDraft] = useState<RoutineEntry[]>(initial);

  const daysOf = (key: string) => draft.find((entry) => entry.key === key)?.days;
  const update = (key: string, days: number[] | null) =>
    setDraft((current) => {
      const others = current.filter((entry) => entry.key !== key);
      if (!days) return others;
      // Keep the prayer's place in the routine when changing its days
      const index = current.findIndex((entry) => entry.key === key);
      const next = [...others];
      next.splice(index === -1 ? next.length : index, 0, { key, days });
      return next;
    });

  const toggleDay = (key: string, day: number) => {
    const days = daysOf(key) ?? [];
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
    update(key, next.length ? next : null);
  };

  return (
    <>
      <Section title={t("routine.choose")}>
        {ROUTINE_ITEMS.map((key) => ({ key, info: describeItem(key, t, tc) }))
          .filter((item) => item.info)
          .map(({ key, info }) => {
            const days = daysOf(key);
            return (
              <View key={key} className="gap-3 px-4 md:px-5 py-4 border-b border-border">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 text-sm font-semibold text-card-foreground">{info!.title}</Text>
                  <Button
                    size="sm"
                    variant={days ? "default" : "outline"}
                    onPress={() => update(key, days ? null : EVERY_DAY)}
                  >
                    {days ? t("routine.added") : t("routine.add")}
                  </Button>
                </View>
                {days && (
                  <View className="flex-row flex-wrap gap-2">
                    <Chip
                      label={t("routine.everyDay")}
                      selected={days.length === 7}
                      onPress={() => update(key, EVERY_DAY)}
                    />
                    {EVERY_DAY.map((day) => (
                      <Chip
                        key={day}
                        label={weekdayName(day, language)}
                        selected={days.length < 7 && days.includes(day)}
                        // From "Every day", tapping a day picks just that day
                        onPress={() => (days.length === 7 ? update(key, [day]) : toggleDay(key, day))}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
      </Section>
      <View className="flex-row flex-wrap gap-2">
        <Button
          disabled={draft.length === 0}
          onPress={() => {
            setRoutine(draft);
            onDone();
          }}
        >
          {t("routine.save")}
        </Button>
        <Button variant="outline" onPress={onDone}>
          {t("routine.cancel")}
        </Button>
      </View>
    </>
  );
}

export default function RoutineScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const daysLabel = useDaysLabel();
  const { entries, dismissed, setRoutine, clearRoutine, dismissSuggestions } = useRoutineStore();
  const [editing, setEditing] = useState<RoutineEntry[] | null>(null);
  const hasRoutine = entries.length > 0;

  return (
    <Page>
      <PageHeader
        back
        tone="primary"
        image={images.prayingHands}
        title={t("routine.title")}
        description={t("routine.description")}
      />

      {editing ? (
        <Editor initial={editing} onDone={() => setEditing(null)} />
      ) : hasRoutine ? (
        <>
          <TodaysRoutine />
          <Section title={t("routine.yourWeek")} count={entries.length}>
            <ListCard
              items={entries
                .map((entry) => ({ entry, info: describeItem(entry.key, t, tc) }))
                .filter((item) => item.info)
                .map(({ entry, info }) => ({
                  key: entry.key,
                  title: info!.title,
                  description: daysLabel(entry.days),
                  onPress: () => router.push(info!.route as any),
                }))}
            />
          </Section>
          <View className="flex-row flex-wrap gap-2">
            <Button onPress={() => setEditing(entries)}>{t("routine.edit")}</Button>
            <Button variant="outline" onPress={clearRoutine}>
              {t("routine.remove")}
            </Button>
          </View>
        </>
      ) : null}

      {!editing && (
        <Section title={hasRoutine ? t("routine.otherSuggestions") : t("routine.suggestions")}>
          {SUGGESTIONS.map((suggestion) => (
            <View key={suggestion.id} className="gap-3 px-4 md:px-5 py-4 border-b border-border">
              <View className="gap-1">
                <Text className="text-base font-semibold text-card-foreground">{t(suggestion.titleKey)}</Text>
                <Text className="text-sm leading-5 text-muted-foreground">{t(suggestion.descriptionKey)}</Text>
              </View>
              <View className="gap-1 rounded-md bg-accent/40 p-3">
                {suggestion.entries.map((entry) => {
                  const info = describeItem(entry.key, t, tc);
                  return info ? (
                    <Text key={entry.key} className="text-sm text-foreground">
                      <Text className="font-semibold">{info.title}</Text>
                      <Text className="text-muted-foreground"> · {daysLabel(entry.days)}</Text>
                    </Text>
                  ) : null;
                })}
              </View>
              <View className="flex-row flex-wrap gap-2">
                <Button size="sm" onPress={() => setRoutine(suggestion.entries)}>
                  {t("routine.use")}
                </Button>
                <Button size="sm" variant="outline" onPress={() => setEditing(suggestion.entries)}>
                  {t("routine.editFirst")}
                </Button>
              </View>
            </View>
          ))}
        </Section>
      )}

      {!editing && !hasRoutine && (
        <Card className="p-4 gap-3">
          <Text className="text-sm leading-5 text-muted-foreground">{t("routine.ownHint")}</Text>
          <View className="flex-row flex-wrap gap-2">
            <Button size="sm" variant="outline" onPress={() => setEditing([])}>
              {t("routine.makeOwn")}
            </Button>
            {!dismissed && (
              <Button size="sm" variant="ghost" onPress={dismissSuggestions}>
                {t("routine.ignore")}
              </Button>
            )}
          </View>
        </Card>
      )}
    </Page>
  );
}
