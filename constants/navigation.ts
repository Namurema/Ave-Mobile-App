import type { TFunction } from "i18next";

// Tabs shown in the header of both Rosary screens
export const rosaryTabs = (t: TFunction) => [
  { label: t("rosary.todaysMysteriesTab"), route: "/(tabs)/rosary" },
  { label: t("rosary.prayTab"), route: "/prayer/session" },
];

// Full-page versions of the sign-in pop-up's views
export const AUTH_ROUTES = {
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
  forgot: "/auth/forgot-password",
  confirmEmail: "/auth/sign-up",
} as const;
