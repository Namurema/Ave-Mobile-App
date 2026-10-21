import type { TFunction } from "i18next";
import { languageInfo } from "../../constants/languages";

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
    return date.toLocaleDateString(languageInfo(language).dateLocale, { weekday: "long" });
  } catch {
    return date.toDateString().split(" ")[0];
  }
}

// Day name for 0 = Sunday ... 6 = Saturday: short in English ("Fri"),
// full in Luganda and Runyankore (no agreed short forms)
export function weekdayName(day: number, language: string) {
  const names = DATE_NAMES[language];
  if (names) return names.days[day];
  // 7 January 2024 was a Sunday
  const date = new Date(2024, 0, 7 + day);
  try {
    return date.toLocaleDateString(languageInfo(language).dateLocale, { weekday: "short" });
  } catch {
    return date.toDateString().split(" ")[0];
  }
}

// "19 October", in the chosen language
// "06:30" → "6:30 am" (or the language's own style)
export function formatTime(time: string, language: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(2024, 0, 1, hours, minutes);
  try {
    // English in the 12-hour style used in Uganda ("6:30 am")
    return date.toLocaleTimeString(languageInfo(language).dateLocale, {
      hour: "numeric",
      minute: "2-digit",
      ...(language === "en" ? { hour12: true } : {}),
    });
  } catch {
    return time;
  }
}

export function formatDayMonth(date: Date, language: string) {
  const names = DATE_NAMES[language];
  if (names) return `${date.getDate()} ${names.months[date.getMonth()]}`;
  try {
    return date.toLocaleDateString(languageInfo(language).dateLocale, { day: "numeric", month: "long" });
  } catch {
    return date.toDateString().slice(4, 10);
  }
}

export function formatDate(date: Date, language: string) {
  const names = DATE_NAMES[language];
  if (names) return `${names.days[date.getDay()]}, ${date.getDate()} ${names.months[date.getMonth()]}`;
  try {
    return date.toLocaleDateString(languageInfo(language).dateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return date.toDateString();
  }
}
