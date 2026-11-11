import { View, Text, Pressable, ScrollView, Image, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Page } from "../../components/ui/page";
import { Button } from "../../components/ui/button";
import { useAuthStore, displayName } from "../../store/authStore";
import { useAuthDialog } from "../../store/authDialogStore";
import { useUserDataStore } from "../../store/userDataStore";
import { useRoutineStore } from "../../store/routineStore";
import { currentStreak, dayString, splitLogId } from "../../lib/progress";
import { describeItem, isPrayerKey } from "../../lib/items";
import { useContent } from "../../lib/i18n/content";
import { itemImage } from "../../constants/images";

// Me: your name, streak, routine, recently prayed and saved prayers, with
// Settings behind the gear (app/settings.tsx). Works for guests too; their
// progress stays on the device until they create an account.

type Tile = { key: string; title: string; subtitle: string; route: string; badge?: string };

function SectionTitle({ title, onPress, action }: { title: string; onPress: () => void; action?: { label: string; onPress: () => void } }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Pressable onPress={onPress} className="flex-row items-center gap-1">
        <Text role="heading" aria-level={2} className="text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </Text>
        <Ionicons name="chevron-forward" size={22} color="#FAFAFA" />
      </Pressable>
      {action ? (
        <Pressable onPress={action.onPress} className="h-10 px-4 justify-center rounded-full border border-border web:hover:bg-muted">
          <Text className="text-sm font-semibold text-foreground">{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// A row of picture cards that scrolls sideways
function TileRow({ tiles, wide }: { tiles: Tile[]; wide?: boolean }) {
  const router = useRouter();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-4">
      {tiles.map((tile) => (
        <Pressable key={tile.key} onPress={() => router.push(tile.route as any)} className={wide ? "w-64" : "w-40"}>
          <View className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
            <Image source={itemImage(tile.key)} resizeMode="cover" aria-hidden style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} />
            {tile.badge ? (
              <View className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-1">
                <Text className="text-xs font-semibold text-white">{tile.badge}</Text>
              </View>
            ) : null}
          </View>
          <Text numberOfLines={2} className={wide ? "mt-2 text-lg font-bold text-foreground" : "mt-2 text-sm font-bold text-foreground"}>
            {tile.title}
          </Text>
          <Text numberOfLines={1} className="text-sm text-muted-foreground">
            {tile.subtitle}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default function MeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const tc = useContent();
  const user = useAuthStore((state) => state.user);
  const openAuth = useAuthDialog((state) => state.open);
  const log = useUserDataStore((state) => state.log);
  const favourites = useUserDataStore((state) => state.favourites);
  const routine = useRoutineStore((state) => state.entries);

  const name = displayName(user);
  const days = new Set([...log].map((id) => splitLogId(id).day));
  const streak = currentStreak(days);
  const prayedToday = days.has(dayString());

  const toTile = (key: string, badge?: string): Tile | null => {
    const info = describeItem(key, t, tc);
    return info ? { key, title: info.title, subtitle: info.kind, route: info.route, badge } : null;
  };
  const routineTiles = routine.map((entry) => toTile(entry.key, entry.time)).filter((tile): tile is Tile => !!tile);
  // Newest first, each prayer once
  const recentKeys = [...new Set([...log].sort().reverse().map((id) => splitLogId(id).key))].filter(isPrayerKey).slice(0, 10);
  const recentTiles = recentKeys.map((key) => toTile(key)).filter((tile): tile is Tile => !!tile);
  const savedTiles = favourites.filter(isPrayerKey).map((key) => toTile(key)).filter((tile): tile is Tile => !!tile);

  return (
    <Page sidebar={false}>
      {/* Name and settings */}
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
          {name ? (
            <Text className="text-lg font-bold text-white">{name.charAt(0).toUpperCase()}</Text>
          ) : (
            <Ionicons name="person" size={20} color="#fff" />
          )}
        </View>
        <Text role="heading" aria-level={1} numberOfLines={1} className="flex-1 text-3xl font-extrabold tracking-tight text-foreground">
          {name ?? t("me.guest")}
        </Text>
        <Pressable onPress={() => router.push("/settings")} aria-label={t("nav.settings")} className="h-11 w-11 items-center justify-center rounded-full web:hover:bg-muted">
          <Ionicons name="settings-outline" size={24} color="#FAFAFA" />
        </Pressable>
      </View>

      {/* Guests: what an account adds */}
      {!user && (
        <View className="gap-3 rounded-2xl border border-border bg-card p-4">
          <Text className="text-base font-bold text-card-foreground">{t("me.guestTitle")}</Text>
          <Text className="text-sm leading-5 text-muted-foreground">{t("me.guestText")}</Text>
          <View className="flex-row flex-wrap gap-2">
            <Button size="sm" onPress={() => openAuth("signUp")}>
              {t("auth.createAccount")}
            </Button>
            <Button size="sm" variant="outline" onPress={() => openAuth("signIn")}>
              {t("auth.signIn")}
            </Button>
          </View>
        </View>
      )}

      <View className="gap-3">
        <SectionTitle title={t("me.streak")} onPress={() => router.push("/progress")} />
        <Pressable onPress={() => router.push("/progress")} className="flex-row items-center gap-4 rounded-2xl border border-border px-5 py-4">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="flash" size={26} color="#FAFAFA" />
            <Text className="text-4xl font-extrabold text-foreground">{streak}</Text>
          </View>
          <Text className="flex-1 text-base leading-6 text-muted-foreground">{t(prayedToday ? "me.streakToday" : "me.streakEmpty")}</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        <SectionTitle title={t("me.routine")} onPress={() => router.push("/routine")} action={{ label: t("me.edit"), onPress: () => router.push("/routine") }} />
        {routineTiles.length ? (
          <TileRow tiles={routineTiles} wide />
        ) : (
          <View className="gap-3 rounded-2xl border border-border p-4">
            <Text className="text-sm leading-5 text-muted-foreground">{t("me.routineEmpty")}</Text>
            <Button size="sm" className="self-start" onPress={() => router.push("/routine")}>
              {t("me.setUp")}
            </Button>
          </View>
        )}
      </View>

      <View className="gap-3">
        <SectionTitle title={t("me.recent")} onPress={() => router.push("/progress")} />
        {recentTiles.length ? <TileRow tiles={recentTiles} /> : <Text className="text-sm text-muted-foreground">{t("me.recentEmpty")}</Text>}
      </View>

      <View className="gap-3">
        <SectionTitle title={t("me.saved")} onPress={() => router.push("/favourites")} />
        {savedTiles.length ? <TileRow tiles={savedTiles} /> : <Text className="text-sm text-muted-foreground">{t("me.savedEmpty")}</Text>}
      </View>
    </Page>
  );
}
