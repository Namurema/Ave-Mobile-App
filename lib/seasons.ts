import { dayString, parseDay } from "./progress";
import { novenaLength } from "./items";

// Novenas traditionally prayed on set dates, finishing the day before a feast.
// Each season is anchored on its feast: the novena runs for its length (9 or
// 30 days) up to the day before. That keeps a 30-day novena at 30 days in leap
// years, and lets a novena run across New Year (Holy Name: 25 Dec to 2 Jan).
// Novenas not listed here can be prayed at any time.

// A fixed date ([month 1-12, day]), or a date that moves with Easter
type FeastDate = [month: number, day: number] | { daysAfterEaster: number };
// `feastKey` names the feast; without one the dates are shown with no feast
type Season = { feast: FeastDate; feastKey?: string };

const NOVENA_SEASONS: Record<string, Season> = {
  // 19 to 27 October
  "6": { feast: [10, 28], feastKey: "seasons.stJude" },
  // 18 to 26 June
  "2": { feast: [6, 27], feastKey: "seasons.perpetualHelp" },
  // 1 to 9 November
  "8": { feast: [11, 10], feastKey: "seasons.stLeo" },
  // 3 to 11 December
  "9": { feast: [12, 12], feastKey: "seasons.guadalupe" },
  // 25 December to 2 January
  "10": { feast: [1, 3], feastKey: "seasons.holyName" },
  // 8 to 16 January
  "11": { feast: [1, 17], feastKey: "seasons.ourLadyOfHope" },
  // 9-day (10 to 18 March) and 30-day (17 February to 18 March) St. Joseph
  "3": { feast: [3, 19], feastKey: "seasons.stJoseph" },
  "12": { feast: [3, 19], feastKey: "seasons.stJoseph" },
  // 4 to 12 May
  "14": { feast: [5, 13], feastKey: "seasons.fatima" },
  // 30 July to 7 August
  "15": { feast: [8, 8], feastKey: "seasons.stDominic" },
  // 6 to 14 September
  "16": { feast: [9, 15], feastKey: "seasons.ourLadyOfSorrows" },
  // 6 to 14 March
  "13": { feast: [3, 15] },
  // Good Friday to the Saturday after Easter, before Divine Mercy Sunday
  "5": { feast: { daysAfterEaster: 7 }, feastKey: "seasons.divineMercySunday" },
};

// How soon before the start the app begins mentioning a novena
const UPCOMING_DAYS = 7;

export type NovenaSeason = {
  start: Date;
  end: Date;
  feast: Date;
  feastKey?: string;
  length: number;
  // "active": between start and end; "feast": on the feast day;
  // "upcoming": starts within a week; "later": anything else
  status: "active" | "feast" | "upcoming" | "later";
  // Day of the novena today (active)
  day: number;
  // Days until it starts (upcoming/later)
  daysUntil: number;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const daysBetween = (from: Date, to: Date) =>
  Math.round((parseDay(dayString(to)).getTime() - parseDay(dayString(from)).getTime()) / 86400000);

// Easter Sunday (Gregorian calendar, the "Anonymous Gregorian" method)
export function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const feastIn = (feast: FeastDate, year: number) =>
  Array.isArray(feast) ? new Date(year, feast[0] - 1, feast[1]) : addDays(easterSunday(year), feast.daysAfterEaster);

export function novenaSeason(id: string, today: Date = new Date()): NovenaSeason | null {
  const season = NOVENA_SEASONS[id];
  if (!season) return null;
  const length = novenaLength(id);

  // The next season that hasn't finished: its last day (the feast, or the
  // novena's last day when there's no named feast) is today or later.
  // Starting from last year catches a novena that began in December.
  let dates: { start: Date; end: Date; feast: Date } | null = null;
  for (const year of [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1]) {
    const feast = feastIn(season.feast, year);
    const end = addDays(feast, -1);
    const lastDay = season.feastKey ? feast : end;
    if (daysBetween(today, lastDay) >= 0) {
      dates = { start: addDays(feast, -length), end, feast };
      break;
    }
  }
  if (!dates) return null;

  const sinceStart = daysBetween(dates.start, today);
  const status: NovenaSeason["status"] =
    sinceStart >= 0 && daysBetween(today, dates.end) >= 0
      ? "active"
      : daysBetween(dates.feast, today) === 0
        ? "feast"
        : -sinceStart <= UPCOMING_DAYS
          ? "upcoming"
          : "later";

  return {
    ...dates,
    feastKey: season.feastKey,
    length,
    status,
    day: status === "active" ? sinceStart + 1 : 0,
    daysUntil: sinceStart < 0 ? -sinceStart : 0,
  };
}
