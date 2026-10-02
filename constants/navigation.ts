import type { TFunction } from "i18next";

// Tabs shown in the header of both Rosary screens
export const rosaryTabs = (t: TFunction) => [
  { label: t("rosary.todaysMysteriesTab"), route: "/(tabs)/rosary" },
  { label: t("rosary.prayTab"), route: "/prayer/session" },
];
