import { useState } from "react";
import { View, Text, TextInput, type TextInputProps } from "react-native";
import { cn } from "../../lib/utils";

// shadcn/ui Input with a Label, React Native port
export function Input({
  label,
  error,
  className,
  ...props
}: TextInputProps & { label: string; error?: string | null; className?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      <TextInput
        aria-label={label}
        placeholderTextColor="#A1A1AA"
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          "h-11 rounded-md border bg-background px-3 text-base text-foreground web:outline-none",
          error ? "border-destructive" : focused ? "border-ring" : "border-input",
          className
        )}
        {...props}
      />
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
}
