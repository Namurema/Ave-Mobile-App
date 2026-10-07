import type { ReactNode } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { TopNav } from "./ui/AppNav";
import Footer from "./ui/Footer";
import { GlassPanel, GlassBackground } from "./ui/glass";

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// "Don't have an account? Create account" style line under the card
export function AuthLink({ prompt, label, href }: { prompt?: string; label: string; href: string }) {
  const router = useRouter();
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-1">
      {prompt ? <Text className="text-sm text-white/80">{prompt}</Text> : null}
      <Pressable onPress={() => router.replace(href as any)}>
        <Text className="text-sm font-semibold text-white">{label}</Text>
      </Pressable>
    </View>
  );
}

// Shared layout for the sign-in, sign-up and password pages: a frosted glass
// card over a deep teal background
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
    <View className="flex-1 bg-primary-dark">
      <StatusBar style="light" />
      <GlassBackground />
      <TopNav />
      <ScrollView className="flex-1" contentContainerClassName="flex-grow justify-center px-4 py-10 gap-5">
        <GlassPanel className="w-full max-w-md self-center p-6 gap-5">
          <View className="gap-1.5">
            <Text role="heading" className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </Text>
            {description ? <Text className="text-sm leading-5 text-muted-foreground">{description}</Text> : null}
          </View>
          {error ? (
            <View role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <Text className="text-sm text-destructive">{error}</Text>
            </View>
          ) : null}
          {children}
        </GlassPanel>
        {footer ? <View className="w-full max-w-md self-center items-center gap-2">{footer}</View> : null}
      </ScrollView>
      <Footer />
    </View>
  );
}
