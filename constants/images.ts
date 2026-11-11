// Photos used in headers and cards: compressed copies of Pexels photos
// (free to use). Originals stay out of the repository.
export const images = {
  prayingHands: require("../assets/images/praying-hands.jpg"),
  silhouette: require("../assets/images/silhouette-prayer.jpg"),
  rosaryFern: require("../assets/images/rosary-fern.jpg"),
  rosaryHands: require("../assets/images/rosary-hands.jpg"),
  rosaryWall: require("../assets/images/rosary-wall.jpg"),
  handsNight: require("../assets/images/hands-night.jpg"),
  novenasTile: require("../assets/images/tile-novenas.jpg"),
  heroSunrise: require("../assets/images/hero-sunrise.jpg"),
};

// Illustrations in the African Catholic style (made from the prompts in
// design/illustration-prompts.md; assets/illustrations, 1200 px wide)
export const art = {
  rosary: require("../assets/illustrations/rosary.jpg"),
  divineMercy: require("../assets/illustrations/divine-mercy.jpg"),
  stJude: require("../assets/illustrations/st-jude.jpg"),
  stJoseph: require("../assets/illustrations/st-joseph.jpg"),
  fertility: require("../assets/illustrations/fertility.jpg"),
  ourLady: require("../assets/illustrations/our-lady-angels.jpg"),
  maryChild: require("../assets/illustrations/mary-child.jpg"),
  forYou: require("../assets/illustrations/for-you.jpg"),
  ugandaMartyrs: require("../assets/illustrations/uganda-martyrs.jpg"),
  groupPrayer: require("../assets/illustrations/group-prayer.jpg"),
  familyPrayer: require("../assets/illustrations/family-prayer.jpg"),
};

// Square tiles for Morning, Midday and Night
export const dailyTiles: Record<string, any> = {
  morning: require("../assets/images/tile-morning.jpg"),
  midday: require("../assets/images/tile-midday.jpg"),
  night: require("../assets/images/tile-night.jpg"),
};

// Header photo for each daily prayer and novena
export const dailyImages: Record<string, any> = {
  morning: require("../assets/images/header-morning.jpg"),
  midday: require("../assets/images/header-midday.jpg"),
  night: require("../assets/images/header-night.jpg"),
};

const novenaImages: Record<string, any> = {
  "2": art.ourLady,
  "6": art.stJude,
  "7": images.silhouette,
  "8": images.rosaryWall,
  "9": art.maryChild,
  "10": images.handsNight,
  "11": art.maryChild,
  "12": art.stJoseph,
  "13": art.fertility,
  "5": art.divineMercy,
  "14": art.rosary,
  "15": images.rosaryWall,
  "16": images.silhouette,
};
export const novenaImage = (id?: string) => (id && novenaImages[id]) || images.prayingHands;

// A picture for any prayer key (lib/items.ts), for cards on Me and elsewhere
export function itemImage(key: string) {
  const [kind, id] = key.split(":");
  if (kind === "daily") return dailyTiles[id] ?? images.prayingHands;
  if (kind === "novena") return novenaImage(id);
  if (kind === "rosary") return art.rosary;
  if (kind === "chaplet") return art.divineMercy;
  if (kind === "stations") return images.rosaryWall;
  return images.prayingHands;
}
