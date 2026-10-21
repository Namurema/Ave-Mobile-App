import { novenaSeason } from "./seasons";
import { novenaLength } from "./items";
import { addDays, dayString, parseDay, splitLogId } from "./progress";

// Where someone is in a novena, counted from the day it started:
// - novenas with set dates (lib/seasons.ts) start on their calendar date, so
//   on 22 October St. Jude (19 to 27 October) is on day 4, prayed or not;
// - novenas for any time start on the day day 1 was prayed, and missing a day
//   starts them again.

export type TrackDay = {
  date: string; // YYYY-MM-DD
  number: number; // day of the novena, from 1
  state: "prayed" | "missed" | "today" | "future";
};

export type NovenaTrack = {
  seasonal: boolean;
  length: number;
  // First day, or null for a novena for any time that hasn't been started
  start: string | null;
  // Which day of the novena today is (null before it starts or after it ends)
  todayNumber: number | null;
  days: TrackDay[];
  prayedCount: number;
  missedCount: number;
  prayedToday: boolean;
  // "upcoming": its dates haven't come yet; "notStarted": a novena for any time
  // not begun; "finished": its days are over (or all prayed)
  status: "upcoming" | "notStarted" | "active" | "finished";
};

const daysBetween = (from: string, to: string) =>
  Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / 86400000);

export function novenaTrack(novenaId: string, log: Set<string>, now: Date = new Date()): NovenaTrack {
  const key = `novena:${novenaId}`;
  const length = novenaLength(novenaId);
  const prayed = new Set([...log].map(splitLogId).filter((entry) => entry.key === key).map((entry) => entry.day));
  const today = dayString(now);
  const season = novenaSeason(novenaId, now);

  let start: string | null;
  let finishedRun = false;
  if (season) {
    start = dayString(season.start);
  } else {
    // The current run of consecutive days, ending today or yesterday
    let last = prayed.has(today) ? today : addDays(today, -1);
    if (!prayed.has(last)) {
      start = null;
    } else {
      let first = last;
      while (prayed.has(addDays(first, -1))) first = addDays(first, -1);
      const runLength = daysBetween(first, last) + 1;
      // A run longer than the novena: count from the start of the latest cycle
      const cycle = Math.floor((runLength - 1) / length);
      start = addDays(first, cycle * length);
      // The last cycle was completed yesterday and today isn't prayed yet
      finishedRun = runLength % length === 0 && last !== today;
    }
  }

  const firstDay = start ?? today;
  const days: TrackDay[] = Array.from({ length }, (_, i) => {
    const date = addDays(firstDay, i);
    const state: TrackDay["state"] = prayed.has(date)
      ? "prayed"
      : date < today
        ? "missed"
        : date === today
          ? "today"
          : "future";
    return { date, number: i + 1, state };
  });

  const elapsed = start ? daysBetween(start, today) : -1;
  const todayNumber = start && elapsed >= 0 && elapsed < length ? elapsed + 1 : null;
  const prayedCount = days.filter((day) => day.state === "prayed").length;
  const missedCount = days.filter((day) => day.state === "missed").length;

  const status: NovenaTrack["status"] = !start
    ? "notStarted"
    : elapsed < 0
      ? "upcoming"
      : finishedRun || elapsed >= length || prayedCount === length
        ? "finished"
        : "active";

  return {
    seasonal: !!season,
    length,
    start,
    todayNumber,
    days,
    prayedCount,
    missedCount,
    prayedToday: prayed.has(today),
    status,
  };
}
