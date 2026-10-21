import { useEffect, useRef } from "react";
import { Platform, Text } from "react-native";
import type { Chunk } from "../../lib/speech";

// Prayer text that highlights the sentence being read aloud and keeps it in
// view. `chunk` is the piece being read, if it belongs to this text.
export function SpokenText({
  text,
  chunk,
  className,
}: {
  text: string;
  chunk: Chunk | null;
  className?: string;
}) {
  const highlight = useRef<any>(null);
  const range = chunk && chunk.part === "body" && chunk.end > chunk.start ? chunk : null;

  useEffect(() => {
    if (range && Platform.OS === "web") {
      highlight.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    }
  }, [range?.start, range?.end]);

  if (!range) {
    return (
      <Text selectable className={className}>
        {text}
      </Text>
    );
  }
  return (
    <Text selectable className={className}>
      {text.slice(0, range.start)}
      <Text ref={highlight} className="rounded bg-accent text-foreground">
        {text.slice(range.start, range.end)}
      </Text>
      {text.slice(range.end)}
    </Text>
  );
}
