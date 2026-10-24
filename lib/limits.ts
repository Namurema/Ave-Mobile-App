import { Platform } from "react-native";

// Field lengths for the sign-in, sign-up and feedback forms. The database
// enforces the same limits (supabase/migrations/20261012_limits.sql).
export const MAX_LENGTH = {
  name: 60,
  email: 254,
  // Supabase ignores anything after 72 characters of a password
  password: 72,
  feedback: 2000,
  feedbackEmail: 200,
};

// "  Mary \n Nakato " → "Mary Nakato": names stay on one line
export const cleanName = (name: string) => name.replace(/\s+/g, " ").trim();

// ---- Rate limits on this device ----------------------------------------------
// Supabase also limits requests on its side; these stop people (and scripts in
// the browser) from hammering the buttons. Attempts are kept in localStorage on
// the web so a page reload doesn't reset them.

type Rule = { max: number; windowMs: number };

const MINUTE = 60 * 1000;

export const RATE_LIMITS = {
  // 5 failed sign-ins in 2 minutes, then wait
  signIn: { max: 5, windowMs: 2 * MINUTE },
  signUp: { max: 3, windowMs: 10 * MINUTE },
  // Matches Supabase's 60 seconds between emails to the same person
  passwordReset: { max: 1, windowMs: MINUTE },
  // Wrong codes from the email
  verifyCode: { max: 5, windowMs: 5 * MINUTE },
  feedback: { max: 3, windowMs: 10 * MINUTE },
} satisfies Record<string, Rule>;

const memory = new Map<string, number[]>();

function load(key: string): number[] {
  if (Platform.OS === "web") {
    try {
      const saved = JSON.parse(localStorage.getItem(`ave-limit-${key}`) ?? "[]");
      if (Array.isArray(saved)) return saved.filter((n) => typeof n === "number");
    } catch {
      // Storage blocked: fall back to memory
    }
  }
  return memory.get(key) ?? [];
}

function save(key: string, times: number[]) {
  memory.set(key, times);
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(`ave-limit-${key}`, JSON.stringify(times));
    } catch {
      // Storage blocked: memory copy still applies
    }
  }
}

export function rateLimit(key: keyof typeof RATE_LIMITS) {
  const { max, windowMs } = RATE_LIMITS[key];
  const recent = () => load(key).filter((time) => Date.now() - time < windowMs);
  return {
    // True while the limit is reached
    blocked: () => recent().length >= max,
    record: () => save(key, [...recent(), Date.now()]),
    reset: () => save(key, []),
  };
}
