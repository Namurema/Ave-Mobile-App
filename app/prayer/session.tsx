import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Page, PageHeader, LoadingCard, EmptyState } from "../../components/ui/page";
import { FavouriteButton, PrayedCard } from "../../components/PrayerActions";
import { itemKey } from "../../lib/items";
import { cn } from "../../lib/utils";
import { rosaryTabs } from "../../constants/navigation";
import { useLanguageStore } from "../../store/LanguageStore";
import { formatWeekday } from "../../lib/i18n/helpers";
import { mysteryDetailsMap } from "../../constants/content/rosarySession";
import { useContent } from "../../lib/i18n/content";
import { getPrayersWithFallback } from "../../lib/supabase/queries";

// Rosary mysteries by weekday, Sunday first
const MYSTERY_BY_DAY = ["glorious", "joyful", "sorrowful", "glorious", "luminous", "sorrowful", "joyful"];

// The Rosary prayers in Supabase ("daily-rosary"), by sort_order, which is the
// same in every language
type PrayerId = "creed" | "ourFather" | "hailMary" | "gloryBe" | "hailHolyQueen";
const SORT_ORDER: Record<PrayerId, number> = {
  creed: 1,
  ourFather: 2,
  hailMary: 3,
  gloryBe: 4,
  hailHolyQueen: 6,
};

type Step =
  | { kind: "prayer"; prayer: PrayerId; section: "opening" | "decade" | "closing"; decade?: number; repeat?: number }
  | { kind: "mystery"; decade: number };

// The whole Rosary in order:
//   opening: Apostles' Creed, Our Father, 3 Hail Marys, Glory Be
//   each of the 5 decades: the mystery, Our Father, 10 Hail Marys, Glory Be
//   closing: Hail Holy Queen
const STEPS: Step[] = [
  { kind: "prayer", prayer: "creed", section: "opening" },
  { kind: "prayer", prayer: "ourFather", section: "opening" },
  { kind: "prayer", prayer: "hailMary", section: "opening", repeat: 3 },
  { kind: "prayer", prayer: "gloryBe", section: "opening" },
  ...[1, 2, 3, 4, 5].flatMap((decade): Step[] => [
    { kind: "mystery", decade },
    { kind: "prayer", prayer: "ourFather", section: "decade", decade },
    { kind: "prayer", prayer: "hailMary", section: "decade", decade, repeat: 10 },
    { kind: "prayer", prayer: "gloryBe", section: "decade", decade },
  ]),
  { kind: "prayer", prayer: "hailHolyQueen", section: "closing" },
];

// One bead per Hail Mary; tap a bead to jump to it
function Beads({ total, done, onSelect }: { total: number; done: number; onSelect: (count: number) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {Array.from({ length: total }, (_, i) => (
        <Pressable
          key={i}
          aria-label={`${i + 1}`}
          onPress={() => onSelect(i + 1)}
          className={cn(
            "h-6 w-6 rounded-full border",
            i < done ? "bg-primary border-primary" : "bg-background border-input"
          )}
        />
      ))}
    </View>
  );
}

export default function RosarySessionScreen() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const tc = useContent();
  const today = new Date().getDay();
  const mysteries = mysteryDetailsMap[today];

  const [prayers, setPrayers] = useState<Record<number, { title: string; body: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [beads, setBeads] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    getPrayersWithFallback("daily-rosary", language)
      .then(({ prayers }) => {
        setPrayers(Object.fromEntries(prayers.map((p: any) => [p.sort_order, { title: p.title, body: p.body }])));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [language]);

  const step = STEPS[stepIndex];
  const repeat = step.kind === "prayer" ? step.repeat ?? 1 : 1;
  const isLast = stepIndex === STEPS.length - 1;

  const goTo = (index: number, fromEnd = false) => {
    const target = STEPS[index];
    setStepIndex(index);
    // Going back into a Hail Mary step lands on its last bead
    setBeads(fromEnd && target.kind === "prayer" ? target.repeat ?? 1 : 1);
  };

  // Next moves bead by bead through the Hail Marys, then to the next prayer
  const next = () => {
    if (beads < repeat) setBeads(beads + 1);
    else if (!isLast) goTo(stepIndex + 1);
  };

  const previous = () => {
    if (beads > 1) setBeads(beads - 1);
    else if (stepIndex > 0) goTo(stepIndex - 1, true);
  };

  // Where we are: "Opening prayers", "Decade 2 of 5" or "Closing prayer"
  const sectionLabel = useMemo(() => {
    if (step.kind === "mystery" || step.section === "decade") {
      return `${t("rosary.decade")} ${step.decade} ${t("progress.of")} 5`;
    }
    return step.section === "opening" ? t("rosary.opening") : t("rosary.closing");
  }, [step, t]);

  const header = (
    <PageHeader
      eyebrow={`${formatWeekday(new Date(), language)} · ${t(`rosary.${MYSTERY_BY_DAY[today]}`)}`}
      title={t("rosary.title")}
      tabs={rosaryTabs(t)}
      actions={<FavouriteButton itemKey={itemKey.rosary} />}
    />
  );

  if (loading) {
    return (
      <Page>
        {header}
        <LoadingCard label={t("prayers.loadingPrayers")} />
      </Page>
    );
  }

  if (error || Object.keys(prayers).length === 0) {
    return (
      <Page>
        {header}
        <EmptyState title={t("prayers.loadError")} description={t("prayers.checkConnection")}>
          <Button variant="outline" onPress={load}>
            {t("common.tryAgain")}
          </Button>
        </EmptyState>
      </Page>
    );
  }

  const mystery = step.kind === "mystery" ? mysteries[step.decade - 1] : null;
  const prayer = step.kind === "prayer" ? prayers[SORT_ORDER[step.prayer]] : null;
  const finished = isLast && beads >= repeat;

  return (
    <Page>
      {header}

      {/* Progress through the whole Rosary */}
      <View className="gap-2">
        <View className="flex-row justify-between gap-3">
          <Text className="text-sm font-semibold text-primary">{sectionLabel}</Text>
          <Text className="text-sm text-muted-foreground">
            {t("rosary.step")} {stepIndex + 1} {t("progress.of")} {STEPS.length}
          </Text>
        </View>
        <View className="h-1.5 rounded-full bg-muted overflow-hidden">
          <View
            className="h-1.5 rounded-full bg-primary"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </View>
      </View>

      {mystery && step.kind === "mystery" ? (
        <Card className="p-6 md:p-8 gap-5">
          <Badge className="self-start">{`${t("rosary.mystery")} ${step.decade}`}</Badge>
          <View className="gap-2">
            <Text role="heading" className="text-2xl font-bold tracking-tight text-card-foreground">
              {tc(mystery.title)}
            </Text>
            <Text className="text-base leading-7 text-muted-foreground">{tc(mystery.description)}</Text>
          </View>
          <View className="rounded-md bg-muted p-4 gap-1">
            <Text className="text-xs font-semibold uppercase tracking-widest text-primary">{t("rosary.virtue")}</Text>
            <Text className="text-base font-semibold text-foreground">{tc(mystery.virtue)}</Text>
          </View>
        </Card>
      ) : prayer && step.kind === "prayer" ? (
        <Card className="p-6 md:p-8 gap-4">
          <View className="flex-row items-baseline justify-between gap-3">
            <Text role="heading" className="flex-1 text-xl font-bold tracking-tight text-card-foreground">
              {prayer.title}
            </Text>
            {repeat > 1 && (
              <Text className="text-sm font-semibold text-primary">
                {beads} {t("progress.of")} {repeat}
              </Text>
            )}
          </View>
          {repeat > 1 && (
            <>
              <Beads total={repeat} done={beads} onSelect={setBeads} />
              {step.section === "opening" && (
                <Text className="text-sm italic text-muted-foreground">{t("rosary.faithHopeCharity")}</Text>
              )}
            </>
          )}
          <Text selectable className="text-base md:text-lg leading-8 text-foreground">
            {prayer.body}
          </Text>
        </Card>
      ) : null}

      <View className="flex-row items-center justify-between gap-3">
        <Button variant="outline" disabled={stepIndex === 0 && beads === 1} onPress={previous}>
          {t("rosary.previous")}
        </Button>
        {!finished && <Button onPress={next}>{t("rosary.next")}</Button>}
      </View>

      {finished && (
        <>
          <PrayedCard itemKey={itemKey.rosary} label={t("progress.finishRosary")} />
          <Button variant="ghost" className="self-center" onPress={() => goTo(0)}>
            {t("rosary.startOver")}
          </Button>
        </>
      )}
    </Page>
  );
}
