import type { ReactNode } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { cn } from "../../lib/utils";
import { TopNav } from "./AppNav";
import Footer from "./Footer";
import { Card } from "./card";
import { Badge } from "./badge";

// Page shell shared by every screen: top nav on wide screens, bottom tabs on
// phones, and a centered column. "narrow" suits long reading pages.
export function Page({
  children,
  width = "default",
}: {
  children: ReactNode;
  width?: "default" | "narrow";
}) {
  return (
    <View className="flex-1 bg-zinc-50">
      <StatusBar style="dark" />
      <TopNav />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View
          className={cn(
            "w-full self-center px-4 md:px-6 pt-6 md:pt-10 pb-12 gap-6 md:gap-8",
            width === "narrow" ? "max-w-2xl" : "max-w-3xl"
          )}
        >
          {children}
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  back,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  back?: boolean;
}) {
  const router = useRouter();
  return (
    <View className="gap-1.5">
      {back && (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home"))}
          className="self-start -ml-2 mb-2 h-9 px-2 rounded-md justify-center web:hover:bg-muted"
        >
          <Text className="text-sm font-medium text-muted-foreground">← Back</Text>
        </Pressable>
      )}
      {eyebrow ? (
        <Text className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</Text>
      ) : null}
      <Text role="heading" className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
        {title}
      </Text>
      {description ? <Text className="text-base text-muted-foreground">{description}</Text> : null}
    </View>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-lg font-semibold tracking-tight text-foreground">{title}</Text>
      {children}
    </View>
  );
}

export function NumberBadge({ value }: { value: string | number }) {
  return (
    <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
      <Text className="text-sm font-semibold text-primary">{value}</Text>
    </View>
  );
}

export type ListItem = {
  key: string;
  title: string;
  description?: string;
  descriptionLines?: number;
  meta?: string;
  leading?: string | number;
  badge?: string;
  onPress?: () => void;
  // Shown as a muted badge on items that can't be opened yet
  unavailableLabel?: string;
};

export function ListCard({ items }: { items: ListItem[] }) {
  return (
    <Card className="overflow-hidden">
      {items.map((item, index) => (
        <ListRow key={item.key} item={item} last={index === items.length - 1} />
      ))}
    </Card>
  );
}

function ListRow({ item, last }: { item: ListItem; last: boolean }) {
  const unavailable = !!item.unavailableLabel;
  const content = (
    <View className={cn("flex-row items-center gap-3 px-4 py-4", !last && "border-b border-border")}>
      {item.leading !== undefined ? <NumberBadge value={item.leading} /> : null}
      <View className="flex-1 gap-0.5">
        <Text
          className={cn(
            "text-sm font-semibold",
            unavailable ? "text-muted-foreground" : "text-card-foreground"
          )}
        >
          {item.title}
        </Text>
        {item.description ? (
          <Text
            className="text-sm leading-5 text-muted-foreground"
            numberOfLines={item.descriptionLines}
          >
            {item.description}
          </Text>
        ) : null}
        {item.meta ? <Text className="text-xs text-muted-foreground">{item.meta}</Text> : null}
      </View>
      {item.badge ? <Badge>{item.badge}</Badge> : null}
      {unavailable ? <Badge variant="secondary">{item.unavailableLabel!}</Badge> : null}
      {item.onPress ? <Text className="text-lg text-muted-foreground">›</Text> : null}
    </View>
  );

  if (!item.onPress) return content;
  return (
    <Pressable onPress={item.onPress} className="web:hover:bg-muted/60 web:transition-colors">
      {content}
    </Pressable>
  );
}

// Long-form prayer text, one card with headed sections
export function ReadingCard({ sections }: { sections: { heading?: string; body: string }[] }) {
  return (
    <Card className="p-6 md:p-8 gap-8">
      {sections.map((section, index) => (
        <View key={index} className="gap-2">
          {section.heading ? (
            <Text className="text-xs font-semibold uppercase tracking-widest text-primary">
              {section.heading}
            </Text>
          ) : null}
          <Text selectable className="text-base md:text-lg leading-8 text-foreground">
            {section.body}
          </Text>
        </View>
      ))}
    </Card>
  );
}

export function LoadingCard({ label = "Loading…" }: { label?: string }) {
  return (
    <Card className="p-8 items-center gap-3">
      <ActivityIndicator color="#007C7C" />
      <Text className="text-sm text-muted-foreground">{label}</Text>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="p-8 items-center gap-2">
      <Text className="text-base font-semibold text-foreground text-center">{title}</Text>
      {description ? (
        <Text className="text-sm text-muted-foreground text-center">{description}</Text>
      ) : null}
      {children ? <View className="mt-3">{children}</View> : null}
    </Card>
  );
}
