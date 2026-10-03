import { Platform } from 'react-native';
import { supabase } from './client';

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Supabase error messages → keys under `auth.errors` in the translation files
function errorKey(error: { message?: string; code?: string } | null): string | null {
  if (!error) return null;
  const message = (error.message ?? '').toLowerCase();
  if (error.code === 'invalid_credentials' || message.includes('invalid login')) return 'auth.errors.invalidCredentials';
  if (error.code === 'email_not_confirmed' || message.includes('not confirmed')) return 'auth.errors.emailNotConfirmed';
  if (error.code === 'user_already_exists' || message.includes('already registered')) return 'auth.errors.alreadyRegistered';
  if (error.code === 'weak_password' || message.includes('password should')) return 'auth.errors.weakPassword';
  if (message.includes('rate limit') || error.code === 'over_email_send_rate_limit') return 'auth.errors.tooManyAttempts';
  if (message.includes('fetch') || message.includes('network')) return 'auth.errors.network';
  return 'auth.errors.generic';
}

// Links in confirmation and reset emails come back to the web app
function redirectTo(path: string) {
  return Platform.OS === 'web' && typeof window !== 'undefined'
    ? `${window.location.origin}${path}`
    : undefined;
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return { errorKey: errorKey(error) };
}

// `needsConfirmation` is true when the project requires email confirmation,
// so there is no session until the user clicks the link in their email
export async function signUpWithEmail(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: name.trim() },
      emailRedirectTo: redirectTo('/home'),
    },
  });
  return { errorKey: errorKey(error), needsConfirmation: !error && !data.session };
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: redirectTo('/auth/reset-password'),
  });
  return { errorKey: errorKey(error) };
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  return { errorKey: errorKey(error) };
}

export async function signOut() {
  await supabase.auth.signOut();
}
