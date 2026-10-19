import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

// Read aloud with the device's own English voice (Web Speech API). Phones have
// no Luganda or Runyankore voices, so the app offers this in English only.

export type SpeechSection = { heading?: string; body: string };
type Chunk = { text: string; section: number };

export const canSpeak = () =>
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof SpeechSynthesisUtterance !== "undefined";

// Short pieces: some browsers stop long utterances part way, and pausing
// restarts from the current piece
const MAX_CHUNK = 220;

function toChunks(sections: SpeechSection[]): Chunk[] {
  const chunks: Chunk[] = [];
  sections.forEach((section, index) => {
    const parts = [section.heading, ...section.body.split(/\n+/)].filter(
      (part): part is string => !!part && !!part.trim()
    );
    for (const part of parts) {
      if (part.length <= MAX_CHUNK) {
        chunks.push({ text: part.trim(), section: index });
        continue;
      }
      // Split long paragraphs into sentences, and very long sentences at commas
      // (no lookbehind: older iPhones lack it)
      const sentences = (part.match(/[^.!?;:]+[.!?;:]*\s*/g) ?? [part]).flatMap((sentence) =>
        sentence.length > MAX_CHUNK ? sentence.match(/[^,]+,?\s*/g) ?? [sentence] : [sentence]
      );
      let current = "";
      for (const sentence of sentences) {
        if (current && (current + sentence).length > MAX_CHUNK) {
          chunks.push({ text: current.trim(), section: index });
          current = "";
        }
        current += sentence;
      }
      if (current.trim()) chunks.push({ text: current.trim(), section: index });
    }
  });
  return chunks;
}

// A clear English voice on the device, preferring British English and
// voices that work offline
function englishVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /^en[-_]GB/i.test(v.lang) && v.localService) ??
    voices.find((v) => /^en/i.test(v.lang) && v.localService) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    null
  );
}

// Only one text reads at a time: starting another stops the previous one
let speaker: { current: () => void } | null = null;

export type ReadAloudState = "idle" | "playing" | "paused";

export function useReadAloud(sections: SpeechSection[]) {
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
    const voice = englishVoice();

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
      utterance.lang = voice?.lang ?? "en-GB";
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
    available: canSpeak(),
    state,
    // Index of the section being read, for highlighting
    activeSection: state === "idle" ? null : chunks.current[position]?.section ?? null,
    play: () => speakFrom(state === "paused" ? positionRef.current : 0),
    pause: () => halt("paused"),
    stop: stopSelf,
  };
}
