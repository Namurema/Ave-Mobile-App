// Date and progress calculations. Days are local-time "YYYY-MM-DD" strings,
// so a prayer counts for the day the user prayed it, wherever they are.

export function dayString(date: Date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDay(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}

export function addDays(day: string, amount: number) {
  const date = parseDay(day);
  date.setDate(date.getDate() + amount);
  return dayString(date);
}

// Log entries are stored as "YYYY-MM-DD|item-key"
export const logId = (day: string, key: string) => `${day}|${key}`;
export const splitLogId = (id: string) => {
  const [day, ...rest] = id.split("|");
  return { day, key: rest.join("|") };
};

// Consecutive days with any prayer, up to today. Prayed yesterday but not yet
// today still counts, so the streak doesn't reset in the morning.
export function currentStreak(days: Set<string>) {
  const today = dayString();
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// The last 7 days, oldest first
export function lastSevenDays() {
  const today = dayString();
  return Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
}

// A novena is prayed on consecutive days; missing a day starts it again.
// Returns how far the current run has got, and whether today is done.
export function novenaProgress(daysPrayed: Set<string>, length: number) {
  const today = dayString();
  const prayedToday = daysPrayed.has(today);
  let cursor = prayedToday ? today : addDays(today, -1);
  let run = 0;
  while (daysPrayed.has(cursor)) {
    run++;
    cursor = addDays(cursor, -1);
  }
  const cycleFinished = run > 0 && run % length === 0;
  // Finished today: show it complete. Finished on an earlier day: the next
  // day starts a new novena.
  if (cycleFinished && prayedToday) {
    return { daysDone: length, length, prayedToday, completed: true, nextDay: 1 };
  }
  const daysDone = cycleFinished ? 0 : run % length;
  return { daysDone, length, prayedToday, completed: false, nextDay: daysDone + 1 };
}
