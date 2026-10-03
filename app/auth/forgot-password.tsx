import { useState } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { sendPasswordReset } from "../../lib/supabase/auth";
import { AuthCard, AuthLink, isEmail } from "../../components/AuthCard";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError(null);
    if (!isEmail(email)) return setFieldError(t("auth.emailInvalid"));
    setFieldError(null);

    setSubmitting(true);
    const { errorKey } = await sendPasswordReset(email);
    setSubmitting(false);
    // Same message whether or not the email has an account
    if (errorKey && errorKey !== "auth.errors.generic") setError(t(errorKey));
    else setSent(true);
  };

  return (
    <AuthCard
      title={t("auth.resetTitle")}
      description={t("auth.resetDescription")}
      error={error}
      footer={<AuthLink label={t("auth.backToSignIn")} href="/auth/sign-in" />}
    >
      {sent ? (
        <View className="rounded-md bg-primary/5 p-3">
          <Text className="text-sm leading-6 text-foreground">{t("auth.resetSent")}</Text>
        </View>
      ) : (
        <>
          <Input
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            error={fieldError}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            inputMode="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={submit}
          />
          <Button size="lg" loading={submitting} onPress={submit}>
            {t("auth.sendResetLink")}
          </Button>
        </>
      )}
    </AuthCard>
  );
}
