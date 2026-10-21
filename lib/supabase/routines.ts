import { supabase } from './client';
import i18n from '../i18n';
import { translateContent } from '../i18n/content';
import { describeItem } from '../items';
import type { RoutineEntry } from '../routines';

// Each prayer's name in the person's language, saved with the routine so the
// reminder sender (supabase/functions/send-reminders) can use it
const withTitles = (entries: RoutineEntry[]) =>
  entries.map((entry) => ({
    ...entry,
    title: describeItem(entry.key, i18n.t, (text) => translateContent(text, i18n.language))?.title ?? entry.key,
  }));

// The signed-in user's prayer routine (table in
// supabase/migrations/20261012_routines.sql). One row per user.

export async function fetchRoutine(): Promise<RoutineEntry[] | null> {
  const { data, error } = await supabase.from('prayer_routines').select('entries').maybeSingle();
  if (error) throw error;
  return data ? (data.entries as RoutineEntry[]) : null;
}

export async function saveRoutine(entries: RoutineEntry[]) {
  const { error } = await supabase
    .from('prayer_routines')
    .upsert({ entries: withTitles(entries), updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function deleteRoutine() {
  const { error } = await supabase.from('prayer_routines').delete().not('user_id', 'is', null);
  if (error) throw error;
}
