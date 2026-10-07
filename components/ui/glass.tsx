import { Platform, View, type ViewProps } from "react-native";
import { cn } from "../../lib/utils";

// Glassmorphism: a frosted, see-through panel over colourful content.
// The blur is CSS backdrop-filter, set in public/index.html for elements
// tagged data-glass (React Native web drops backdropFilter from styles).
// On native the panel is simply translucent.

export const glassTag = (kind: "panel" | "backdrop"): any => ({ dataSet: { glass: kind } });

const softGlow = (px: number): any => (Platform.OS === "web" ? { filter: `blur(${px}px)` } : undefined);

export function GlassPanel({ className, style, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn("rounded-2xl border border-white/60 bg-white/70 shadow-2xl", className)}
      style={style}
      {...glassTag("panel")}
      {...props}
    />
  );
}

// Deep teal background with soft glowing shapes, for glass to sit on
export function GlassBackground() {
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden bg-primary-dark">
      <View className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-primary" style={softGlow(40)} />
      <View className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-accent/50" style={softGlow(60)} />
      <View className="absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-primary/80" style={softGlow(50)} />
    </View>
  );
}
