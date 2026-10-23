import { Platform } from "react-native";
import { supabase } from "./supabase/client";

// Subscriptions through PesaPal. The server (supabase/functions/pesapal-*)
// sets the real prices and records payments; these are for display.
export const PRICES = {
  UGX: { monthly: 7000, yearly: 70000 },
  USD: { monthly: 3.99, yearly: 29.99 },
} as const;
export type Currency = keyof typeof PRICES;
export type Plan = keyof (typeof PRICES)["UGX"];

export const formatPrice = (currency: Currency, amount: number) =>
  currency === "UGX" ? `UGX ${amount.toLocaleString("en-US")}` : `$${amount.toFixed(2)}`;

// Uganda pays in shillings (mobile money or card), everyone else in dollars.
// A first guess from the device's time zone; people can switch.
export function guessCurrency(): Currency {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === "Africa/Kampala" ? "UGX" : "USD";
  } catch {
    return "UGX";
  }
}

export type Access = {
  trialEndsAt: Date | null;
  paidUntil: Date | null;
  plan: Plan | null;
  // Free access from the Ave team (pre-launch users, testers)
  granted: boolean;
  hasAccess: boolean;
};

export async function fetchAccess(): Promise<Access | null> {
  const { data, error } = await supabase.rpc("access_status");
  if (error || !data) return null;
  return {
    trialEndsAt: data.trial_ends_at ? new Date(data.trial_ends_at) : null,
    paidUntil: data.paid_until ? new Date(data.paid_until) : null,
    plan: data.plan ?? null,
    granted: !!data.granted,
    hasAccess: !!data.has_access,
  };
}

// Creates the order on the server and opens PesaPal's payment page
export async function startCheckout(plan: Plan, currency: Currency) {
  const { data, error } = await supabase.functions.invoke("pesapal-checkout", { body: { plan, currency } });
  if (error || !data?.redirect_url) throw error ?? new Error("No payment page");
  if (Platform.OS === "web") window.location.assign(data.redirect_url);
  return data.redirect_url as string;
}

export type PaymentStatus = "pending" | "completed" | "failed" | "invalid" | "reversed";

export async function checkPayment(orderTrackingId: string): Promise<PaymentStatus> {
  const { data, error } = await supabase.functions.invoke("pesapal-status", { body: { orderTrackingId } });
  if (error) throw error;
  return (data?.status ?? "pending") as PaymentStatus;
}
