import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwleayefcrmtzhqymlvf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13bGVheWVmY3JtdHpocXltbHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODcyNjAsImV4cCI6MjA4ODY2MzI2MH0.Z4aH4sMDywowgvdb5ZHVHljKbFHu-CTrf3QtCsYuZCY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // On the web, confirmation and password-reset emails link back to the app
    // with the session in the URL
    detectSessionInUrl: Platform.OS === 'web',
  },
});
// Prayer text is public: fetch it without the signed-in session, so an expired
// login or the database's rules for signed-in accounts can't block it
export const contentClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'ave-content',
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
