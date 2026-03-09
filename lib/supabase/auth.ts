import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from './client';

// Configure Google Sign In
GoogleSignin.configure({
  webClientId: '989158153508-hr6n30ncstpbgud0cso31b13256mmj6d.apps.googleusercontent.com',
  iosClientId: '989158153508-palvpkhf7padicelqnku68qeueueaurst.apps.googleusercontent.com',
});

// Sign in with Google
export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;

    if (!idToken) throw new Error('No ID token returned');

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

// Sign out
export async function signOut() {
  await GoogleSignin.signOut();
  await supabase.auth.signOut();
}

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}