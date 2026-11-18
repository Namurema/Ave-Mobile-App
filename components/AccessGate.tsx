import { useEffect, useState } from "react";
import { Platform } from "react-native";
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
const OPEN_WHEN_LOCKED = ["/subscribe", "/payment/complete", "/profile", "/settings", "/feedback", "/Language", "/privacy", "/terms", "/splash", "/"];
const isOpen = (path: string) => OPEN_WHEN_LOCKED.includes(path) || path.startsWith("/auth/");

const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_VISIT_KEY = "ave-first-visit";

// Guests get the same 7 days, counted from their first visit on this device
function guestTrialOver() {
  if (Platform.OS !== "web") return false;
  try {
    const first = Number(localStorage.getItem(FIRST_VISIT_KEY));
    if (!first) {
      localStorage.setItem(FIRST_VISIT_KEY, String(Date.now()));
      return false;
    }
    return Date.now() - first > 7 * DAY_MS;
  } catch {
    return false;
  }
}

// After the 7-day trial, without a plan (or free access), prayers lead to the
// plans page; guests are asked there to create an account. If access can't be
// checked (offline), nothing is locked.
export function AccessGate() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const authLoading = useAuthStore((state) => state.loading);
  const access = useAccessStore((state) => state.access);
  const [guestOver] = useState(guestTrialOver);
  const memberLocked = !!session && !!access && !access.hasAccess;
  const guestLocked = !session && !authLoading && guestOver;
  const locked = PAYMENTS_ENABLED && (memberLocked || guestLocked) && !isOpen(pathname);

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
