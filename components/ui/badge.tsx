import { View, Text } from "react-native";
import { cn } from "../../lib/utils";

// shadcn/ui Badge, React Native port
const variants = {
  outline: { view: "border border-border", text: "text-foreground" },
  secondary: { view: "bg-muted", text: "text-muted-foreground" },
};

export function Badge({
  className,
  variant = "outline",
  children,
}: {
  className?: string;
  variant?: keyof typeof variants;
  children: string;
}) {
  return (
    <View className={cn("self-center rounded-full px-3 py-1", variants[variant].view, className)}>
      <Text className={cn("text-xs font-medium", variants[variant].text)}>{children}</Text>
    </View>
  );
}
