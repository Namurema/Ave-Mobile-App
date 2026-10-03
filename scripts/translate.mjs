// Fills lib/i18n/lg.ts (Luganda) and lib/i18n/rny.ts (Runyankore) from en.ts
// using the Sunbird AI translation API.
//
// - Existing translations are kept (with doubled '' apostrophes fixed).
// - Sunbird fills keys that are missing, end in "..." (truncated), or, for
//   Runyankore, are just copied from Luganda.
// - Every Sunbird result is cached in scripts/translation-cache.json, so
//   re-running only calls the API for new or changed English text.
// - translations-review.md lists English, the current text and Sunbird's
//   suggestion side by side for a native speaker to check.
// - Prayer content (see translateContent below) goes into
//   lib/i18n/content/<lang>.json.
//
// Usage: node scripts/translate.mjs   (needs SUNBIRD_API_TOKEN in .env.local)

import fs from "fs";
import path from "path";
import { pathToFileURL, fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const I18N = path.join(ROOT, "lib", "i18n");
const CACHE_FILE = path.join(ROOT, "scripts", "translation-cache.json");
const REVIEW_FILE = path.join(ROOT, "translations-review.md");

const LANGUAGES = [
  { code: "lg", sunbird: "lug", name: "Luganda" },
  { code: "rny", sunbird: "nyn", name: "Runyankore" },
];

// Keys that moved; their old translations are reused
const RENAMED = {
  "settings.guestUser": "profile.guestUser",
  "settings.signInToSync": "profile.signInToSync",
};

const CONCURRENCY = 4;

function readToken() {
  const env = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
  const token = env.match(/^\s*SUNBIRD_API_TOKEN\s*=\s*(.+)\s*$/m)?.[1]?.trim();
  if (!token) throw new Error("SUNBIRD_API_TOKEN not found in .env.local");
  return token;
}

async function load(file) {
  return (await import(pathToFileURL(path.join(I18N, file)).href)).default;
}

function flatten(obj, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") flatten(value, full, out);
    else out[full] = String(value);
  }
  return out;
}

function unflatten(flat) {
  const out = {};
  for (const [full, value] of Object.entries(flat)) {
    const parts = full.split(".");
    let node = out;
    parts.slice(0, -1).forEach((p) => (node = node[p] ??= {}));
    node[parts.at(-1)] = value;
  }
  return out;
}

const fixApostrophes = (text) => text?.replace(/''/g, "'");

// Keep the English punctuation style: no question marks or full stops added
// to labels that don't have them
function matchPunctuation(english, translated) {
  let text = translated.trim();
  for (const mark of ["?", "."]) {
    if (!english.trim().endsWith(mark) && text.endsWith(mark) && !text.endsWith("...")) {
      text = text.slice(0, -1).trim();
    }
  }
  return text;
}

async function translate(token, text, target, attempt = 0) {
  const response = await fetch("https://api.sunbird.ai/tasks/translate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ source_language: "eng", target_language: target, text }),
  });
  // Back off on rate limits and cold starts
  if ([429, 502, 503].includes(response.status) && attempt < 5) {
    await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    return translate(token, text, target, attempt + 1);
  }
  if (!response.ok) throw new Error(`Sunbird ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const translated = data.output?.translated_text;
  if (!translated) throw new Error(`No translation for "${text}"`);
  // House style: no em dashes (U+2014) in any language
  const emDash = new RegExp(`\\s*${String.fromCharCode(0x2014)}\\s*`, "g");
  return matchPunctuation(text, translated.replace(emDash, ", "));
}

async function mapPool(items, limit, fn) {
  let next = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (next < items.length) await fn(items[next++]);
  });
  await Promise.all(workers);
}

const escapeCell = (text) => (text ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function toTypeScript(flat, languageName) {
  const body = JSON.stringify(unflatten(flat), null, 2).replace(/^(\s*)"([A-Za-z0-9_]+)":/gm, "$1$2:");
  return (
    `// ${languageName}. Lines marked "Sunbird" in translations-review.md were machine translated\n` +
    `// and need checking by a native speaker. Regenerate with: node scripts/translate.mjs\n` +
    `export default ${body};\n`
  );
}

// ---- Prayer content -------------------------------------------------------
// Mysteries, stations, novena/chaplet texts and the English prayers in
// Supabase, translated paragraph by paragraph into lib/i18n/content/<lang>.json
// (keyed by the English paragraph). Read by lib/i18n/content.ts.

const CONTENT_MODULES = [
  "rosary", "rosarySession", "stations", "novenas", "chaplets",
  "otherPrayers", "chapletTexts", "novenaTexts", "otherPrayerTexts", "scripture",
];
const CONTENT_FIELDS = new Set([
  "title", "subtitle", "virtue", "meditation", "description", "desc",
  "reflection", "heading", "body", "beads", "duration", "reference",
]);

// Must match splitParagraphs in lib/i18n/content.ts
const splitParagraphs = (text) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

function collectStrings(value, out, field) {
  if (typeof value === "string") {
    if (CONTENT_FIELDS.has(field)) splitParagraphs(value).forEach((p) => out.add(p));
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, out, field));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) collectStrings(child, out, key);
  }
}

async function supabaseEnglishPrayers() {
  const client = fs.readFileSync(path.join(ROOT, "lib", "supabase", "client.ts"), "utf8");
  const url = client.match(/supabaseUrl\s*=\s*'([^']+)'/)[1];
  const key = client.match(/supabaseAnonKey\s*=\s*'([^']+)'/)[1];
  const response = await fetch(
    `${url}/rest/v1/prayers?select=title,body,languages!inner(code)&languages.code=eq.en`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  return response.json();
}

async function translateContent(token, cache) {
  const paragraphs = new Set();
  for (const name of CONTENT_MODULES) {
    const module = await import(pathToFileURL(path.join(ROOT, "constants", "content", `${name}.ts`)).href);
    collectStrings(module, paragraphs);
  }
  for (const prayer of await supabaseEnglishPrayers()) collectStrings(prayer, paragraphs);
  const all = [...paragraphs];
  console.log(`Prayer content: ${all.length} paragraphs`);

  const sections = [];
  for (const language of LANGUAGES) {
    const cacheKey = `content-${language.code}`;
    cache[cacheKey] ??= {};
    const langCache = cache[cacheKey];
    const pending = all.filter((p) => !(p in langCache));
    console.log(`${language.name} content: ${all.length - pending.length} cached, ${pending.length} to translate`);
    let done = 0;
    await mapPool(pending, CONCURRENCY, async (paragraph) => {
      langCache[paragraph] = await translate(token, paragraph, language.sunbird);
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + "\n");
      if (++done % 20 === 0) console.log(`  ${done}/${pending.length}`);
    });

    // Drop cached paragraphs whose English no longer exists
    for (const paragraph of Object.keys(langCache)) {
      if (!paragraphs.has(paragraph)) delete langCache[paragraph];
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + "\n");

    // Hand edits in the dictionary win over the cache on re-runs
    const file = path.join(I18N, "content", `${language.code}.json`);
    const edited = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
    const dictionary = {};
    for (const paragraph of [...all].sort()) dictionary[paragraph] = edited[paragraph] ?? langCache[paragraph];
    fs.writeFileSync(file, JSON.stringify(dictionary, null, 2) + "\n");
    console.log(`${language.name} content: wrote ${all.length} paragraphs`);

    sections.push(
      `## ${language.name} prayer content (\`lib/i18n/content/${language.code}.json\`)\n\n` +
        `All ${all.length} paragraphs are machine translated by Sunbird. Prayers such as the Our Father, ` +
        `Hail Mary and Creed have official Church translations; prefer that wording over these.\n\n` +
        `| English | ${language.name} |\n|---|---|\n` +
        all.map((p) => `| ${escapeCell(p)} | ${escapeCell(dictionary[p])} |`).join("\n")
    );
  }
  return sections;
}

async function main() {
  const token = readToken();
  const en = flatten(await load("en.ts"));
  const existing = {
    lg: flatten(await load("lg.ts")),
    rny: flatten(await load("rny.ts")),
  };
  const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) : {};
  const keys = Object.keys(en);
  const review = [];

  for (const language of LANGUAGES) {
    cache[language.code] ??= {};
    const langCache = cache[language.code];
    const current = (key) => fixApostrophes(existing[language.code][key] ?? existing[language.code][RENAMED[key]]);

    // Translations from before this run, to spot lines whose English changed
    const previous = { ...langCache };

    // Ask Sunbird for every key, so the review shows a suggestion next to each line
    const pending = keys.filter((key) => langCache[key]?.en !== en[key]);
    console.log(`${language.name}: ${keys.length - pending.length} cached, ${pending.length} to translate`);
    let done = 0;
    await mapPool(pending, CONCURRENCY, async (key) => {
      langCache[key] = { en: en[key], text: await translate(token, en[key], language.sunbird) };
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + "\n");
      if (++done % 10 === 0) console.log(`  ${done}/${pending.length}`);
    });

    const result = {};
    const rows = [];
    let machineCount = 0;
    for (const key of keys) {
      const english = en[key];
      const mine = current(key);
      const suggestion = langCache[key].text;
      const luganda = fixApostrophes(existing.lg[key] ?? existing.lg[RENAMED[key]]);
      const lugandaCopy = language.code === "rny" && !!mine && mine === luganda && mine !== english;
      const truncated = mine?.endsWith("...") && !english.endsWith("...");
      // English changed and the line is still Sunbird's old, unedited output
      const stale = !!previous[key] && previous[key].en !== english && mine === previous[key].text;
      const useMachine = !mine || truncated || lugandaCopy || stale;
      result[key] = useMachine ? suggestion : mine;
      // On re-runs, lines Sunbird wrote earlier are still unreviewed machine text
      const machineMade = useMachine || mine === suggestion;
      if (machineMade) machineCount++;
      const reason = !mine ? "missing" : truncated ? "was cut off" : lugandaCopy ? "was Luganda" : stale ? "English changed" : "unreviewed";
      rows.push(
        `| \`${key}\` | ${escapeCell(english)} | ${escapeCell(mine ?? "(none)")} | ${escapeCell(suggestion)} | ${machineMade ? `**Sunbird** (${reason})` : "Current"} |`
      );
    }

    fs.writeFileSync(path.join(I18N, `${language.code}.ts`), toTypeScript(result, language.name));
    console.log(`${language.name}: wrote ${keys.length} lines (${machineCount} from Sunbird)`);
    review.push(
      `## ${language.name} (\`lib/i18n/${language.code}.ts\`)\n\n` +
        `${machineCount} of ${keys.length} lines come from Sunbird and need checking. ` +
        `Where "Current" is used, Sunbird's suggestion is shown only for comparison.\n\n` +
        `| Key | English | Current | Sunbird suggestion | Used |\n|---|---|---|---|---|\n` +
        rows.join("\n")
    );
  }

  review.push(...(await translateContent(token, cache)));

  fs.writeFileSync(
    REVIEW_FILE,
    `# Translation review\n\n` +
      `Generated by \`scripts/translate.mjs\`. For each line, a native speaker should check the text in the "Used" column. ` +
      `To change a line, edit it in the language file directly; re-running the script keeps your edits.\n\n` +
      review.join("\n\n") +
      "\n"
  );
  console.log(`Review file: ${path.relative(ROOT, REVIEW_FILE)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
