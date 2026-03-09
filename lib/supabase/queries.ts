import { supabase } from './client';

// Fetch all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

// Fetch prayers by category and language
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

// Fetch all languages
export async function getLanguages() {
  const { data, error } = await supabase
    .from('languages')
    .select('*');
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