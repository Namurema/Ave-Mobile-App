import type { ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Page } from "./ui/page";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// "Don't have an account? Create account" style line under the card
export function AuthLink({ prompt, label, href }: { prompt?: string; label: string; href: string }) {
  const router = useRouter();
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-1">
      {prompt ? <Text className="text-sm text-muted-foreground">{prompt}</Text> : null}
      <Pressable onPress={() => router.replace(href as any)}>
        <Text className="text-sm font-semibold text-primary">{label}</Text>
      </Pressable>
    </View>
  );
}

// Shared layout for the sign-in, sign-up and password pages
export function AuthCard({
  title,
  description,
  error,
  children,
  footer,
}: {
  title: string;
  description?: string;
  error?: string | null;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Page sidebar={false}>
      <Card className="w-full max-w-md self-center">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="gap-4">
          {error ? (
            <View role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <Text className="text-sm text-destructive">{error}</Text>
            </View>
          ) : null}
          {children}
        </CardContent>
      </Card>
      {footer ? <View className="w-full max-w-md self-center items-center gap-2">{footer}</View> : null}
    </Page>
  );
}
