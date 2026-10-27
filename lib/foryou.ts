import { Platform } from "react-native";
import { supabase } from "./supabase/client";
import { SITE_URL } from "../constants/site";

// For You: Bible verses and uplifting messages by feeling. The cards are static
// files made by scripts/build-foryou.mjs (public/foryou/<lang>/<mood>.json),
// fetched when a feeling is opened so they don't weigh down the app.

export const MOODS = [
  "sad", "hopeless", "disappointed", "depressed", "lost",
  "grieving", "pain", "betrayed", "anxious", "lonely",
  "afraid", "guilty", "tired", "thankful", "peaceful",
] as const;
export type Mood = (typeof MOODS)[number];
export type CardKind = "verses" | "messages";
export type FeedCard = { id: string; text: string; ref?: string };
type MoodFile = Record<CardKind, FeedCard[]>;

// The heaviest feelings open with a card about getting help
export const CARE_MOODS: Mood[] = ["depressed", "hopeless", "grieving"];

export const isMood = (value: unknown): value is Mood => MOODS.includes(value as Mood);
export const moodOf = (id: string) => id.split(".")[0] as Mood;

const files = new Map<string, Promise<MoodFile>>();

async function fetchFile(language: string, mood: Mood): Promise<MoodFile> {
  const response = await fetch(`/foryou/${language}/${mood}.json`);
  if (!response.ok) throw new Error(`For You ${response.status}`);
  return response.json();
}

// The app language's cards, or English if they aren't there
export function loadMood(language: string, mood: Mood): Promise<MoodFile> {
  const key = `${language}/${mood}`;
  if (!files.has(key)) {
    const promise = fetchFile(language, mood).catch((error) => {
      if (language !== "en") return fetchFile("en", mood);
      throw error;
    });
    // A failed load can be retried later
    promise.catch(() => files.delete(key));
    files.set(key, promise);
  }
  return files.get(key)!;
}

// Saved cards, found by id across their feelings' files
export async function loadCards(language: string, ids: string[]): Promise<FeedCard[]> {
  const moods = [...new Set(ids.map(moodOf).filter(isMood))];
  const found = new Map<string, FeedCard>();
  await Promise.all(
    moods.map(async (mood) => {
      const file = await loadMood(language, mood).catch(() => null);
      if (!file) return;
      for (const card of [...file.verses, ...file.messages]) found.set(card.id, card);
    })
  );
  return ids.map((id) => found.get(id)).filter((card): card is FeedCard => !!card);
}

// ---- Likes: private, kept on this device ----------------------------------

const LIKES_KEY = "ave-foryou-likes";

export function readLikes(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKES_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function writeLikes(likes: Set<string>) {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify([...likes]));
  } catch {}
}

// Saves use the favourites list (synced with the account) under this prefix
export const savedKey = (id: string) => `foryou:${id}`;

// ---- Cards the admin has hidden (supabase/migrations/20261027_foryou_hidden.sql)

export async function fetchHidden(): Promise<Set<string>> {
  const { data, error } = await supabase.from("foryou_hidden").select("id");
  if (error || !data) return new Set();
  return new Set(data.map((row) => row.id as string));
}

export async function setHidden(id: string, hidden: boolean) {
  const { error } = hidden
    ? await supabase.from("foryou_hidden").insert({ id })
    : await supabase.from("foryou_hidden").delete().eq("id", id);
  if (error) throw error;
}

// ---- Sharing --------------------------------------------------------------

// The phone's share sheet where there is one, otherwise copy to the clipboard.
// Returns "copied" when the text was copied.
export async function shareCard(card: FeedCard): Promise<"shared" | "copied" | "failed"> {
  if (Platform.OS !== "web") return "failed";
  const text = `${card.text}${card.ref ? `\n${card.ref}` : ""}\n\nAve: ${SITE_URL}`;
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return "shared";
    }
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch (error) {
    // Closing the share sheet is not a failure
    return (error as Error)?.name === "AbortError" ? "shared" : "failed";
  }
}
