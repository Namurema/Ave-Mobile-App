import { useMemo, useState } from "react";
import { View, Text, Platform, Share } from "react-native";
import { usePathname } from "expo-router";
import { SITE_URL } from "../constants/site";
import { useTranslation } from "react-i18next";
import { withAccountPrompt } from "../lib/accountPrompt";
import { useUserDataStore, usePrayedToday, useIsFavourite } from "../store/userDataStore";
import { parseDay } from "../lib/progress";
import { novenaTrack } from "../lib/novenaTrack";
import { formatDayMonth } from "../lib/i18n/helpers";
import { useLanguageStore } from "../store/LanguageStore";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

// Share this prayer: the phone's share sheet (WhatsApp, SMS...) where there is
// one, otherwise the link is copied
export function useSharePrayer() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = SITE_URL + pathname;
    // The page title is set per prayer ("Morning Prayers | Ave")
    const title = Platform.OS === "web" ? document.title.replace(/\s*\|\s*Ave$/, "") : "Ave";
    const text = `${t("share.prayWithMe")}: ${title}`;
    if (Platform.OS !== "web") {
      Share.share({ message: `${text}
${url}` }).catch(() => {});
      return;
    }
    if (navigator.share) {
      // Cancelling the share sheet rejects; nothing to do
      navigator.share({ title, text, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text}
${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t("share.copyThis"), url);
    }
  };

  return { share, copied };
}

export function ShareButton() {
  const { t } = useTranslation();
  const { share, copied } = useSharePrayer();
  return (
    <Button size="sm" variant="outline" onPress={share}>
      {copied ? t("share.copied") : t("share.share")}
    </Button>
  );
}

// "Save to favourites" / "Saved", for a page header
export function FavouriteButton({ itemKey: key }: { itemKey: string }) {
  const { t } = useTranslation();
  const saved = useIsFavourite(key);
  const toggleFavourite = useUserDataStore((state) => state.toggleFavourite);
  return (
    <Button
      size="sm"
      variant={saved ? "default" : "outline"}
      aria-pressed={saved}
      // Saving asks guests to sign in first; removing never does
      onPress={() => (saved ? toggleFavourite(key) : withAccountPrompt(() => toggleFavourite(key)))}
    >
      {saved ? t("favourites.saved") : t("favourites.save")}
    </Button>
  );
}

// End-of-prayer card: mark today's prayer as prayed, or undo
export function PrayedCard({ itemKey: key, label }: { itemKey: string; label?: string }) {
  const { t } = useTranslation();
  const prayed = usePrayedToday(key);
  const { markPrayed, unmarkPrayed } = useUserDataStore();
  return (
    <Card className="p-5 gap-3">
      {prayed ? (
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-base font-semibold text-primary">{t("progress.prayedToday")}</Text>
          <Button variant="ghost" size="sm" onPress={() => unmarkPrayed(key)}>
            {t("progress.undo")}
          </Button>
        </View>
      ) : (
        <Button size="lg" onPress={() => withAccountPrompt(() => markPrayed(key))}>
          {label ?? t("progress.markPrayed")}
        </Button>
      )}
    </Card>
  );
}

// Where you are in a novena, counted from the day it started: a dot per day
// (prayed, missed, today, still to come) and what to do today
export function NovenaProgressCard({ novenaId }: { novenaId: string }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const log = useUserDataStore((state) => state.log);
  const track = useMemo(() => novenaTrack(novenaId, log), [novenaId, log]);
  const of = `${t("progress.of")} ${track.length}`;
  const date = (day: string) => formatDayMonth(parseDay(day), language);

  const badge =
    track.status === "active"
      ? `${t("progress.day")} ${track.todayNumber} ${of}`
      : track.status === "upcoming"
        ? `${t("seasons.starts")} ${date(track.start!)}`
        : track.status === "finished"
          ? track.prayedCount === track.length
            ? t("novena.complete")
            : `${track.prayedCount} ${of} ${t("novena.daysPrayed")}`
          : t("novena.notStarted");

  const lines: string[] = [];
  if (track.status === "active") {
    lines.push(
      track.prayedToday
        ? `${t("novena.prayedDay")} ${track.todayNumber}.${
            track.todayNumber! < track.length ? ` ${t("novena.comeBack")} ${track.todayNumber! + 1}.` : ""
          }`
        : `${t("novena.todayIsDay")} ${track.todayNumber} ${of}. ${t("novena.markWhenDone")}`
    );
    if (track.missedCount > 0) {
      lines.push(
        `${track.missedCount} ${t(track.missedCount === 1 ? "novena.missedOne" : "novena.missed")} ${track.seasonal ? t("novena.keepGoing") : ""}`.trim()
      );
    }
  } else if (track.status === "upcoming") {
    lines.push(`${t("novena.beginsOn")} ${date(track.start!)}.`);
  } else if (track.status === "notStarted") {
    lines.push(t("novena.startToday"));
  } else {
    lines.push(track.prayedCount === track.length ? t("progress.novenaComplete") : t("novena.ended"));
  }

  return (
    <Card className="p-5 gap-3">
      <View className="flex-row items-baseline justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-card-foreground">{t("progress.novenaTitle")}</Text>
          {track.start && track.status !== "upcoming" ? (
            <Text className="text-xs text-muted-foreground">
              {t("novena.started")} {date(track.start)}
            </Text>
          ) : null}
        </View>
        <Text className="text-sm font-semibold text-primary">{badge}</Text>
      </View>

      <View className="flex-row flex-wrap gap-1.5">
        {track.days.map((day) => (
          <View
            key={day.date}
            aria-label={`${t("progress.day")} ${day.number}: ${t(`novena.state.${day.state}`)}`}
            className={cn(
              "h-8 w-8 items-center justify-center rounded-full",
              day.state === "prayed" && "bg-primary",
              day.state === "today" && "border-2 border-primary bg-background",
              day.state === "missed" && "border border-destructive/30 bg-destructive/5",
              day.state === "future" && "bg-muted"
            )}
          >
            <Text
              className={cn(
                "text-xs font-semibold",
                day.state === "prayed"
                  ? "text-primary-foreground"
                  : day.state === "today"
                    ? "text-primary"
                    : day.state === "missed"
                      ? "text-destructive/70"
                      : "text-muted-foreground"
              )}
            >
              {day.number}
            </Text>
          </View>
        ))}
      </View>

      {lines.map((line) => (
        <Text key={line} className="text-sm leading-5 text-foreground">
          {line}
        </Text>
      ))}
      {!track.seasonal && <Text className="text-xs leading-5 text-muted-foreground">{t("progress.novenaRule")}</Text>}
    </Card>
  );
}
