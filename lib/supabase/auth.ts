import { supabase } from './client';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function signInWithGoogle() {
  try {
    const redirectUrl = makeRedirectUri({ scheme: 'ave' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    const result = await WebBrowser.openAuthSessionAsync(
      data.url!,
      redirectUrl
    );

    if (result.type === 'success') {
      const url = result.url;
      const params = new URLSearchParams(url.split('#')[1]);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken!,
        });
        if (sessionError) throw sessionError;
        return sessionData.session;
      }
    }
    return null;
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  }
}