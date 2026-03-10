import * as FileSystem from 'expo-file-system/legacy';

const CACHE_DIR = `${FileSystem.documentDirectory}ave-cache/`;
const AUDIO_DIR = `${CACHE_DIR}audio/`;
const PRAYERS_DIR = `${CACHE_DIR}prayers/`;

// Ensure cache directories exist
async function ensureDirs() {
  const cacheDirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!cacheDirInfo.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });

  const audioDirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
  if (!audioDirInfo.exists) await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });

  const prayersDirInfo = await FileSystem.getInfoAsync(PRAYERS_DIR);
  if (!prayersDirInfo.exists) await FileSystem.makeDirectoryAsync(PRAYERS_DIR, { intermediates: true });
}

// Cache prayer text locally
export async function cachePrayers(key: string, data: any) {
  try {
    await ensureDirs();
    const path = `${PRAYERS_DIR}${key}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(data));
    console.log(`Cached prayers: ${key}`);
  } catch (error) {
    console.log('Cache prayers error:', error);
  }
}

// Get cached prayers
export async function getCachedPrayers(key: string) {
  try {
    const path = `${PRAYERS_DIR}${key}.json`;
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(path);
    return JSON.parse(content);
  } catch (error) {
    console.log('Get cached prayers error:', error);
    return null;
  }
}

// Download and cache audio file
export async function cacheAudio(url: string, filename: string) {
  try {
    await ensureDirs();
    const path = `${AUDIO_DIR}${filename}`;
    const info = await FileSystem.getInfoAsync(path);

    // Already cached
    if (info.exists) {
      console.log(`Audio already cached: ${filename}`);
      return path;
    }

    // Download
    const result = await FileSystem.downloadAsync(url, path);
    console.log(`Downloaded audio: ${filename}`);
    return result.uri;
  } catch (error) {
    console.log('Cache audio error:', error);
    return null;
  }
}

// Get cached audio path
export async function getCachedAudio(filename: string) {
  try {
    const path = `${AUDIO_DIR}${filename}`;
    const info = await FileSystem.getInfoAsync(path);
    return info.exists ? path : null;
  } catch (error) {
    return null;
  }
}

// Clear all cache
export async function clearCache() {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (info.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
    console.log('Cache cleared');
  } catch (error) {
    console.log('Clear cache error:', error);
  }
}

// Get cache size in bytes
export async function getCacheSize(): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (info.exists && 'size' in info) return info.size ?? 0;
    return 0;
  } catch {
    return 0;
  }
}
