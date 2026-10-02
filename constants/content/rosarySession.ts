// Mystery details for the guided Rosary session, by weekday (Sunday first).
// Translated through the content dictionaries; see scripts/translate.mjs.
const gloriousMysteries = [
  { number: 1, title: "The Resurrection", virtue: "Faith", description: "Focus on the glorious resurrection of Jesus Christ from the dead." },
  { number: 2, title: "The Ascension", virtue: "Hope", description: "Focus on Jesus ascending into heaven forty days after His resurrection." },
  { number: 3, title: "Descent of the Holy Spirit", virtue: "Love of God", description: "Focus on the Holy Spirit descending upon Mary and the Apostles." },
  { number: 4, title: "The Assumption", virtue: "Grace of a Happy Death", description: "Focus on Mary being assumed body and soul into heavenly glory." },
  { number: 5, title: "Coronation of Mary", virtue: "Trust in Mary's Intercession", description: "Focus on Mary being crowned Queen of Heaven and Earth." },
];

const joyfulMysteries = [
  { number: 1, title: "The Annunciation", virtue: "Humility", description: "Focus on the Angel Gabriel announcing to Mary the Incarnation." },
  { number: 2, title: "The Visitation", virtue: "Love of Neighbour", description: "Focus on Mary visiting her cousin Elizabeth." },
  { number: 3, title: "The Nativity", virtue: "Poverty & Detachment", description: "Focus on the birth of Jesus Christ in Bethlehem." },
  { number: 4, title: "The Presentation", virtue: "Obedience", description: "Focus on Mary and Joseph presenting Jesus in the Temple." },
  { number: 5, title: "Finding in the Temple", virtue: "Piety", description: "Focus on the twelve-year-old Jesus found among the teachers." },
];

const sorrowfulMysteries = [
  { number: 1, title: "The Agony in the Garden", virtue: "Contrition", description: "Focus on the virtue of true contrition for our sins." },
  { number: 2, title: "The Scourging at the Pillar", virtue: "Purity", description: "Focus on the virtue of purity." },
  { number: 3, title: "The Crowning with Thorns", virtue: "Courage", description: "Focus on the virtue of moral courage." },
  { number: 4, title: "Carrying of the Cross", virtue: "Patience", description: "Focus on the virtue of patience." },
  { number: 5, title: "The Crucifixion", virtue: "Self-denial", description: "Focus on the virtue of self-denial." },
];

const luminousMysteries = [
  { number: 1, title: "Baptism of Jesus", virtue: "Openness to the Holy Spirit", description: "Focus on the baptism of Jesus in the Jordan River." },
  { number: 2, title: "Wedding at Cana", virtue: "To Jesus through Mary", description: "Focus on Jesus performing His first miracle at Cana." },
  { number: 3, title: "Proclamation of the Kingdom", virtue: "Repentance & Trust", description: "Focus on Jesus proclaiming the Kingdom of God." },
  { number: 4, title: "The Transfiguration", virtue: "Desire for Holiness", description: "Focus on Jesus being transfigured on Mount Tabor." },
  { number: 5, title: "Institution of the Eucharist", virtue: "Eucharistic Adoration", description: "Focus on Jesus instituting the Holy Eucharist." },
];

export const mysteryDetailsMap: Record<number, typeof sorrowfulMysteries> = {
  0: gloriousMysteries,
  1: joyfulMysteries,
  2: sorrowfulMysteries,
  3: gloriousMysteries,
  4: luminousMysteries,
  5: sorrowfulMysteries,
  6: joyfulMysteries,
};
