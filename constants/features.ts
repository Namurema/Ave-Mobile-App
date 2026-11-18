import { Platform } from "react-native";

// Audio is off for the web (PWA) launch: text prayers only.
// Flip to `true` to bring the players back everywhere.
export const AUDIO_ENABLED = Platform.OS !== "web";

// Paid plans (ObPay). On: 7 days free for every account (and for guests, from
// their first visit on the device), then a plan is needed. Off: nobody is
// locked and the plans page is hidden.
export const PAYMENTS_ENABLED = true;

// Optional email/password accounts. Ave stays free and usable without one.
export const LOGIN_ENABLED = true;

// true: every page except the landing, sign-in and legal pages needs an
// account. false: anyone can browse and pray; an account keeps progress,
// favourites and routines on all devices.
export const ACCOUNT_REQUIRED = false;
