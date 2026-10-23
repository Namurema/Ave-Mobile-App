import { useEffect, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useAuthDialog } from "../store/authDialogStore";
import { useAccessStore } from "../store/accessStore";
import { useLanguageStore } from "../store/LanguageStore";
import { formatDayMonth } from "../lib/i18n/helpers";
import { PRICES, formatPrice, guessCurrency, startCheckout, type Currency, type Plan } from "../lib/billing";
import { Page, PageHeader } from "../components/ui/page";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FormError } from "../components/auth/forms";
import { images } from "../constants/images";
import { cn } from "../lib/utils";

// Choose a plan and pay with PesaPal (mobile money or card)
export default function SubscribeScreen() {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const session = useAuthStore((state) => state.session);
  const access = useAccessStore((state) => state.access);
  const [currency, setCurrency] = useState<Currency>(guessCurrency());
  const [plan, setPlan] = useState<Plan>("yearly");
  const [paying, setPaying] = useState(false);
  // Coming back from PesaPal with the browser's Back button restores this page
  // as it was (busy button); reset it
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const reset = () => setPaying(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  const [error, setError] = useState<string | null>(null);

  const status = !session
    ? t("billing.signInFirst")
    : access?.granted
      ? t("billing.granted")
      : access?.paidUntil && access.paidUntil > new Date()
      ? `${t("billing.paidUntil")} ${formatDayMonth(access.paidUntil, language)} ${access.paidUntil.getFullYear()}`
      : access?.trialEndsAt && access.trialEndsAt > new Date()
        ? `${t("billing.trialUntil")} ${formatDayMonth(access.trialEndsAt, language)}`
        : t("billing.trialEnded");

  const pay = async () => {
    if (!session) return useAuthDialog.getState().open("signUp", "/subscribe");
    setError(null);
    setPaying(true);
    try {
      await startCheckout(plan, currency);
      // The browser now goes to PesaPal; keep the button busy until it does
    } catch {
      setError(t("billing.startFailed"));
      setPaying(false);
    }
  };

  const plans: { id: Plan; title: string; note: string }[] = [
    { id: "monthly", title: t("billing.monthly"), note: t("billing.perMonth") },
    { id: "yearly", title: t("billing.yearly"), note: t("billing.twoMonthsFree") },
  ];

  return (
    <Page sidebar={false}>
      <PageHeader back tone="primary" image={images.rosaryHands} title={t("billing.title")} description={t("billing.description")} />

      <Card className="p-4 gap-1 border-primary/30 bg-accent/40">
        <Text className="text-sm font-semibold text-card-foreground">{status}</Text>
        <Text className="text-xs leading-5 text-muted-foreground">{t("billing.includes")}</Text>
      </Card>

      {/* Uganda pays in shillings, everyone else in dollars */}
      <View role="radiogroup" className="flex-row rounded-lg border border-border bg-background p-1">
        {(["UGX", "USD"] as Currency[]).map((option) => (
          <Pressable
            key={option}
            role="radio"
            aria-checked={currency === option}
            onPress={() => setCurrency(option)}
            className={cn("flex-1 items-center rounded-md py-2", currency === option && "bg-primary")}
          >
            <Text className={cn("text-sm font-semibold", currency === option ? "text-primary-foreground" : "text-muted-foreground")}>
              {option === "UGX" ? t("billing.inUganda") : t("billing.outsideUganda")}
            </Text>
          </Pressable>
        ))}
      </View>

      <View role="radiogroup" className="gap-3">
        {plans.map((option) => {
          const selected = plan === option.id;
          return (
            <Pressable
              key={option.id}
              role="radio"
              aria-checked={selected}
              onPress={() => setPlan(option.id)}
              className={cn(
                "flex-row items-center gap-3 rounded-xl border bg-card p-4",
                selected ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <View className={cn("h-5 w-5 items-center justify-center rounded-full border-2", selected ? "border-primary" : "border-input")}>
                {selected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-semibold text-card-foreground">{option.title}</Text>
                <Text className="text-xs text-muted-foreground">{option.note}</Text>
              </View>
              <Text className="text-base font-bold text-primary">{formatPrice(currency, PRICES[currency][option.id])}</Text>
              {option.id === "yearly" && <Badge variant="primary">{t("billing.best")}</Badge>}
            </Pressable>
          );
        })}
      </View>

      <FormError message={error} />
      <Button size="lg" loading={paying} onPress={pay}>
        {session ? `${t("billing.pay")} ${formatPrice(currency, PRICES[currency][plan])}` : t("billing.createAccount")}
      </Button>
      <Text className="text-center text-xs leading-5 text-muted-foreground">
        {currency === "UGX" ? t("billing.methodsUganda") : t("billing.methodsAbroad")}
      </Text>
    </Page>
  );
}
