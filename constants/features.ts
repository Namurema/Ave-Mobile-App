import { Platform } from "react-native";

// Audio is off for the web (PWA) launch: text prayers only.
// Flip to `true` to bring the players back everywhere.
export const AUDIO_ENABLED = Platform.OS !== "web";

// Paid plans (PesaPal). Off until the PesaPal account is verified: nobody is
// locked after the 7-day trial and the plans page is hidden. The server side
// stays live, so turning this on is all that's needed.
export const PAYMENTS_ENABLED = false;

// Optional email/password accounts. Ave stays free and usable without one.
export const LOGIN_ENABLED = true;
