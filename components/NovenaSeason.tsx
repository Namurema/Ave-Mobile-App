import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useLanguageStore } from "../store/LanguageStore";
import { usePrayedToday } from "../store/userDataStore";
import { useContent } from "../lib/i18n/content";
import { formatDayMonth } from "../lib/i18n/helpers";
import { novenaSeason, type NovenaSeason } from "../lib/seasons";
import { itemKey } from "../lib/items";
import { availableNovenas } from "../constants/content/available";
import { novenaImage } from "../constants/images";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { PhotoBackdrop } from "./ui/page";

// "Day 3 of 9 today", "Starts tomorrow", "Starts in 5 days", "Feast day today", or
// the start date
export function seasonStatus(season: NovenaSeason, t: TFunction, language: string) {
  switch (season.status) {
    case "active":
      return `${t("progress.day")} ${season.day} ${t("progress.of")} ${season.length} ${t("seasons.today")}`;
    case "feast":
      return t("seasons.feastToday");
    case "upcoming":
      return season.daysUntil === 1
        ? t("seasons.startsTomorrow")
        : `${t("seasons.startsIn")} ${season.daysUntil} ${t("common.days")}`;
    default:
      return `${t("seasons.starts")} ${formatDayMonth(season.start, language)}`;
  }
}

// "19 October to 27 October"
export function seasonRange(season: NovenaSeason, t: TFunction, language: string) {
  return `${formatDayMonth(season.start, language)} ${t("seasons.to")} ${formatDayMonth(season.end, language)}`;
}

// Novena page: when it is traditionally prayed, and where today falls
export function NovenaDatesCard({ novenaId }: { novenaId: string }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const season = novenaSeason(novenaId);
  if (!season) return null;
  return (
    <Card className="p-4 gap-1 border-primary/30 bg-accent/40">
      <Text className="text-xs font-semibold uppercase tracking-widest text-primary">{t("seasons.traditionally")}</Text>
      <Text className="text-base font-semibold text-card-foreground">{seasonRange(season, t, language)}</Text>
      {season.feastKey && (
        <Text className="text-sm text-muted-foreground">
          {t("seasons.feast")}: {t(season.feastKey)}, {formatDayMonth(season.feast, language)}
        </Text>
      )}
      {season.status !== "later" && (
        <Text className="mt-1 text-sm font-semibold text-primary">{seasonStatus(season, t, language)}</Text>
      )}
    </Card>
  );
}

type SeasonItem = { novena: (typeof availableNovenas)[number]; season: NovenaSeason };

// Home: every novena running today; when none is, the one on its feast day
// or starting soonest
export function NovenaSeasonCard() {
  const items = availableNovenas
    .map((novena) => ({ novena, season: novenaSeason(novena.id) }))
    .filter((item): item is SeasonItem => !!item.season && item.season.status !== "later")
    .sort((a, b) => rank(a.season) - rank(b.season));
  const running = items.filter((item) => item.season.status === "active");
  const shown = running.length ? running : items.slice(0, 1);
  return (
    <>
      {shown.map((item) => (
        <SeasonCard key={item.novena.id} {...item} />
      ))}
    </>
  );
}

function SeasonCard({ novena, season }: SeasonItem) {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const language = useLanguageStore((state) => state.language);
  const prayedToday = usePrayedToday(itemKey.novena(novena.id));

  return (
    <Card className="bg-primary border-primary overflow-hidden">
      <PhotoBackdrop source={novenaImage(novena.id)} />
      <View className="p-6 gap-4">
        <View className="gap-1.5">
          <Text className="text-xs font-semibold uppercase tracking-widest text-accent">{t("seasons.title")}</Text>
          <Text className="text-xl font-bold tracking-tight text-white">{tc(novena.title)}</Text>
          <Text className="text-sm text-white/85">
            {seasonStatus(season, t, language)} · {seasonRange(season, t, language)}
          </Text>
        </View>
        <Button
          size="sm"
          onPress={() => router.push(`/novena/${novena.id}`)}
          className="self-start bg-white web:hover:bg-white/90"
          textClassName="text-primary"
        >
          {season.status === "active"
            ? prayedToday
              ? t("progress.prayedToday")
              : t("seasons.prayToday")
            : t("seasons.open")}
        </Button>
      </View>
    </Card>
  );
}

const rank = (season: NovenaSeason) =>
  season.status === "active" ? 0 : season.status === "feast" ? 1 : 2 + season.daysUntil;
