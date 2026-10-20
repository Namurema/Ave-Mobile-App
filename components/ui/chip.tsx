import { Pressable, Text } from "react-native";
import { cn } from "../../lib/utils";

// Small toggle pill, e.g. a day of the week
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      role="checkbox"
      aria-checked={selected}
      onPress={onPress}
      className={cn(
        "rounded-full border px-3 py-1.5",
        selected ? "border-primary bg-primary" : "border-border bg-background web:hover:bg-muted"
      )}
    >
      <Text className={cn("text-xs font-semibold", selected ? "text-primary-foreground" : "text-foreground")}>
        {label}
      </Text>
    </Pressable>
  );
}
