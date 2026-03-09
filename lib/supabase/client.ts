import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwleayefcrmtzhqymlvf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13bGVheWVmY3JtdHpocXltbHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODcyNjAsImV4cCI6MjA4ODY2MzI2MH0.Z4aH4sMDywowgvdb5ZHVHljKbFHu-CTrf3QtCsYuZCY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});