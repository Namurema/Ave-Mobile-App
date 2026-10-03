import type { TFunction } from "i18next";
import { novenaContent } from "../constants/content/novenaTexts";
import { chapletContent } from "../constants/content/chapletTexts";
import { prayerContent } from "../constants/content/otherPrayerTexts";
import { novenas } from "../constants/content/novenas";

// Every prayer that can be marked as prayed or saved has a key:
//   daily:morning | daily:midday | daily:night
//   novena:<id> | chaplet:<id> | other:<id> | stations | rosary
// Progress and favourites store only keys; titles are looked up here, in the
// chosen language.

export const itemKey = {
  daily: (id: string) => `daily:${id}`,
  novena: (id: string) => `novena:${id}`,
  chaplet: (id: string) => `chaplet:${id}`,
  other: (id: string) => `other:${id}`,
  stations: "stations",
  rosary: "rosary",
};

const DAILY_TITLES: Record<string, string> = {
  morning: "prayers.morningPrayers",
  midday: "prayers.middayPrayers",
  night: "prayers.nightPrayers",
};

export type ItemInfo = { title: string; route: string; kind: string };

// `tc` translates prayer content (see lib/i18n/content.ts)
export function describeItem(key: string, t: TFunction, tc: (text: string) => string): ItemInfo | null {
  const [kind, id] = key.split(":");
  switch (kind) {
    case "daily":
      return DAILY_TITLES[id]
        ? { title: t(DAILY_TITLES[id]), route: `/daily-prayer/${id}`, kind: t("prayers.title") }
        : null;
    case "novena":
      return novenaContent[id]
        ? { title: tc(novenaContent[id].title), route: `/novena/${id}`, kind: t("novenas.eyebrow") }
        : null;
    case "chaplet":
      return chapletContent[id]
        ? { title: tc(chapletContent[id].title), route: `/chaplet/${id}`, kind: t("chaplets.eyebrow") }
        : null;
    case "other":
      return prayerContent[id]
        ? { title: tc(prayerContent[id].title), route: `/other-prayer/${id}`, kind: t("prayers.prayer") }
        : null;
    case "stations":
      return { title: t("home.stationsOfCross"), route: "/stations", kind: t("prayers.prayer") };
    case "rosary":
      return { title: t("rosary.title"), route: "/prayer/session", kind: t("rosary.title") };
    default:
      return null;
  }
}

// Number of days a novena runs (e.g. 9, or 13 for the 13 Blessed Souls)
export function novenaLength(id: string) {
  return novenas.find((novena) => novena.id === id)?.days ?? 9;
}
