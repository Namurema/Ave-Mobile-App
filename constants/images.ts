// Photos used in headers and cards: compressed copies of Pexels photos
// (free to use). Originals stay out of the repository.
export const images = {
  prayingHands: require("../assets/images/praying-hands.jpg"),
  silhouette: require("../assets/images/silhouette-prayer.jpg"),
  rosaryFern: require("../assets/images/rosary-fern.jpg"),
  rosaryHands: require("../assets/images/rosary-hands.jpg"),
  rosaryWall: require("../assets/images/rosary-wall.jpg"),
  handsNight: require("../assets/images/hands-night.jpg"),
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
  "2": images.rosaryFern,
  "6": images.prayingHands,
  "7": images.silhouette,
  "8": images.rosaryWall,
  "9": images.rosaryHands,
  "10": images.handsNight,
  "11": images.rosaryFern,
  "12": images.rosaryWall,
  "13": images.prayingHands,
  "5": images.silhouette,
  "14": images.rosaryHands,
  "15": images.rosaryWall,
  "16": images.silhouette,
};
export const novenaImage = (id?: string) => (id && novenaImages[id]) || images.prayingHands;
