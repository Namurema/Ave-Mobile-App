import { supabase } from './client';
import type { RoutineEntry } from '../routines';

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
    .upsert({ entries, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function deleteRoutine() {
  const { error } = await supabase.from('prayer_routines').delete().not('user_id', 'is', null);
  if (error) throw error;
}
