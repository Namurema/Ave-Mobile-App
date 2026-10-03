// Lists only show entries that have a full text, so nothing in the app leads
// to an empty page. To publish a novena, chaplet or prayer, add its text to
// novenaTexts.ts, chapletTexts.ts or otherPrayerTexts.ts under the same id.
import { novenas } from "./novenas";
import { novenaContent } from "./novenaTexts";
import { chaplets } from "./chaplets";
import { chapletContent } from "./chapletTexts";
import { categories } from "./otherPrayers";
import { prayerContent } from "./otherPrayerTexts";

export const availableNovenas = novenas.filter((novena) => novena.id in novenaContent);

export const availableChaplets = chaplets.filter((chaplet) => chaplet.id in chapletContent);

export const availableOtherPrayers = categories
  .map((category) => ({
    ...category,
    prayers: category.prayers.filter((prayer) => prayer.id in prayerContent),
  }))
  .filter((category) => category.prayers.length > 0);

export const otherPrayersCount = availableOtherPrayers.reduce(
  (total, category) => total + category.prayers.length,
  0
);
