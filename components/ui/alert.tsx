import { View, Text } from "react-native";
import { cn } from "../../lib/utils";

// shadcn/ui Alert, React Native port
export function Alert({
  title,
  className,
  children,
  tone = "default",
}: {
  title?: string;
  // "accent": light teal note
  tone?: "default" | "accent";
  className?: string;
  children: string;
}) {
  return (
    <View role="note" className={cn(
        "rounded-lg border p-4 gap-1",
        tone === "accent" ? "border-primary/20 bg-accent/50" : "border-border bg-background",
        className
      )}>
      {title ? <Text className="text-sm font-semibold text-foreground">{title}</Text> : null}
      <Text className={cn("text-sm leading-6", tone === "accent" ? "text-foreground" : "text-muted-foreground")}>{children}</Text>
    </View>
  );
}
