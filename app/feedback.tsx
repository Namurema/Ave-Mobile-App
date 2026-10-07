import { useState } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/LanguageStore";
import { sendFeedback, FEEDBACK_KINDS, type FeedbackKind } from "../lib/supabase/feedback";
import { LEGAL_CONTACT_EMAIL } from "../constants/legal";
import { Page, PageHeader, Section } from "../components/ui/page";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { FormError } from "../components/auth/forms";

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const [kind, setKind] = useState<FeedbackKind>("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [fieldErrors, setFieldErrors] = useState<{ message?: string; email?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const errors = {
      message: message.trim() ? undefined : t("feedback.messageRequired"),
      email: !email.trim() || isEmail(email) ? undefined : t("auth.emailInvalid"),
    };
    setFieldErrors(errors);
    setError(null);
    if (errors.message || errors.email) return;
    setSending(true);
    try {
      await sendFeedback({ kind, message, email, language, userId: user?.id });
      setSent(true);
      setMessage("");
    } catch {
      setError(`${t("feedback.failed")} ${LEGAL_CONTACT_EMAIL}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Page sidebar={false}>
      <PageHeader back title={t("feedback.title")} description={t("feedback.description")} />

      {sent ? (
        <Card className="p-5 gap-4">
          <Text className="text-base leading-7 text-card-foreground">{t("feedback.sent")}</Text>
          <Button variant="outline" className="self-start" onPress={() => setSent(false)}>
            {t("feedback.sendAnother")}
          </Button>
        </Card>
      ) : (
        <>
          <Section title={t("feedback.kind")}>
            <Card className="p-4">
              <RadioGroup value={kind} onValueChange={(value) => setKind(value as FeedbackKind)}>
                {FEEDBACK_KINDS.map((option) => (
                  <RadioGroupItem key={option} value={option}>
                    <Text className="text-sm font-medium text-card-foreground">{t(`feedback.${option}`)}</Text>
                  </RadioGroupItem>
                ))}
              </RadioGroup>
            </Card>
          </Section>

          <Card className="p-5 gap-4">
            <FormError message={error} />
            <Input
              label={t("feedback.message")}
              value={message}
              onChangeText={(value) => {
                setMessage(value);
                setFieldErrors((errors) => ({ ...errors, message: undefined }));
              }}
              error={fieldErrors.message}
              placeholder={t(kind === "translation" ? "feedback.translationPlaceholder" : "feedback.messagePlaceholder")}
              multiline
              maxLength={2000}
              textAlignVertical="top"
              className="h-36 py-3"
            />
            <View className="gap-1.5">
              <Input
                label={t("feedback.email")}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setFieldErrors((errors) => ({ ...errors, email: undefined }));
                }}
                error={fieldErrors.email}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                inputMode="email"
              />
              <Text className="text-xs text-muted-foreground">{t("feedback.emailHint")}</Text>
            </View>
            <Button size="lg" loading={sending} onPress={submit}>
              {t("feedback.send")}
            </Button>
          </Card>
        </>
      )}
    </Page>
  );
}
