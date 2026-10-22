// The app's languages, in one place. To add one: add it here, add its
// translation files (lib/i18n/<code>.ts and lib/i18n/content/<code>.json, made
// by scripts/translate.mjs) and register them in lib/i18n/index.ts and
// lib/i18n/content.ts.

export type LanguageInfo = {
  code: string;
  // In the language itself, e.g. "Oluganda"
  name: string;
  // In English, e.g. "Luganda"
  englishName: string;
  // Shown under the name on the language screen
  description: string;
  // ISO code for the page's <html lang> (Runyankore is "nyn"; the app uses "rny")
  htmlLang: string;
  // For dates. Browsers have no names for Luganda or Runyankore, so
  // lib/i18n/helpers.ts carries those itself.
  dateLocale: string;
  // Voice language for Play audio, where phones have voices for it
  speech?: string;
};

export const LANGUAGES: LanguageInfo[] = [
  {
    code: "en",
    name: "English",
    englishName: "English",
    description: "International liturgical standard",
    htmlLang: "en",
    dateLocale: "en-GB",
    speech: "en",
  },
  {
    code: "lg",
    name: "Oluganda",
    englishName: "Luganda",
    description: "Luganda",
    htmlLang: "lg",
    dateLocale: "lg",
  },
  {
    code: "rny",
    name: "Orunyankore",
    englishName: "Runyankore",
    description: "Runyankore",
    htmlLang: "nyn",
    dateLocale: "nyn",
  },
  {
    code: "es",
    name: "Español",
    englishName: "Spanish",
    description: "Spanish",
    htmlLang: "es",
    dateLocale: "es-ES",
    speech: "es",
  },
  {
    code: "it",
    name: "Italiano",
    englishName: "Italian",
    description: "Italian",
    htmlLang: "it",
    dateLocale: "it-IT",
    speech: "it",
  },
];

export const languageInfo = (code: string) => LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
