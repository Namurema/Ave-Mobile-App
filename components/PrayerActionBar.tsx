import { useState, type ComponentProps } from "react";
import { View, Text, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../store/LanguageStore";
import { useUserDataStore, usePrayedToday, useIsFavourite } from "../store/userDataStore";
import { useRoutineStore } from "../store/routineStore";
import { withAccountPrompt } from "../lib/accountPrompt";
import { weekdayName } from "../lib/i18n/helpers";
import { EVERY_DAY } from "../lib/routines";
import type { useReadAloud } from "../lib/speech";
import { useSharePrayer } from "./PrayerActions";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Chip } from "./ui/chip";
import { cn } from "../lib/utils";

const PRIMARY = "#01758F";
const MUTED = "#52525B";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Outline icon normally, the filled one (and teal) while on, e.g. a saved heart
function Action({
  icon,
  activeIcon,
  label,
  active = false,
  onPress,
}: {
  icon: IconName;
  activeIcon?: IconName;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-pressed={active}
      onPress={onPress}
      className={cn(
        "flex-1 items-center gap-1 rounded-lg py-1.5 web:transition-colors",
        active ? "bg-primary/10" : "web:hover:bg-muted active:bg-muted"
      )}
    >
      <Ionicons name={active && activeIcon ? activeIcon : icon} size={22} color={active ? PRIMARY : MUTED} />
      <Text
        numberOfLines={1}
        className={cn("text-[11px]", active ? "font-semibold text-primary" : "font-medium text-muted-foreground")}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Choose the days to pray a prayer as part of the routine
function RoutineDialog({ itemKey: key, open, onClose }: { itemKey: string; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const { entries, setRoutine } = useRoutineStore();
  const current = entries.find((entry) => entry.key === key);
  const [days, setDays] = useState<number[]>(current?.days ?? EVERY_DAY);

  const toggle = (day: number) =>
    setDays((selected) =>
      selected.length === 7 ? [day] : selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day].sort()
    );

  const save = () => {
    setRoutine(current ? entries.map((entry) => (entry.key === key ? { key, days } : entry)) : [...entries, { key, days }]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("routine.addTitle")} description={t("routine.addDescription")} closeLabel={t("routine.cancel")}>
      <View className="gap-4">
        <View className="flex-row flex-wrap gap-2">
          <Chip label={t("routine.everyDay")} selected={days.length === 7} onPress={() => setDays(EVERY_DAY)} />
          {EVERY_DAY.map((day) => (
            <Chip
              key={day}
              label={weekdayName(day, language)}
              selected={days.length < 7 && days.includes(day)}
              onPress={() => toggle(day)}
            />
          ))}
        </View>
        <View className="flex-row flex-wrap gap-2">
          <Button disabled={days.length === 0} onPress={save}>
            {t("routine.save")}
          </Button>
          {current && (
            <Button
              variant="outline"
              onPress={() => {
                setRoutine(entries.filter((entry) => entry.key !== key));
                onClose();
              }}
            >
              {t("routine.removeOne")}
            </Button>
          )}
        </View>
      </View>
    </Dialog>
  );
}

// Fixed bar at the bottom of a prayer page: play audio, save, add to routine,
// share and mark as prayed. Play appears only where audio is available (the
// device voice reads English; recorded audio can replace it later).
export function PrayerActionBar({
  itemKey: key,
  speech,
}: {
  itemKey: string;
  speech?: ReturnType<typeof useReadAloud>;
}) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const saved = useIsFavourite(key);
  const prayed = usePrayedToday(key);
  const inRoutine = useRoutineStore((state) => state.entries.some((entry) => entry.key === key));
  const { toggleFavourite, markPrayed, unmarkPrayed } = useUserDataStore();
  const { share, copied } = useSharePrayer();
  const [routineOpen, setRoutineOpen] = useState(false);
  const canPlay = !!speech && speech.available && language === "en";

  return (
    <View className="border-t border-border bg-background">
      <View role="toolbar" className="w-full max-w-3xl self-center flex-row gap-1 px-2 py-1.5">
        {canPlay &&
          (speech!.state === "playing" ? (
            <Action icon="pause" label={t("actions.pause")} active onPress={speech!.pause} />
          ) : (
            <Action
              icon="play-outline"
              activeIcon="play"
              label={speech!.state === "paused" ? t("actions.resume") : t("actions.play")}
              active={speech!.state === "paused"}
              onPress={speech!.play}
            />
          ))}
        {canPlay && speech!.state !== "idle" && <Action icon="stop-outline" label={t("actions.stop")} onPress={speech!.stop} />}
        <Action
          icon="heart-outline"
          activeIcon="heart"
          label={saved ? t("actions.saved") : t("actions.save")}
          active={saved}
          // Saving asks guests to sign in first; removing never does
          onPress={() => (saved ? toggleFavourite(key) : withAccountPrompt(() => toggleFavourite(key)))}
        />
        <Action icon="calendar-outline" activeIcon="calendar" label={t("actions.routine")} active={inRoutine} onPress={() => setRoutineOpen(true)} />
        {/* While audio plays, Stop takes Share's place, so the bar keeps five buttons */}
        {!(canPlay && speech!.state !== "idle") && (
          <Action icon="share-social-outline" label={copied ? t("share.copied") : t("actions.share")} onPress={share} />
        )}
        <Action
          icon="checkmark-circle-outline"
          activeIcon="checkmark-circle"
          label={prayed ? t("actions.prayed") : t("actions.markPrayed")}
          active={prayed}
          onPress={() => (prayed ? unmarkPrayed(key) : withAccountPrompt(() => markPrayed(key)))}
        />
      </View>
      {routineOpen && <RoutineDialog itemKey={key} open onClose={() => setRoutineOpen(false)} />}
    </View>
  );
}
