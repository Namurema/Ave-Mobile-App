import { Platform } from "react-native";
import { supabase } from "./supabase/client";

// Subscriptions through ObPay. The server (supabase/functions/obpay-*)
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

// Why a payment couldn't start: a wrong phone number, too many tries, or
// anything else
export type CheckoutError = "invalid_phone" | "too_many_requests" | "failed";

// Creates the payment on the server. Uganda (UGX): ObPay sends a PIN prompt to
// the phone, and the app waits on /payment/complete. Abroad (USD): the browser
// goes to ObPay's card page, which comes back to /payment/complete.
export async function startCheckout(
  plan: Plan,
  currency: Currency,
  phone?: string
): Promise<{ reference: string; promptSent: boolean; checkoutUrl: string | null }> {
  const { data, error } = await supabase.functions.invoke("obpay-checkout", { body: { plan, currency, phone } });
  if (error) {
    // The function's own reason, e.g. { error: "invalid_phone" }
    const reason = await (error as any).context?.json?.().then((body: any) => body?.error).catch(() => null);
    throw new Error(reason === "invalid_phone" || reason === "too_many_requests" ? reason : "failed");
  }
  if (!data?.reference) throw new Error("failed");
  if (data.checkout_url && !data.prompt_sent && Platform.OS === "web") window.location.assign(data.checkout_url);
  return { reference: data.reference, promptSent: !!data.prompt_sent, checkoutUrl: data.checkout_url ?? null };
}

// A Ugandan mobile number as typed: 0772 123456, +256 772 123456 or 772123456
export const isUgandaPhone = (input: string) => {
  const digits = input.replace(/\D/g, "");
  const local = digits.startsWith("256") ? digits.slice(3) : digits.startsWith("0") ? digits.slice(1) : digits;
  return /^7\d{8}$/.test(local);
};

export type PaymentStatus = "pending" | "completed" | "failed" | "invalid" | "reversed";

export async function checkPayment(reference: string): Promise<PaymentStatus> {
  const { data, error } = await supabase.functions.invoke("obpay-status", { body: { reference } });
  if (error) throw error;
  return (data?.status ?? "pending") as PaymentStatus;
}
