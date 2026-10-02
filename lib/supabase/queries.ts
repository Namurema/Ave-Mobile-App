import { supabase } from './client';
import { translateContent, hasContentTranslation } from '../i18n/content';

// Fetch all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

// Fetch all languages
export async function getLanguages() {
  const { data, error } = await supabase
    .from('languages')
    .select('*');
  if (error) throw error;
  return data;
}

// Fetch Rosary prayers by language
export async function getRosaryPrayers(languageCode: string) {
  const { data, error } = await supabase
    .from('prayers')
    .select(`
      *,
      categories!inner(slug),
      languages!inner(code)
    `)
    .eq('categories.slug', 'daily-rosary')
    .eq('languages.code', languageCode)
    .order('sort_order');
  if (error) throw error;
  return data;
}

// Fetch prayers by category slug and language
export async function getPrayersByCategory(categorySlug: string, languageCode: string) {
  const { data, error } = await supabase
    .from('prayers')
    .select(`
      *,
      categories!inner(slug),
      languages!inner(code)
    `)
    .eq('categories.slug', categorySlug)
    .eq('languages.code', languageCode)
    .order('sort_order');
  if (error) throw error;
  return data;
}

// Placeholder rows like "[Runyakole translation coming soon]" count as missing
const isPlaceholder = (prayer: any) => /^\s*\[.*coming soon\]\s*$/i.test(prayer?.body ?? "");

// Prayers in the chosen language. When Supabase has none in that language yet,
// the English prayers are shown through the app's content translations.
// `fallback` is true only if some text is still in English. Each prayer keeps
// its English title as `sourceTitle`.
export async function getPrayersWithFallback(categorySlug: string, languageCode: string) {
  if (languageCode !== 'en') {
    const localized = (await getPrayersByCategory(categorySlug, languageCode)) ?? [];
    const usable = localized.filter((prayer: any) => !isPlaceholder(prayer));
    if (usable.length > 0) {
      return { prayers: usable.map((p: any) => ({ ...p, sourceTitle: p.title })), fallback: false };
    }
  }
  const english = (await getPrayersByCategory(categorySlug, 'en')) ?? [];
  if (languageCode === 'en') {
    return { prayers: english.map((p: any) => ({ ...p, sourceTitle: p.title })), fallback: false };
  }
  const translated = english.map((p: any) => ({
    ...p,
    sourceTitle: p.title,
    title: translateContent(p.title, languageCode),
    body: translateContent(p.body, languageCode),
  }));
  const fallback = english.some(
    (p: any) => !hasContentTranslation(p.title, languageCode) || !hasContentTranslation(p.body, languageCode)
  );
  return { prayers: translated, fallback };
}

// Fetch single prayer by id
export async function getPrayerById(id: string) {
  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Save favourite (requires user_id)
export async function addFavourite(userId: string, prayerId: string) {
  const { data, error } = await supabase
    .from('favourites')
    .insert({ user_id: userId, prayer_id: prayerId });
  if (error) throw error;
  return data;
}

// Get user favourites
export async function getFavourites(userId: string) {
  const { data, error } = await supabase
    .from('favourites')
    .select('*, prayers(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

// Mark prayer as complete
export async function markPrayerComplete(userId: string, prayerId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({ user_id: userId, prayer_id: prayerId });
  if (error) throw error;
  return data;
}
// Fetch audio track for a prayer
export async function getAudioTrack(prayerId: string) {
  const { data, error } = await supabase
    .from('audio_tracks')
    .select('*')
    .eq('prayer_id', prayerId)
    .single();
  if (error) return null;
  return data;
}