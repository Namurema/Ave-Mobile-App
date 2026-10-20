import type { ReactNode } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image, StyleSheet, type ImageSourcePropType } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, usePathname } from "expo-router";
import Head from "expo-router/head";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { TopNav } from "./AppNav";
import Footer from "./Footer";
import { ReadAloudBar } from "../ReadAloud";
import { useReadAloud } from "../../lib/speech";
import { Card, FlatCardContext } from "./card";
import { Badge } from "./badge";
import { BrowseSidebar } from "./BrowseSidebar";

// Page shell shared by every screen: top nav on wide screens, bottom tabs on
// phones. With `sidebar` (the default) desktop gets a "Browse prayers" column
// on the left; without it the content is a single centered column.
export function Page({
  children,
  sidebar = true,
  bottomBar,
}: {
  children: ReactNode;
  sidebar?: boolean;
  // Fixed above the bottom menu, e.g. a prayer's action bar
  bottomBar?: ReactNode;
}) {
  return (
    <View className="flex-1 bg-zinc-50">
      <StatusBar style="dark" />
      <TopNav />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View
          className={cn(
            "w-full self-center px-4 md:px-6 pt-6 pb-12 gap-6",
            sidebar ? "max-w-6xl lg:flex-row lg:items-start" : "max-w-3xl"
          )}
        >
          {sidebar && (
            <View className="hidden lg:flex w-72 gap-4">
              <BrowseSidebar />
            </View>
          )}
          <View className="flex-1 min-w-0 gap-4 md:gap-6">{children}</View>
        </View>
      </ScrollView>
      {bottomBar}
      <Footer />
    </View>
  );
}

export type PageTab = { label: string; route: string };

// A photo filling its (relative, overflow-hidden) parent, under a teal tint
export function PhotoBackdrop({ source }: { source: ImageSourcePropType }) {
  return (
    <>
      <Image source={source} resizeMode="cover" aria-hidden style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} />
      {/* Web: teal fading left to right (CSS in public/index.html); elsewhere a flat tint */}
      <View {...({ dataSet: { tint: "photo" } } as any)} className="absolute inset-0 bg-primary/75 web:bg-transparent" />
    </>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  back,
  tabs,
  actions,
  tone = "default",
  image,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  back?: boolean;
  tabs?: PageTab[];
  // Buttons under the title, e.g. "Save to favourites"
  actions?: ReactNode;
  // "primary": teal card with white text, for the browse pages
  tone?: "default" | "primary";
  // Photo behind a "primary" header, tinted teal so the text stays readable
  image?: ImageSourcePropType;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const primary = tone === "primary";
  return (
    <Card className={cn("overflow-hidden", primary && "bg-primary border-primary")}>
      {/* Browser tab and search result title */}
      <Head>
        <title>{`${title} | Ave`}</title>
      </Head>
      {primary && image ? <PhotoBackdrop source={image} /> : null}
      <View className={cn("p-5 md:p-6 gap-1.5", primary && image && "pt-8 md:pt-12")}>
        {back && (
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home"))}
            className={cn("self-start -ml-2 mb-1 h-8 px-2 rounded-md justify-center", primary ? "web:hover:bg-white/10" : "web:hover:bg-muted")}
          >
            <Text className={cn("text-sm font-medium", primary ? "text-white/80" : "text-muted-foreground")}>← {t("common.back")}</Text>
          </Pressable>
        )}
        {eyebrow ? (
          <Text className={cn("text-xs font-semibold uppercase tracking-widest", primary ? "text-accent" : "text-primary")}>{eyebrow}</Text>
        ) : null}
        <Text role="heading" className={cn("text-2xl md:text-3xl font-bold tracking-tight", primary ? "text-white" : "text-card-foreground")}>
          {title}
        </Text>
        {description ? (
          <Text className={cn("text-base", primary ? "text-white/85" : "text-muted-foreground")}>{description}</Text>
        ) : null}
        {actions ? <View className="mt-3 flex-row flex-wrap gap-2">{actions}</View> : null}
      </View>

      {tabs && (
        <View role="tablist" className={cn("flex-row px-2 md:px-3 border-t", primary ? "border-white/20" : "border-border")}>
          {tabs.map((tab) => {
            const active = pathname === tab.route.replace("/(tabs)", "");
            return (
              <Pressable
                key={tab.route}
                role="tab"
                aria-selected={active}
                onPress={() => !active && router.replace(tab.route as any)}
                className={cn(
                  "px-3 md:px-4 py-3 border-b-2 web:transition-colors",
                  active
                    ? primary ? "border-white" : "border-primary"
                    : primary ? "border-transparent web:hover:bg-white/10" : "border-transparent web:hover:bg-muted/60"
                )}
              >
                <Text
                  className={cn(
                    "text-sm font-semibold",
                    primary
                      ? active ? "text-white" : "text-white/70"
                      : active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </Card>
  );
}

// A card whose title row sits inside it: "Title (count)" left, action right
export function Section({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count?: number;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <View className="flex-row items-center justify-between gap-3 px-4 md:px-5 py-4 border-b border-border">
        <Text className="flex-1 text-base font-semibold text-card-foreground">
          {title}
          {count !== undefined ? <Text className="font-normal text-muted-foreground"> ({count})</Text> : null}
        </Text>
        {action ? (
          <Pressable onPress={action.onPress} className="rounded-md px-2 py-1 web:hover:bg-muted">
            <Text className="text-sm font-semibold text-muted-foreground">{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
      <FlatCardContext.Provider value={true}>{children}</FlatCardContext.Provider>
    </Card>
  );
}

export function NumberBadge({ value }: { value: string | number }) {
  return (
    <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
      <Text className="text-sm font-semibold text-primary">{value}</Text>
    </View>
  );
}

function ValueTile({ value, unit }: { value: string | number; unit?: string }) {
  return (
    <View className="h-14 w-14 rounded-lg bg-accent items-center justify-center">
      <Text className="text-lg font-bold leading-6 text-primary">{value}</Text>
      {unit ? <Text className="text-[11px] font-medium text-primary-dark">{unit}</Text> : null}
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
  // Teal tile on the left with a number and a small unit, e.g. 9 / days
  tile?: { value: string | number; unit?: string };
  badge?: string;
  badgeVariant?: "outline" | "secondary" | "primary";
  onPress?: () => void;
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
  const content = (
    <View className={cn("flex-row items-center gap-3 px-4 md:px-5 py-4", !last && "border-b border-border")}>
      {item.tile ? <ValueTile {...item.tile} /> : null}
      {item.leading !== undefined ? <NumberBadge value={item.leading} /> : null}
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-card-foreground">{item.title}</Text>
        {item.description ? (
          <Text
            className="text-sm leading-5 text-muted-foreground"
            numberOfLines={item.descriptionLines}
          >
            {item.description}
          </Text>
        ) : null}
        {item.meta ? <Text className="text-xs text-muted-foreground">{item.meta}</Text> : null}
        {/* Teal status badges sit under the text, leaving the title room */}
        {item.badge && item.badgeVariant === "primary" ? (
          <Badge variant="primary" className="self-start mt-1">{item.badge}</Badge>
        ) : null}
      </View>
      {item.badge && item.badgeVariant !== "primary" ? <Badge variant={item.badgeVariant}>{item.badge}</Badge> : null}
      {item.onPress ? (
        <Text className={cn("text-lg", item.tile ? "text-primary" : "text-muted-foreground")}>›</Text>
      ) : null}
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
export function ReadingCard({
  sections,
  readAloud = true,
  speech: shared,
}: {
  sections: { heading?: string; body: string }[];
  // "Play audio" bar at the top (English only), unless the page passes its
  // own reader, played from the page's action bar
  readAloud?: boolean;
  speech?: ReturnType<typeof useReadAloud>;
}) {
  const own = useReadAloud(sections);
  const speech = shared ?? own;
  return (
    <Card className="p-5 md:p-8 gap-8">
      {readAloud && !shared && <ReadAloudBar speech={speech} />}
      {sections.map((section, index) => (
        <View
          key={index}
          className={cn(
            "gap-2 -mx-3 px-3 py-2 rounded-lg web:transition-colors",
            speech.activeSection === index && "bg-accent/70"
          )}
        >
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

export function LoadingCard({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <Card className="p-8 items-center gap-3">
      <ActivityIndicator color="#01758F" />
      <Text className="text-sm text-muted-foreground">{label ?? t("common.loading")}</Text>
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
