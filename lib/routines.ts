// Prayer routines: which prayers to pray on which days of the week.
// Entries use the same item keys as progress and favourites (lib/items.ts).
// Days are 0 = Sunday ... 6 = Saturday. `time` ("HH:MM", the person's own
// time) is when to send a reminder, if reminders are on.

export type RoutineEntry = { key: string; days: number[]; time?: string };

// Reminder times to choose from, and the usual time for each kind of prayer
export const REMINDER_TIMES = ["05:30", "06:00", "06:30", "07:00", "08:00", "12:00", "13:00", "15:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

export function defaultTime(key: string) {
  if (key === "daily:morning") return "06:30";
  if (key === "daily:midday") return "12:00";
  if (key === "daily:night") return "21:00";
  if (key === "rosary") return "19:00";
  // The Hour of Mercy
  if (key === "chaplet:1" || key === "stations") return "15:00";
  return "20:00";
}

const isTime = (value: unknown): value is string => typeof value === "string" && /^([01]d|2[0-3]):[0-5]d$/.test(value);

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
  "novena:6",
  "novena:7",
  "novena:8",
  "novena:9",
  "novena:10",
  "novena:11",
  "novena:12",
  "novena:13",
  "novena:5",
  "novena:14",
  "novena:15",
  "novena:16",
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
      time: isTime(entry.time) ? entry.time : defaultTime(entry.key),
    }))
    .filter((entry) => entry.days.length > 0 && !seen.has(entry.key) && seen.add(entry.key));
}
