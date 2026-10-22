import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './client';
import { disableReminders } from '../reminders';

// Deletes the signed-in account for good (supabase/functions/delete-account),
// then forgets it on this phone: reminders, saved progress and routine copies,
// and the sign-in.
export async function deleteAccount(userId: string) {
  await disableReminders().catch(() => {});
  const { error } = await supabase.functions.invoke('delete-account', { body: {} });
  if (error) throw error;
  await AsyncStorage.multiRemove([`ave-userdata-${userId}`, `ave-routine-${userId}`]).catch(() => {});
  await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
}
