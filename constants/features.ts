import { Platform } from "react-native";

// Audio is off for the web (PWA) launch: text prayers only.
// Flip to `true` to bring the players back everywhere.
export const AUDIO_ENABLED = Platform.OS !== "web";

// Optional email/password accounts. Ave stays free and usable without one.
export const LOGIN_ENABLED = true;
