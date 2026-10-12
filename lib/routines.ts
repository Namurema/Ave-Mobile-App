// Prayer routines: which prayers to pray on which days of the week.
// Entries use the same item keys as progress and favourites (lib/items.ts).
// Days are 0 = Sunday ... 6 = Saturday.

export type RoutineEntry = { key: string; days: number[] };

export const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
const FRIDAY = 5;
const SATURDAY = 6;

export type Suggestion = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  entries: RoutineEntry[];
};

// Suggested routines, simplest first
export const SUGGESTIONS: Suggestion[] = [
  {
    id: "simple",
    titleKey: "routine.simpleTitle",
    descriptionKey: "routine.simpleDescription",
    entries: [
      { key: "daily:morning", days: EVERY_DAY },
      { key: "daily:night", days: EVERY_DAY },
    ],
  },
  {
    id: "rosary",
    titleKey: "routine.rosaryTitle",
    descriptionKey: "routine.rosaryDescription",
    entries: [
      { key: "daily:morning", days: EVERY_DAY },
      { key: "rosary", days: EVERY_DAY },
      { key: "daily:night", days: EVERY_DAY },
    ],
  },
  {
    id: "weekly",
    titleKey: "routine.weeklyTitle",
    descriptionKey: "routine.weeklyDescription",
    entries: [
      { key: "chaplet:1", days: [FRIDAY] },
      { key: "stations", days: [FRIDAY] },
      { key: "other:magnificat", days: [SATURDAY] },
    ],
  },
  {
    id: "full",
    titleKey: "routine.fullTitle",
    descriptionKey: "routine.fullDescription",
    entries: [
      { key: "daily:morning", days: EVERY_DAY },
      { key: "daily:midday", days: EVERY_DAY },
      { key: "rosary", days: EVERY_DAY },
      { key: "daily:night", days: EVERY_DAY },
      { key: "chaplet:1", days: [FRIDAY] },
    ],
  },
];

// Prayers that can be added to a routine, in the order the editor lists them.
// Keys without a published text are skipped by describeItem().
export const ROUTINE_ITEMS = [
  "daily:morning",
  "daily:midday",
  "daily:night",
  "rosary",
  "chaplet:1",
  "stations",
  "novena:2",
  "novena:7",
  "other:guadalupe",
  "other:fatima",
  "other:magnificat",
];

// Entries due on a given day, in routine order
export const entriesForDay = (entries: RoutineEntry[], date: Date = new Date()) =>
  entries.filter((entry) => entry.days.includes(date.getDay()));

// Keeps only valid, de-duplicated entries with at least one day
export function cleanEntries(entries: RoutineEntry[]): RoutineEntry[] {
  const seen = new Set<string>();
  return entries
    .map((entry) => ({
      key: entry.key,
      days: [...new Set(entry.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort(),
    }))
    .filter((entry) => entry.days.length > 0 && !seen.has(entry.key) && seen.add(entry.key));
}
