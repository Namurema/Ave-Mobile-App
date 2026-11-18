import { supabase } from './client';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

// Asks the database (public.is_admin, see supabase/migrations) whether the
// signed-in account is the admin
export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

// What each account does: prayers, favourites, routine, reminders, trial and
// plan (public.admin_activity, supabase/migrations/20261118_admin_activity.sql).
// Empty for anyone but the admin.
export type Activity = {
  user_id: string;
  prayers_total: number;
  prayers_7d: number;
  days_active_7d: number;
  last_prayed_on: string | null;
  favourites: number;
  routine_prayers: number;
  reminders_on: boolean;
  trial_ends_at: string;
  paid_until: string | null;
  plan: string | null;
  free_until: string | null;
  free_access: boolean;
  payments_completed: number;
};

export async function getActivity(): Promise<Activity[]> {
  const { data, error } = await supabase.rpc('admin_activity');
  if (error) throw error;
  return (data ?? []) as Activity[];
}

// Every account, newest first. Only returns all rows for the admin; the
// database's row-level security limits everyone else to their own.
export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
