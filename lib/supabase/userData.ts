import { supabase } from './client';

// Progress and favourites for the signed-in user (tables in
// supabase/migrations/20261004_progress_favourites.sql). Row-level security
// limits every query to the user's own rows.

export type LogEntry = { item_key: string; prayed_on: string };

export async function fetchLog(): Promise<LogEntry[]> {
  const { data, error } = await supabase.from('prayer_log').select('item_key, prayed_on');
  if (error) throw error;
  return data ?? [];
}

export async function insertLog(entries: LogEntry[]) {
  if (entries.length === 0) return;
  const { error } = await supabase
    .from('prayer_log')
    .upsert(entries, { onConflict: 'user_id,item_key,prayed_on', ignoreDuplicates: true });
  if (error) throw error;
}

export async function deleteLog(entry: LogEntry) {
  const { error } = await supabase
    .from('prayer_log')
    .delete()
    .eq('item_key', entry.item_key)
    .eq('prayed_on', entry.prayed_on);
  if (error) throw error;
}

export async function fetchFavourites(): Promise<string[]> {
  const { data, error } = await supabase
    .from('favourite_prayers')
    .select('item_key')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => row.item_key);
}

export async function insertFavourites(keys: string[]) {
  if (keys.length === 0) return;
  const { error } = await supabase
    .from('favourite_prayers')
    .upsert(keys.map((item_key) => ({ item_key })), { onConflict: 'user_id,item_key', ignoreDuplicates: true });
  if (error) throw error;
}

export async function deleteFavourite(key: string) {
  const { error } = await supabase.from('favourite_prayers').delete().eq('item_key', key);
  if (error) throw error;
}
