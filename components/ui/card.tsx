import { View, Text, type ViewProps } from "react-native";
import { cn } from "../../lib/utils";

// shadcn/ui Card, React Native port
type DivProps = ViewProps & { className?: string };

export function Card({ className, ...props }: DivProps) {
  return (
    <View
      className={cn("rounded-xl border border-border bg-card shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return <View className={cn("gap-1.5 p-6", className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <View className={cn("px-6 pb-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return <View className={cn("flex-row items-center px-6 pb-6", className)} {...props} />;
}

export function CardTitle({ className, children }: { className?: string; children: string }) {
  return (
    <Text
      role="heading"
      className={cn("text-xl font-semibold tracking-tight text-card-foreground", className)}
    >
      {children}
    </Text>
  );
}

export function CardDescription({ className, children }: { className?: string; children: string }) {
  return <Text className={cn("text-sm text-muted-foreground", className)}>{children}</Text>;
}
