import type { TFunction } from "i18next";

// Prayer category slugs (from Supabase) → keys under `categories` in the
// translation files, so category names follow the chosen language.
const CATEGORY_KEYS: Record<string, string> = {
  "morning-evening": "morningEvening",
  afternoon: "afternoon",
  "daily-rosary": "dailyRosary",
  novenas: "novenas",
  chaplets: "chaplets",
  litanies: "litanies",
  "other-prayers": "otherPrayers",
};

export function categoryText(t: TFunction, slug: string, fallbackTitle?: string) {
  const key = CATEGORY_KEYS[slug];
  if (!key) return { title: fallbackTitle ?? slug, description: "" };
  return {
    title: t(`categories.${key}`),
    description: t(`categories.${key}Description`),
  };
}

// Greeting for the time of day: morning until 12:00, afternoon until 17:00,
// then evening. Returns translation keys.
export function greetingKeys(date: Date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return { title: "home.greeting", subtitle: "home.greetingSubtitle" };
  if (hour < 17) return { title: "home.greetingAfternoon", subtitle: "home.greetingSubtitleAfternoon" };
  return { title: "home.greetingEvening", subtitle: "home.greetingSubtitleEvening" };
}

// App language codes → locale codes browsers know for dates
const DATE_LOCALES: Record<string, string> = { en: "en-GB", lg: "lg", rny: "nyn" };

// Most browsers ship no date names for Luganda or Runyankore, so use the CLDR
// names directly (Sunday first, January first). Needs native-speaker review.
const DATE_NAMES: Record<string, { days: string[]; months: string[] }> = {
  lg: {
    days: ["Sabbiiti", "Bbalaza", "Lwakubiri", "Lwakusatu", "Lwakuna", "Lwakutaano", "Lwamukaaga"],
    months: ["Janwaliyo", "Febwaliyo", "Marisi", "Apuli", "Maayi", "Juuni", "Julaayi", "Agusito", "Sebuttemba", "Okitobba", "Novemba", "Desemba"],
  },
  rny: {
    days: ["Sande", "Orwokubanza", "Orwakabiri", "Orwakashatu", "Orwakana", "Orwakataano", "Orwamukaaga"],
    months: ["Okwokubanza", "Okwakabiri", "Okwakashatu", "Okwakana", "Okwakataano", "Okwamukaaga", "Okwamushanju", "Okwamunaana", "Okwamwenda", "Okwaikumi", "Okwaikumi na kumwe", "Okwaikumi na ibiri"],
  },
};

export function formatWeekday(date: Date, language: string) {
  const names = DATE_NAMES[language];
  if (names) return names.days[date.getDay()];
  try {
    return date.toLocaleDateString(DATE_LOCALES[language] ?? "en-GB", { weekday: "long" });
  } catch {
    return date.toDateString().split(" ")[0];
  }
}

export function formatDate(date: Date, language: string) {
  const names = DATE_NAMES[language];
  if (names) return `${names.days[date.getDay()]}, ${date.getDate()} ${names.months[date.getMonth()]}`;
  try {
    return date.toLocaleDateString(DATE_LOCALES[language] ?? "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return date.toDateString();
  }
}
