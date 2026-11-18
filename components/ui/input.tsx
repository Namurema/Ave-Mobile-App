import { useState } from "react";
import { View, Text, TextInput, Pressable, type TextInputProps } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

// shadcn/ui Input with a Label, React Native port. Password fields
// (secureTextEntry) get an eye button to show or hide what was typed.
export function Input({
  label,
  error,
  className,
  secureTextEntry,
  ...props
}: TextInputProps & { label: string; error?: string | null; className?: string }) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      <View className="relative justify-center">
        <TextInput
          aria-label={label}
          placeholderTextColor="#A1A1AA"
          secureTextEntry={secureTextEntry && !visible}
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
            secureTextEntry && "pr-11",
            error ? "border-destructive" : focused ? "border-ring" : "border-input",
            className
          )}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable
            role="button"
            aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
            onPress={() => setVisible((value) => !value)}
            hitSlop={8}
            className="absolute right-0 h-11 w-11 items-center justify-center"
          >
            <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color="#71717A" />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
}
