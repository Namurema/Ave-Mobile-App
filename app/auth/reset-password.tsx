import { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { updatePassword } from "../../lib/supabase/auth";
import { useAuthStore } from "../../store/authStore";
import { AuthCard, AuthLink } from "../../components/AuthCard";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { LoadingCard, Page } from "../../components/ui/page";
import { PasswordRules, isStrongPassword } from "../../components/auth/PasswordRules";

// Where the link in a password-reset email lands. Supabase reads the session
// from the link, so the user is signed in and can choose a new password.
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { session, loading, finishPasswordRecovery } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (loading) {
    return (
      <Page sidebar={false}>
        <LoadingCard />
      </Page>
    );
  }

  // No session from the link: it expired or was already used
  if (!session) {
    return (
      <AuthCard
        title={t("auth.newPasswordTitle")}
        error={t("auth.resetLinkInvalid")}
        footer={<AuthLink label={t("auth.resetTitle")} href="/auth/forgot-password" />}
      >
        {null}
      </AuthCard>
    );
  }

  const submit = async () => {
    setError(null);
    const strong = isStrongPassword(password);
    const matches = password === confirm;
    setFieldError(strong ? null : t("auth.passwordInvalid"));
    setConfirmError(matches ? null : t("auth.passwordsDontMatch"));
    if (!strong || !matches) return;

    setSubmitting(true);
    const { errorKey } = await updatePassword(password);
    setSubmitting(false);
    if (errorKey) return setError(t(errorKey));
    finishPasswordRecovery();
    setDone(true);
  };

  return (
    <AuthCard
      title={t("auth.newPasswordTitle")}
      description={done ? undefined : t("auth.newPasswordDescription")}
      error={error}
    >
      {done ? (
        <>
          <View className="rounded-md bg-primary/5 p-3">
            <Text className="text-sm text-foreground">{t("auth.passwordUpdated")}</Text>
          </View>
          <Button size="lg" onPress={() => router.replace("/(tabs)/home")}>
            {t("auth.continueToHome")}
          </Button>
        </>
      ) : (
        <>
          <View className="gap-2">
            <Input
              label={t("auth.newPassword")}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setFieldError(null);
              }}
              error={fieldError}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
            />
            <PasswordRules password={password} />
          </View>
          <Input
            label={t("auth.confirmPassword")}
            value={confirm}
            onChangeText={(value) => {
              setConfirm(value);
              setConfirmError(null);
            }}
            error={confirmError}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          <Button size="lg" loading={submitting} onPress={submit}>
            {t("auth.savePassword")}
          </Button>
        </>
      )}
    </AuthCard>
  );
}
