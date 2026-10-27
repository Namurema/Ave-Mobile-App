// Builds the For You cards (app/(tabs)/foryou.tsx) into public/foryou/<lang>/<mood>.json.
//
// - Moods, verse references and messages live in scripts/foryou/moods-*.mjs.
// - Verse text is fetched word for word from the World English Bible, British
//   edition (public domain, says "the LORD", includes the Catholic books), and
//   cached in scripts/foryou/bible-cache.json.
// - Messages are translated into every app language. Verses are translated
//   only into Spanish and Italian (DeepL); the Ugandan languages and Swahili
//   show the English verse, since Scripture is not machine translated there.
// - Untranslated cards fall back to English, so a language can be finished later.
//
// Usage: node scripts/build-foryou.mjs [--no-translate] [--only=es,it]

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGUAGES, CACHE_FILE, CONCURRENCY, readToken, canTranslate, translate, saveCache, mapPool } from "./translate.mjs";
import partA from "./foryou/moods-a.mjs";
import partB from "./foryou/moods-b.mjs";
import partC from "./foryou/moods-c.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "foryou");
const BIBLE_CACHE = path.join(ROOT, "scripts", "foryou", "bible-cache.json");
const MOODS = [...partA, ...partB, ...partC];
const EM_DASH = String.fromCharCode(0x2014);

// ---- Checks -----------------------------------------------------------------

for (const mood of MOODS) {
  for (const list of ["verses", "messages"]) {
    if (mood[list].length !== 50) throw new Error(`${mood.key}: ${mood[list].length} ${list}, expected 50`);
    const seen = new Set();
    for (const item of mood[list]) {
      if (seen.has(item)) throw new Error(`${mood.key}: duplicate ${item}`);
      if (item.includes(EM_DASH)) throw new Error(`${mood.key}: em dash in ${item}`);
      seen.add(item);
    }
  }
}

// ---- Verses -------------------------------------------------------------------

const bible = fs.existsSync(BIBLE_CACHE) ? JSON.parse(fs.readFileSync(BIBLE_CACHE, "utf8")) : {};
const saveBible = () => fs.writeFileSync(BIBLE_CACHE, JSON.stringify(bible, null, 2) + "\n");

// A verse lifted out of its passage, made to read as a whole on a card:
// poetry line breaks become spaces, "Selah" goes, quotation marks opened or
// closed outside the verse are dropped, and it starts with a capital and ends
// with a full stop
const count = (text, mark) => text.split(mark).length - 1;
function clean(text) {
  let t = text.replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").replace(/\s*\bSelah\.?/g, "").trim();
  if (t.startsWith("“") && count(t, "“") > count(t, "”")) t = t.slice(1);
  if (t.endsWith("”") && count(t, "”") > count(t, "“")) t = t.slice(0, -1);
  if (count(t, "”") > count(t, "“")) t = t.replace("”", "");
  if (count(t, "“") > count(t, "”")) t += "”";
  if (t.startsWith("‘")) t = t.slice(1).replace(/’(?=[”]?$)/, "");
  // WEBBE capitalises "The" before "LORD" mid-sentence
  t = t.replace(/([a-z,;] )The LORD/g, "$1the LORD");
  t = t.charAt(0).toUpperCase() + t.slice(1);
  t = t.replace(/[,;:]$/, ".");
  if (!/[.!?”’]$/.test(t)) t += ".";
  return t;
}

async function fetchVerse(reference, attempt = 0) {
  const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=webbe`);
  if (response.status === 429 && attempt < 6) {
    await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
    return fetchVerse(reference, attempt + 1);
  }
  if (!response.ok) throw new Error(`${reference}: ${response.status}`);
  const data = await response.json();
  if (!data.verses?.length) throw new Error(`${reference}: no verses`);
  return data.verses.map((verse) => verse.text).join(" ").replace(/\s+/g, " ").trim();
}

const references = [...new Set(MOODS.flatMap((mood) => mood.verses))];
const missing = references.filter((reference) => !bible[reference]);
console.log(`Verses: ${references.length} references, ${missing.length} to fetch`);
const failed = [];
for (const reference of missing) {
  try {
    bible[reference] = await fetchVerse(reference);
    saveBible();
  } catch (error) {
    failed.push(error.message);
  }
  // bible-api.com allows about 15 requests every 30 seconds
  await new Promise((r) => setTimeout(r, 2100));
}
if (failed.length) {
  console.log(`Could not fetch:\n  ${failed.join("\n  ")}`);
  process.exit(1);
}

// ---- Cards --------------------------------------------------------------------

// Stable ids, so likes and saves survive reordering: verses by reference,
// messages by a hash of their English text
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function hash(text) {
  let h = 0x811c9dc5;
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 0x01000193) >>> 0;
  return h.toString(36);
}

// Book names for the Spanish and Italian references
const BOOKS = {
  es: {
    Genesis: "Génesis", Exodus: "Éxodo", Numbers: "Números", Deuteronomy: "Deuteronomio", Joshua: "Josué",
    "1 Kings": "1 Reyes", "1 Chronicles": "1 Crónicas", "2 Chronicles": "2 Crónicas", Nehemiah: "Nehemías",
    Tobit: "Tobías", "2 Maccabees": "2 Macabeos", Job: "Job", Psalm: "Salmo", Proverbs: "Proverbios",
    Ecclesiastes: "Eclesiastés", Wisdom: "Sabiduría", Sirach: "Eclesiástico", Isaiah: "Isaías", Jeremiah: "Jeremías",
    Lamentations: "Lamentaciones", Baruch: "Baruc", Ezekiel: "Ezequiel", Daniel: "Daniel", Hosea: "Oseas",
    Joel: "Joel", Jonah: "Jonás", Micah: "Miqueas", Habakkuk: "Habacuc", Zephaniah: "Sofonías", Haggai: "Ageo",
    Zechariah: "Zacarías", Malachi: "Malaquías", Matthew: "Mateo", Mark: "Marcos", Luke: "Lucas", John: "Juan",
    Acts: "Hechos", Romans: "Romanos", "1 Corinthians": "1 Corintios", "2 Corinthians": "2 Corintios",
    Galatians: "Gálatas", Ephesians: "Efesios", Philippians: "Filipenses", Colossians: "Colosenses",
    "1 Thessalonians": "1 Tesalonicenses", "2 Thessalonians": "2 Tesalonicenses", "1 Timothy": "1 Timoteo",
    "2 Timothy": "2 Timoteo", Titus: "Tito", Hebrews: "Hebreos", James: "Santiago", "1 Peter": "1 Pedro",
    "1 John": "1 Juan", Revelation: "Apocalipsis",
  },
  it: {
    Genesis: "Genesi", Exodus: "Esodo", Numbers: "Numeri", Deuteronomy: "Deuteronomio", Joshua: "Giosuè",
    "1 Kings": "1 Re", "1 Chronicles": "1 Cronache", "2 Chronicles": "2 Cronache", Nehemiah: "Neemia",
    Tobit: "Tobia", "2 Maccabees": "2 Maccabei", Job: "Giobbe", Psalm: "Salmo", Proverbs: "Proverbi",
    Ecclesiastes: "Qoèlet", Wisdom: "Sapienza", Sirach: "Siracide", Isaiah: "Isaia", Jeremiah: "Geremia",
    Lamentations: "Lamentazioni", Baruch: "Baruc", Ezekiel: "Ezechiele", Daniel: "Daniele", Hosea: "Osea",
    Joel: "Gioele", Jonah: "Giona", Micah: "Michea", Habakkuk: "Abacuc", Zephaniah: "Sofonia", Haggai: "Aggeo",
    Zechariah: "Zaccaria", Malachi: "Malachia", Matthew: "Matteo", Mark: "Marco", Luke: "Luca", John: "Giovanni",
    Acts: "Atti", Romans: "Romani", "1 Corinthians": "1 Corinzi", "2 Corinthians": "2 Corinzi",
    Galatians: "Galati", Ephesians: "Efesini", Philippians: "Filippesi", Colossians: "Colossesi",
    "1 Thessalonians": "1 Tessalonicesi", "2 Thessalonians": "2 Tessalonicesi", "1 Timothy": "1 Timoteo",
    "2 Timothy": "2 Timoteo", Titus: "Tito", Hebrews: "Ebrei", James: "Giacomo", "1 Peter": "1 Pietro",
    "1 John": "1 Giovanni", Revelation: "Apocalisse",
  },
};
function localReference(reference, code) {
  const [, book, rest] = reference.match(/^(.+?) (\d.*)$/);
  const name = BOOKS[code]?.[book];
  if (BOOKS[code] && !name) throw new Error(`No ${code} name for ${book}`);
  // Italian and Spanish write chapter and verse with a comma: Salmo 34,18
  return name ? `${name} ${rest.replace(":", ",")}` : reference;
}

// ---- Translation --------------------------------------------------------------

const translateAll = !process.argv.includes("--no-translate");
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) : {};
const messages = [...new Set(MOODS.flatMap((mood) => mood.messages))];
const verseText = (reference) => clean(bible[reference]);
const verseTexts = [...new Set(references.map(verseText))];

if (translateAll) {
  const keys = readToken();
  // --only=es,it translates just those languages (the others keep what they have)
  const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice("--only=".length).split(",");
  for (const language of LANGUAGES) {
    if (!canTranslate(keys, language) || (only && !only.includes(language.code))) continue;
    const langCache = (cache[`foryou-${language.code}`] ??= {});
    // Scripture only goes through DeepL (Spanish, Italian)
    const wanted = language.deepl ? [...messages, ...verseTexts] : messages;
    const pending = wanted.filter((text) => !(text in langCache));
    console.log(`${language.name}: ${wanted.length - pending.length} cached, ${pending.length} to translate`);
    let done = 0;
    try {
      await mapPool(pending, CONCURRENCY, async (text) => {
        langCache[text] = await translate(keys, text, language, "prefer_less");
        saveCache(cache);
        if (++done % 50 === 0) console.log(`  ${done}/${pending.length}`);
      });
    } catch (error) {
      console.log(`${language.name}: stopped (${String(error.message).slice(0, 120)}). Run again later to finish.`);
    }
    saveCache(cache, true);
  }
}

// ---- Output -------------------------------------------------------------------

const index = MOODS.map((mood) => mood.key);
for (const code of ["en", ...LANGUAGES.map((language) => language.code)]) {
  const dir = path.join(OUT, code);
  fs.mkdirSync(dir, { recursive: true });
  const langCache = cache[`foryou-${code}`] ?? {};
  const local = (text) => (code === "en" ? text : langCache[text] ?? text);
  const translatesVerses = code === "es" || code === "it";
  for (const mood of MOODS) {
    const cards = {
      verses: mood.verses.map((reference) => ({
        id: `${mood.key}.v.${slug(reference)}`,
        text: translatesVerses ? local(verseText(reference)) : verseText(reference),
        ref: translatesVerses ? localReference(reference, code) : reference,
      })),
      messages: mood.messages.map((text) => ({ id: `${mood.key}.m.${hash(text)}`, text: local(text) })),
    };
    fs.writeFileSync(path.join(dir, `${mood.key}.json`), JSON.stringify(cards));
  }
}
fs.writeFileSync(path.join(OUT, "moods.json"), JSON.stringify(index));
console.log(`Wrote ${MOODS.length} moods for ${LANGUAGES.length + 1} languages to public/foryou`);
