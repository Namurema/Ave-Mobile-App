import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useLanguageStore } from "../store/LanguageStore";
import { languageInfo } from "../constants/languages";

// Read aloud with the device's own voice (Web Speech API), in the app's
// language where the phone has a voice for it (constants/languages.ts: `speech`).
// Phones have no Luganda or Runyankore voices, so those have no Play button.

export type SpeechSection = { heading?: string; body: string };
// A piece read in one go, and where it sits: a section's heading, or the
// characters start..end of its body (for highlighting while it's read)
export type Chunk = { text: string; section: number; part: "heading" | "body"; start: number; end: number };

export const canSpeak = () =>
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof SpeechSynthesisUtterance !== "undefined";

// Short pieces: some browsers stop long utterances part way, and pausing
// restarts from the current piece
const MAX_CHUNK = 220;

// Each line of a body is read separately; long lines are split into
// sentences (very long sentences at commas) and regrouped up to MAX_CHUNK.
// Offsets point into the original text, so its layout is kept when highlighting.
// (No lookbehind in these patterns: older iPhones lack it.)
function bodyChunks(body: string, section: number): Chunk[] {
  const chunks: Chunk[] = [];
  const push = (start: number, end: number) => {
    const raw = body.slice(start, end);
    const text = raw.trim();
    if (!text) return;
    const lead = raw.length - raw.trimStart().length;
    chunks.push({ text, section, part: "body", start: start + lead, end: start + lead + text.length });
  };

  const lines = /[^\n]+/g;
  for (let line = lines.exec(body); line; line = lines.exec(body)) {
    const offset = line.index;
    const text = line[0];
    if (text.length <= MAX_CHUNK) {
      push(offset, offset + text.length);
      continue;
    }
    const pieces: [number, number][] = [];
    const sentences = /[^.!?;:]+[.!?;:]*\s*/g;
    for (let s = sentences.exec(text); s; s = sentences.exec(text)) {
      if (s[0].length <= MAX_CHUNK) {
        pieces.push([s.index, s.index + s[0].length]);
        continue;
      }
      const clauses = /[^,]+,?\s*/g;
      for (let c = clauses.exec(s[0]); c; c = clauses.exec(s[0])) {
        pieces.push([s.index + c.index, s.index + c.index + c[0].length]);
      }
    }
    let groupStart = -1;
    let groupEnd = -1;
    for (const [start, end] of pieces) {
      if (groupStart >= 0 && end - groupStart > MAX_CHUNK) {
        push(offset + groupStart, offset + groupEnd);
        groupStart = -1;
      }
      if (groupStart < 0) groupStart = start;
      groupEnd = end;
    }
    if (groupStart >= 0) push(offset + groupStart, offset + groupEnd);
  }
  return chunks;
}

export function toChunks(sections: SpeechSection[]): Chunk[] {
  return sections.flatMap((section, index) => [
    ...(section.heading?.trim()
      ? [{ text: section.heading.trim(), section: index, part: "heading" as const, start: 0, end: 0 }]
      : []),
    ...bodyChunks(section.body, index),
  ]);
}

// A voice on the device for a language ("en", "sw"...), preferring voices
// that work offline, and British English for English
function voiceFor(lang: string) {
  const voices = window.speechSynthesis.getVoices();
  const matches = voices.filter((v) => new RegExp(`^${lang}([-_]|$)`, "i").test(v.lang));
  return (
    (lang === "en" ? matches.find((v) => /^en[-_]GB/i.test(v.lang) && v.localService) : undefined) ??
    matches.find((v) => v.localService) ??
    matches[0] ??
    null
  );
}

// Browsers load their voice list after the page; re-check when it arrives
function useVoicesReady() {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!canSpeak()) return;
    const update = () => setTick((tick) => tick + 1);
    window.speechSynthesis.addEventListener?.("voiceschanged", update);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", update);
  }, []);
}

// Only one text reads at a time: starting another stops the previous one
let speaker: { current: () => void } | null = null;

export type ReadAloudState = "idle" | "playing" | "paused";

export function useReadAloud(sections: SpeechSection[]) {
  const language = useLanguageStore((store) => store.language);
  const speechLang = languageInfo(language).speech;
  useVoicesReady();
  const [state, setState] = useState<ReadAloudState>("idle");
  const [position, setPosition] = useState(0);
  const chunks = useRef<Chunk[]>([]);
  // Bumped on every start or stop; callbacks from older utterances are ignored
  const run = useRef(0);
  const positionRef = useRef(0);
  // Latest stop function, so other readers can stop this one
  const stopRef = useRef<() => void>(() => {});

  const halt = (next: ReadAloudState) => {
    run.current++;
    if (canSpeak()) window.speechSynthesis.cancel();
    setState(next);
  };

  const speakFrom = (start: number) => {
    if (!canSpeak()) return;
    if (speaker && speaker !== stopRef) speaker.current();
    speaker = stopRef;
    const thisRun = ++run.current;
    window.speechSynthesis.cancel();
    chunks.current = toChunks(sections);
    const lang = speechLang ?? "en";
    const voice = voiceFor(lang);

    const say = (index: number) => {
      if (thisRun !== run.current) return;
      if (index >= chunks.current.length) {
        positionRef.current = 0;
        setPosition(0);
        setState("idle");
        return;
      }
      positionRef.current = index;
      setPosition(index);
      const utterance = new SpeechSynthesisUtterance(chunks.current[index].text);
      utterance.lang = voice?.lang ?? (lang === "en" ? "en-GB" : lang);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.onend = () => say(index + 1);
      utterance.onerror = (event) => {
        // Cancelled by pause or stop: nothing to do
        if (event.error === "interrupted" || event.error === "canceled") return;
        say(index + 1);
      };
      window.speechSynthesis.speak(utterance);
    };

    setState("playing");
    // Speak straight away: iPhones only allow speech started by a tap
    say(start);
  };

  function stopSelf() {
    halt("idle");
    positionRef.current = 0;
    setPosition(0);
  }
  stopRef.current = stopSelf;

  // Leaving the page stops reading (only if this reader is the one speaking)
  useEffect(
    () => () => {
      run.current++;
      if (speaker !== stopRef) return;
      speaker = null;
      if (canSpeak()) window.speechSynthesis.cancel();
    },
    []
  );

  return {
    // English always (every phone reads it); other languages need a voice
    available: canSpeak() && !!speechLang && (speechLang === "en" || !!voiceFor(speechLang)),
    state,
    // Index of the section being read, and the exact piece, for highlighting
    activeSection: state === "idle" ? null : chunks.current[position]?.section ?? null,
    activeChunk: state === "idle" ? null : chunks.current[position] ?? null,
    play: () => speakFrom(state === "paused" ? positionRef.current : 0),
    pause: () => halt("paused"),
    stop: stopSelf,
  };
}
