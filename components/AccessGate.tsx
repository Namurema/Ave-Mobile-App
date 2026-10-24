import { useEffect } from "react";
import { View, Text } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useAccessStore } from "../store/accessStore";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { PAYMENTS_ENABLED } from "../constants/features";

// Pages that stay open when the free trial has ended without a plan: choosing
// and paying for a plan, account settings, help and the legal pages
const OPEN_WHEN_LOCKED = ["/subscribe", "/payment/complete", "/profile", "/feedback", "/Language", "/privacy", "/terms", "/splash", "/"];
const isOpen = (path: string) => OPEN_WHEN_LOCKED.includes(path) || path.startsWith("/auth/");

// After the 7-day trial, without a plan (or free access), prayers lead to the
// plans page. If access can't be checked (offline), nothing is locked.
export function AccessGate() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const access = useAccessStore((state) => state.access);
  const locked = PAYMENTS_ENABLED && !!session && !!access && !access.hasAccess && !isOpen(pathname);

  useEffect(() => {
    if (locked) router.replace("/subscribe");
  }, [locked]);

  return null;
}

const DAY = 24 * 60 * 60 * 1000;

// Home: a reminder in the last 3 days of the free trial or of a paid plan
// (plans don't renew by themselves)
export function TrialNotice() {
  const router = useRouter();
  const { t } = useTranslation();
  const access = useAccessStore((state) => state.access);
  if (!PAYMENTS_ENABLED || !access || access.granted) return null;
  const paid = !!access.paidUntil && access.paidUntil > new Date();
  const ends = paid ? access.paidUntil : access.trialEndsAt;
  if (!ends) return null;
  const left = Math.ceil((ends.getTime() - Date.now()) / DAY);
  if (left < 1 || left > 3) return null;

  return (
    <Card className="p-4 gap-3 border-primary/30 bg-accent/40">
      <Text className="text-sm font-semibold text-card-foreground">
        {left === 1
          ? t(paid ? "billing.planLastDay" : "billing.trialLastDay")
          : `${t(paid ? "billing.planEndsIn" : "billing.trialEndsIn")} ${left} ${t("common.days")}`}
      </Text>
      <View className="flex-row">
        <Button size="sm" onPress={() => router.push("/subscribe")}>
          {t("billing.choosePlan")}
        </Button>
      </View>
    </Card>
  );
}
