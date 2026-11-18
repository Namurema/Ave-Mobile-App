import { Platform } from "react-native";

// Audio is off for the web (PWA) launch: text prayers only.
// Flip to `true` to bring the players back everywhere.
export const AUDIO_ENABLED = Platform.OS !== "web";

// Paid plans (ObPay). On: 7 days free from sign-up, then a plan is needed.
// Off: nobody is locked and the plans page is hidden.
export const PAYMENTS_ENABLED = true;

// Optional email/password accounts. Ave stays free and usable without one.
export const LOGIN_ENABLED = true;

// true: guests can open the landing page, Home, sign-in and the legal pages;
// anything else (a prayer, a tab, Pray now) opens "Create account" on Home and
// goes there after signing up. false: anyone can browse and pray.
export const ACCOUNT_REQUIRED = true;
