import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { useAccessStore } from "../../store/accessStore";
import { useLanguageStore } from "../../store/LanguageStore";
import { formatDayMonth } from "../../lib/i18n/helpers";
import { checkPayment, type PaymentStatus } from "../../lib/billing";
import { Page, PageHeader, LoadingCard } from "../../components/ui/page";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

// Mobile money can take a little while to confirm
const CHECKS = 10;
const CHECK_EVERY_MS = 3000;

// PesaPal sends people back here with ?OrderTrackingId=...&OrderMerchantReference=...
export default function PaymentCompleteScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const { OrderTrackingId } = useLocalSearchParams<{ OrderTrackingId?: string }>();
  const session = useAuthStore((state) => state.session);
  const authLoading = useAuthStore((state) => state.loading);
  const { access, refresh } = useAccessStore();
  const [status, setStatus] = useState<PaymentStatus | "error">("pending");

  useEffect(() => {
    if (authLoading) return;
    if (!session || !OrderTrackingId) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    (async () => {
      for (let i = 0; i < CHECKS && !cancelled; i++) {
        try {
          const result = await checkPayment(OrderTrackingId);
          if (result !== "pending") {
            if (!cancelled) setStatus(result);
            if (result === "completed") await refresh();
            return;
          }
        } catch {
          if (i === CHECKS - 1 && !cancelled) setStatus("error");
        }
        await new Promise((resolve) => setTimeout(resolve, CHECK_EVERY_MS));
      }
      // Still pending: PesaPal confirms later and the account updates then; say so
      if (!cancelled) setStatus("error");
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, session, OrderTrackingId]);

  const paidUntil = access?.paidUntil;

  return (
    <Page sidebar={false}>
      <PageHeader title={t("billing.title")} />
      {status === "pending" ? (
        <LoadingCard label={t("billing.checking")} />
      ) : (
        <Card className="p-5 gap-3">
          <Text className="text-lg font-bold text-card-foreground">
            {status === "completed" ? t("billing.thankYou") : t("billing.notPaid")}
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground">
            {status === "completed"
              ? paidUntil
                ? `${t("billing.paidUntil")} ${formatDayMonth(paidUntil, language)} ${paidUntil.getFullYear()}`
                : t("billing.activated")
              : status === "error"
                ? t("billing.checkLater")
                : t("billing.notPaidText")}
          </Text>
          <Button
            className="self-start"
            onPress={() => router.replace(status === "completed" ? "/(tabs)/home" : "/subscribe")}
          >
            {status === "completed" ? t("billing.startPraying") : t("billing.tryAgain")}
          </Button>
        </Card>
      )}
    </Page>
  );
}
