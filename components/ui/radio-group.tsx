import { createContext, useContext, type ReactNode } from "react";
import { View, Pressable } from "react-native";
import { cn } from "../../lib/utils";

// shadcn/ui RadioGroup, React Native port. Items render as selectable rows
// (the shadcn "radio card" pattern), with the radio circle on the right.
type RadioGroupContextValue = { value: string; onValueChange: (value: string) => void };

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function RadioGroup({
  value,
  onValueChange,
  className,
  children,
}: RadioGroupContextValue & { className?: string; children: ReactNode }) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <View role="radiogroup" className={cn("gap-3", className)}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const group = useContext(RadioGroupContext);
  if (!group) throw new Error("RadioGroupItem must be used inside RadioGroup");
  const checked = group.value === value;

  return (
    <Pressable
      role="radio"
      aria-checked={checked}
      onPress={() => group.onValueChange(value)}
      className={cn(
        "flex-row items-center gap-3 rounded-lg border p-4 web:transition-colors",
        checked ? "border-primary bg-primary/5" : "border-border web:hover:bg-muted",
        className
      )}
    >
      <View className="flex-1">{children}</View>
      <View
        className={cn(
          "h-4 w-4 items-center justify-center rounded-full border",
          checked ? "border-primary" : "border-input"
        )}
      >
        {checked && <View className="h-2 w-2 rounded-full bg-primary" />}
      </View>
    </Pressable>
  );
}
