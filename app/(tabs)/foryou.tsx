import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, FlatList, Image, ScrollView, StyleSheet, type LayoutChangeEvent } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import Head from "expo-router/head";
import { useTranslation } from "react-i18next";
import { TopNav } from "../../components/ui/AppNav";
import Footer from "../../components/ui/Footer";
import { Button } from "../../components/ui/button";
import { useLanguageStore } from "../../store/LanguageStore";
import { useAuthStore } from "../../store/authStore";
import { useUserDataStore } from "../../store/userDataStore";
import { useReadAloud } from "../../lib/speech";
import { images, dailyImages } from "../../constants/images";
import { cn } from "../../lib/utils";
import {
  MOODS, CARE_MOODS, isMood, loadMood, loadCards, readLikes, writeLikes, savedKey,
  fetchHidden, setHidden, shareCard, type Mood, type CardKind, type FeedCard,
} from "../../lib/foryou";

// For You: full-screen cards to scroll through, like short videos. Pick a
// feeling, then Bible verses or uplifting messages chosen for it (50 each).

const MOOD_KEY = "ave-foryou-mood";
const KIND_KEY = "ave-foryou-kind";
const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

// Photos behind the cards, in turn
const BACKGROUNDS = [
  dailyImages.morning, images.prayingHands, images.rosaryFern, dailyImages.midday, images.silhouette,
  images.rosaryHands, dailyImages.night, images.rosaryWall, images.handsNight,
];

type Item = { kind: "card"; card: FeedCard; hidden: boolean } | { kind: "care" } | { kind: "end" };

export default function ForYouScreen() {
  const { t } = useTranslation();
  const storedMood = read(MOOD_KEY);
  const [mood, setMood] = useState<Mood | null>(isMood(storedMood) ? storedMood : null);
  const [kind, setKind] = useState<CardKind>(read(KIND_KEY) === "messages" ? "messages" : "verses");
  const [picking, setPicking] = useState(!mood);
  const [showSaved, setShowSaved] = useState(false);

  const choose = (next: Mood) => {
    write(MOOD_KEY, next);
    setMood(next);
    setPicking(false);
  };
  const changeKind = (next: CardKind) => {
    write(KIND_KEY, next);
    setKind(next);
  };

  return (
    <View className="flex-1 bg-zinc-950 md:bg-zinc-50">
      <Head>
        <title>{`${t("foryou.title")} | Ave`}</title>
      </Head>
      <StatusBar style="light" />
      <TopNav />
      <View className="flex-1 w-full md:max-w-md self-center md:my-4 md:rounded-2xl overflow-hidden bg-zinc-950">
        {showSaved ? (
          <SavedCards onClose={() => setShowSaved(false)} />
        ) : picking || !mood ? (
          <MoodPicker current={mood} onChoose={choose} onClose={mood ? () => setPicking(false) : undefined} />
        ) : (
          <Feed
            key={`${mood}-${kind}`}
            mood={mood}
            kind={kind}
            onKind={changeKind}
            onPickMood={() => setPicking(true)}
            onShowSaved={() => setShowSaved(true)}
          />
        )}
      </View>
      <Footer />
    </View>
  );
}

function MoodPicker({ current, onChoose, onClose }: { current: Mood | null; onChoose: (mood: Mood) => void; onClose?: () => void }) {
  const { t } = useTranslation();
  return (
    <View className="flex-1">
      <Image source={images.handsNight} resizeMode="cover" aria-hidden style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} />
      <View className="absolute inset-0 bg-primary-dark/80" />
      <ScrollView contentContainerClassName="px-5 py-8 gap-6">
        <View className="gap-2">
          {onClose && (
            <Pressable onPress={onClose} className="self-end h-9 w-9 items-center justify-center rounded-full bg-white/15" aria-label={t("common.close")}>
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
          )}
          <Text role="heading" className="text-3xl font-bold tracking-tight text-white">
            {t("foryou.pickTitle")}
          </Text>
          <Text className="text-base leading-6 text-white/80">{t("foryou.pickHint")}</Text>
        </View>
        <View className="flex-row flex-wrap gap-2.5">
          {MOODS.map((mood) => (
            <Pressable
              key={mood}
              onPress={() => onChoose(mood)}
              className={cn(
                "rounded-full border px-4 py-2.5 web:transition-colors",
                mood === current ? "bg-white border-white" : "bg-white/10 border-white/30 web:hover:bg-white/20"
              )}
            >
              <Text className={cn("text-base font-semibold", mood === current ? "text-primary" : "text-white")}>
                {t(`foryou.moods.${mood}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Feed({
  mood,
  kind,
  onKind,
  onPickMood,
  onShowSaved,
}: {
  mood: Mood;
  kind: CardKind;
  onKind: (kind: CardKind) => void;
  onPickMood: () => void;
  onShowSaved: () => void;
}) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [cards, setCards] = useState<FeedCard[] | null>(null);
  const [error, setError] = useState(false);
  const [hidden, setHiddenIds] = useState<Set<string>>(new Set());
  const [height, setHeight] = useState(0);
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList<Item>>(null);

  const load = () => {
    setError(false);
    loadMood(language, mood)
      .then((file) => setCards(file[kind]))
      .catch(() => setError(true));
  };
  useEffect(load, [language, mood, kind]);
  useEffect(() => {
    fetchHidden().then(setHiddenIds);
  }, []);

  // The admin sees hidden cards (marked) so they can be shown again
  const items = useMemo<Item[]>(() => {
    if (!cards) return [];
    const visible = cards
      .filter((card) => isAdmin || !hidden.has(card.id))
      .map((card) => ({ kind: "card" as const, card, hidden: hidden.has(card.id) }));
    return [...(CARE_MOODS.includes(mood) ? [{ kind: "care" as const }] : []), ...visible, { kind: "end" as const }];
  }, [cards, hidden, isAdmin, mood]);
  const total = items.filter((item) => item.kind === "card").length;
  const cardNumber = items.slice(0, index + 1).filter((item) => item.kind === "card").length;

  const current = items[index];
  const currentCard = current?.kind === "card" ? current.card : null;
  const speech = useReadAloud(currentCard ? [{ body: currentCard.text }, ...(currentCard.ref ? [{ body: currentCard.ref }] : [])] : []);
  // Reading stops when the card changes
  useEffect(() => speech.stop(), [index]);

  const toggleHidden = async (id: string) => {
    const hide = !hidden.has(id);
    try {
      await setHidden(id, hide);
      const next = new Set(hidden);
      hide ? next.add(id) : next.delete(id);
      setHiddenIds(next);
    } catch {
      alert(t("foryou.hideFailed"));
    }
  };

  const onLayout = (event: LayoutChangeEvent) => setHeight(event.nativeEvent.layout.height);

  return (
    <View className="flex-1" onLayout={onLayout}>
      {error ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center text-base text-white/80">{t("foryou.loadError")}</Text>
          <Button variant="outline" onPress={load}>
            {t("common.tryAgain")}
          </Button>
        </View>
      ) : !cards || !height ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-white/60">{t("common.loading")}</Text>
        </View>
      ) : (
        <FlatList
          ref={list}
          data={items}
          keyExtractor={(item, i) => (item.kind === "card" ? item.card.id : `${item.kind}-${i}`)}
          pagingEnabled
          snapToInterval={height}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
          initialNumToRender={2}
          windowSize={5}
          scrollEventThrottle={100}
          onScroll={(event) => {
            const next = Math.round(event.nativeEvent.contentOffset.y / height);
            if (next !== index) setIndex(next);
          }}
          renderItem={({ item, index: i }) => (
            <View style={{ height }}>
              {item.kind === "care" ? (
                <CareCard />
              ) : item.kind === "end" ? (
                <EndCard
                  onAgain={() => list.current?.scrollToOffset({ offset: 0, animated: true })}
                  onPickMood={onPickMood}
                />
              ) : (
                <CardView
                  card={item.card}
                  background={BACKGROUNDS[i % BACKGROUNDS.length]}
                  hidden={item.hidden}
                  speech={i === index ? speech : null}
                  onToggleHidden={isAdmin ? () => toggleHidden(item.card.id) : undefined}
                />
              )}
            </View>
          )}
        />
      )}

      {/* Top: feeling, verses or messages, saved */}
      <View className="absolute left-0 right-0 top-0 px-4 pt-3 gap-3" pointerEvents="box-none">
        <View className="flex-row items-center justify-between gap-2" pointerEvents="box-none">
          <Pressable onPress={onPickMood} className="flex-row items-center gap-1.5 rounded-full bg-black/35 px-3.5 py-2">
            <Text className="text-sm font-semibold text-white">{t(`foryou.moods.${mood}`)}</Text>
            <Ionicons name="chevron-down" size={14} color="#fff" />
          </Pressable>
          <Pressable onPress={onShowSaved} aria-label={t("foryou.savedTitle")} className="h-9 w-9 items-center justify-center rounded-full bg-black/35">
            <Ionicons name="bookmarks-outline" size={18} color="#fff" />
          </Pressable>
        </View>
        <View role="tablist" className="self-center flex-row rounded-full bg-black/35 p-1">
          {(["verses", "messages"] as CardKind[]).map((option) => (
            <Pressable
              key={option}
              role="tab"
              aria-selected={kind === option}
              onPress={() => kind !== option && onKind(option)}
              className={cn("rounded-full px-4 py-1.5", kind === option && "bg-white")}
            >
              <Text className={cn("text-sm font-semibold", kind === option ? "text-primary" : "text-white")}>
                {t(`foryou.${option}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Bottom: how far through */}
      {currentCard && (
        <View className="absolute bottom-3 left-0 right-0 items-center" pointerEvents="none">
          <Text className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white/90">
            {cardNumber} / {total}
          </Text>
        </View>
      )}
    </View>
  );
}

function RailButton({
  icon,
  label,
  onPress,
  color = "#fff",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} aria-label={label} className="items-center gap-1">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-black/30">
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text className="text-[11px] font-semibold text-white">{label}</Text>
    </Pressable>
  );
}

function CardView({
  card,
  background,
  hidden,
  speech,
  onToggleHidden,
}: {
  card: FeedCard;
  background: any;
  hidden: boolean;
  speech: ReturnType<typeof useReadAloud> | null;
  onToggleHidden?: () => void;
}) {
  const { t } = useTranslation();
  const favourites = useUserDataStore((state) => state.favourites);
  const toggleFavourite = useUserDataStore((state) => state.toggleFavourite);
  const saved = favourites.includes(savedKey(card.id));
  const [liked, setLiked] = useState(() => readLikes().has(card.id));
  const [notice, setNotice] = useState<string | null>(null);

  const like = () => {
    const likes = readLikes();
    liked ? likes.delete(card.id) : likes.add(card.id);
    writeLikes(likes);
    setLiked(!liked);
  };
  const share = async () => {
    const result = await shareCard(card);
    if (result === "copied") {
      setNotice(t("foryou.copied"));
      setTimeout(() => setNotice(null), 2000);
    }
  };
  const long = card.text.length > 260;

  return (
    <View className="flex-1">
      <Image source={background} resizeMode="cover" aria-hidden style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} />
      <View className="absolute inset-0 bg-black/55" />

      <View className="flex-1 justify-center pl-7 pr-20 py-28">
        {hidden && (
          <Text className="mb-3 self-start rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-white">{t("foryou.hiddenBadge")}</Text>
        )}
        <Text className={cn("font-serif text-white", long ? "text-xl leading-8" : "text-2xl leading-10")}>{card.text}</Text>
        {card.ref ? <Text className="mt-4 text-base font-semibold text-white/80">{card.ref}</Text> : null}
        {notice ? <Text className="mt-4 text-sm text-white/80">{notice}</Text> : null}
      </View>

      {/* Actions on the right, like short-video apps */}
      <View className="absolute right-3 bottom-16 gap-5">
        <RailButton icon={liked ? "heart" : "heart-outline"} color={liked ? "#F43F5E" : "#fff"} label={t(liked ? "foryou.liked" : "foryou.like")} onPress={like} />
        <RailButton
          icon={saved ? "bookmark" : "bookmark-outline"}
          color={saved ? "#FACC15" : "#fff"}
          label={t(saved ? "foryou.saved" : "foryou.save")}
          onPress={() => toggleFavourite(savedKey(card.id))}
        />
        <RailButton icon="share-social-outline" label={t("foryou.share")} onPress={share} />
        {speech?.available && (
          <RailButton
            icon={speech.state === "playing" ? "pause" : "volume-high-outline"}
            label={t(speech.state === "playing" ? "foryou.pause" : "foryou.listen")}
            onPress={speech.state === "playing" ? speech.pause : speech.play}
          />
        )}
        {onToggleHidden && (
          <RailButton icon={hidden ? "eye-outline" : "eye-off-outline"} label={t(hidden ? "foryou.unhide" : "foryou.hide")} onPress={onToggleHidden} />
        )}
      </View>
    </View>
  );
}

function CareCard() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 justify-center gap-4 bg-primary-dark px-7">
      <Ionicons name="heart-circle-outline" size={44} color="#fff" />
      <Text className="text-2xl font-bold text-white">{t("foryou.careTitle")}</Text>
      <Text className="text-base leading-7 text-white/90">{t("foryou.careText")}</Text>
      <Text className="mt-4 text-sm text-white/70">{t("foryou.scrollUp")}</Text>
    </View>
  );
}

function EndCard({ onAgain, onPickMood }: { onAgain: () => void; onPickMood: () => void }) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 justify-center gap-4 bg-primary-dark px-7">
      <Ionicons name="sparkles-outline" size={40} color="#fff" />
      <Text className="text-2xl font-bold text-white">{t("foryou.endTitle")}</Text>
      <Text className="font-serif text-lg leading-8 text-white/90">{t("foryou.endPrayer")}</Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        <Button onPress={onPickMood} className="bg-white web:hover:bg-white/90" textClassName="text-primary">
          {t("foryou.chooseAnother")}
        </Button>
        <Button variant="ghost" onPress={onAgain} textClassName="text-white">
          {t("foryou.startAgain")}
        </Button>
      </View>
    </View>
  );
}

function SavedCards({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const favourites = useUserDataStore((state) => state.favourites);
  const toggleFavourite = useUserDataStore((state) => state.toggleFavourite);
  const ids = favourites.filter((key) => key.startsWith("foryou:")).map((key) => key.slice("foryou:".length));
  const [cards, setCards] = useState<FeedCard[] | null>(null);
  useEffect(() => {
    loadCards(language, ids).then(setCards);
  }, [language, ids.join(",")]);

  return (
    <View className="flex-1 bg-zinc-50">
      <View className="flex-row items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
        <Text role="heading" className="text-lg font-bold text-foreground">
          {t("foryou.savedTitle")}
        </Text>
        <Pressable onPress={onClose} aria-label={t("common.close")} className="h-9 w-9 items-center justify-center rounded-full web:hover:bg-muted">
          <Ionicons name="close" size={22} color="#18181B" />
        </Pressable>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-3">
        {cards && cards.length === 0 && <Text className="py-10 text-center text-sm text-muted-foreground">{t("foryou.savedEmpty")}</Text>}
        {cards?.map((card) => (
          <View key={card.id} className="rounded-xl border border-border bg-card p-4 gap-2">
            <Text className="font-serif text-base leading-7 text-card-foreground">{card.text}</Text>
            {card.ref ? <Text className="text-sm font-semibold text-primary">{card.ref}</Text> : null}
            <View className="flex-row gap-4 pt-1">
              <Pressable onPress={() => shareCard(card)} className="flex-row items-center gap-1.5">
                <Ionicons name="share-social-outline" size={16} color="#01758F" />
                <Text className="text-sm font-medium text-primary">{t("foryou.share")}</Text>
              </Pressable>
              <Pressable onPress={() => toggleFavourite(savedKey(card.id))} className="flex-row items-center gap-1.5">
                <Ionicons name="bookmark" size={16} color="#71717A" />
                <Text className="text-sm font-medium text-muted-foreground">{t("foryou.unsave")}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
