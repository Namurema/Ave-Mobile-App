import { getRosaryPrayers, getPrayersByCategory } from '../supabase/queries';
import { cachePrayers, getCachedPrayers } from './cache';

export async function fetchRosaryPrayers(languageCode: string) {
  const cacheKey = `rosary-${languageCode}`;
  const cached = await getCachedPrayers(cacheKey);
  if (cached) return cached;
  const data = await getRosaryPrayers(languageCode);
  if (data) await cachePrayers(cacheKey, data);
  return data;
}

export async function fetchCategoryPrayers(categorySlug: string, languageCode: string) {
  const cacheKey = `${categorySlug}-${languageCode}`;
  const cached = await getCachedPrayers(cacheKey);
  if (cached) return cached;
  const data = await getPrayersByCategory(categorySlug, languageCode);
  if (data) await cachePrayers(cacheKey, data);
  return data;
}