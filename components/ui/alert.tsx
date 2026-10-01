import { View, Text } from "react-native";
import { cn } from "../../lib/utils";

// shadcn/ui Alert, React Native port
export function Alert({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: string;
}) {
  return (
    <View role="note" className={cn("rounded-lg border border-border bg-background p-4 gap-1", className)}>
      {title ? <Text className="text-sm font-semibold text-foreground">{title}</Text> : null}
      <Text className="text-sm leading-6 text-muted-foreground">{children}</Text>
    </View>
  );
}
