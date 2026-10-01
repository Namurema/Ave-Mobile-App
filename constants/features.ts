import { Platform } from "react-native";

// Audio is off for the web (PWA) launch — text prayers only.
// Flip to `true` to bring the players back everywhere.
export const AUDIO_ENABLED = Platform.OS !== "web";

// The web launch is free and needs no account: no Google sign-in, no Premium.
export const LOGIN_ENABLED = Platform.OS !== "web";
