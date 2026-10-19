// Turns novena texts pasted into a plain text file into app pages, so long
// prayers don't have to be retyped. Writes them into
// constants/content/novenaTexts.ts between the IMPORTED NOVENAS markers
// (replacing what was there), then run `node scripts/translate.mjs`.
//
//   node scripts/import-novenas.mjs
//
// To import more novenas: paste them into a text file, then add an entry to
// NOVENAS below with the line numbers of each section (an editor shows them).
// List entries, dates and photos are set in novenas.ts, lib/seasons.ts and
// constants/images.ts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "components", "contents", "novenas", "novenas.txt");
const TARGET = path.join(ROOT, "constants", "content", "novenaTexts.ts");
const BEGIN = "  // BEGIN IMPORTED NOVENAS (scripts/import-novenas.mjs)";
const END = "  // END IMPORTED NOVENAS";

const OPENING = "In the Name of the Father, and of the Son, and of the Holy Spirit. Amen.";
const howTo = (days) => `Pray the same prayers each day, for ${days} days in a row.`;

// [heading, first line, last line] or [heading, fixed text]
const NOVENAS = [
  {
    id: "14",
    title: "Novena to Our Lady of Fatima",
    sections: [
      ["Prayer to Our Lady of Fatima", 10, 16],
      ["Prayer of Reparation", 17, 17],
      ["Concluding Prayers", 19, 22],
    ],
  },
  {
    id: "2",
    title: "Novena to Our Lady of Perpetual Help",
    sections: [
      ["Litany of Our Lady of Perpetual Help", 38, 219],
      ["Let Us Pray", 223, 225],
      ["Prayer to Our Lady of Perpetual Help", 227, 237],
      ["Concluding Prayer", "Hail Mary (three times)"],
    ],
  },
  {
    id: "15",
    title: "Novena to St. Dominic",
    sections: [
      ["Prayer to St. Dominic", 254, 262],
      ["For a Spirit of Compassion", 263, 271],
      ["To Our Lady, Queen of the Rosary", 273, 275],
    ],
  },
  {
    id: "16",
    title: "Novena to Our Lady of Sorrows",
    sections: [
      ["Prayer to Our Lady of Sorrows", 290, 292],
      ["At the Cross Her Station Keeping", 293, 297],
      ["The First Sorrow", 299, 300],
      ["The Memorare", 302, 304],
    ],
  },
];

const lines = fs.readFileSync(SOURCE, "utf8").replace(/\r/g, "").split("\n");

// Lines first..last (1-based): blank lines separate paragraphs, other line
// breaks are kept. Dashes become commas, as everywhere in the app.
function text(first, last) {
  return lines
    .slice(first - 1, last)
    .join("\n")
    .replace(/\s*[–—]\s*/g, ", ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const entries = NOVENAS.map((novena) => {
  const sections = [
    { heading: "How to Pray This Novena", body: howTo(9) },
    { heading: "Opening", body: OPENING },
    ...novena.sections.map(([heading, a, b]) => ({ heading, body: typeof a === "string" ? a : text(a, b) })),
    { heading: "Closing", body: OPENING },
  ];
  const value = {
    title: novena.title,
    subtitle: "Pray these prayers once a day for 9 days",
    icon: "",
    color: "#01758F",
    sections,
  };
  const body = JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
  return `  ${JSON.stringify(novena.id)}: ${body},`;
});

let target = fs.readFileSync(TARGET, "utf8");
if (!target.includes(BEGIN)) {
  // First run: the hand-written Perpetual Help entry is replaced by the import
  target = target.replace(/\n  "2": \{[\s\S]*?\n  \},\n/, "\n");
  target = target.replace(/\n\};\s*$/, `\n${BEGIN}\n${END}\n};\n`);
}
const start = target.indexOf(BEGIN) + BEGIN.length;
const stop = target.indexOf(END);
target = target.slice(0, start) + "\n" + entries.join("\n") + "\n" + target.slice(stop);
fs.writeFileSync(TARGET, target);
console.log(`Imported ${entries.length} novenas into constants/content/novenaTexts.ts`);
