// Saves a copy of the Supabase prayer tables (prayers, categories, languages)
// into constants/content/prayerSnapshot.json. The app falls back to this copy
// when Supabase can't be reached, so prayers always show.
//
// Runs before every build (package.json "prebuild:web" / vercel.json). If
// Supabase is unreachable the existing copy is kept and the build goes on.
//
//   node scripts/snapshot-prayers.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "constants", "content", "prayerSnapshot.json");

const client = fs.readFileSync(path.join(ROOT, "lib", "supabase", "client.ts"), "utf8");
const url = client.match(/supabaseUrl\s*=\s*'([^']+)'/)[1];
const key = client.match(/supabaseAnonKey\s*=\s*'([^']+)'/)[1];

async function table(name, select) {
  const response = await fetch(`${url}/rest/v1/${name}?select=${select}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${name}: ${response.status} ${await response.text()}`);
  return response.json();
}

try {
  const [prayers, categories, languages] = await Promise.all([
    table("prayers", "*,categories(slug),languages(code)&order=sort_order"),
    table("categories", "*&order=sort_order"),
    table("languages", "*"),
  ]);
  if (!prayers.length) throw new Error("no prayers returned");
  fs.writeFileSync(OUT, JSON.stringify({ prayers, categories, languages }, null, 1) + "\n");
  console.log(`Prayer snapshot: ${prayers.length} prayers, ${categories.length} categories`);
} catch (error) {
  if (!fs.existsSync(OUT)) throw error;
  console.warn(`Prayer snapshot: kept the existing copy (${error.message})`);
}
