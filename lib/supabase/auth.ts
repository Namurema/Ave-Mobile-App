import { supabase } from './client';

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Sign out
export async function signOut() {
  await supabase.auth.signOut();
}

// Placeholder - will be replaced with real Google Auth in native build
export async function signInWithGoogle() {
  throw new Error('Google Sign In requires a native build');
}