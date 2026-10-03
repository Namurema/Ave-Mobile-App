import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { signUpWithEmail } from "../../lib/supabase/auth";
import { useAuthStore } from "../../store/authStore";
import { AuthCard, AuthLink, isEmail } from "../../components/AuthCard";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const MIN_PASSWORD = 8;

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  // Signed in straight away (no email confirmation required)
  useEffect(() => {
    if (session) router.replace("/(tabs)/home");
  }, [session]);

  const submit = async () => {
    const errors = {
      name: name.trim() ? undefined : t("auth.nameRequired"),
      email: isEmail(email) ? undefined : t("auth.emailInvalid"),
      password: password.length >= MIN_PASSWORD ? undefined : t("auth.passwordTooShort"),
    };
    setFieldErrors(errors);
    setError(null);
    if (errors.name || errors.email || errors.password) return;

    setSubmitting(true);
    const { errorKey, needsConfirmation } = await signUpWithEmail(name, email, password);
    setSubmitting(false);
    if (errorKey) setError(t(errorKey));
    else if (needsConfirmation) setAwaitingConfirmation(true);
  };

  if (awaitingConfirmation) {
    return (
      <AuthCard
        title={t("auth.confirmEmailTitle")}
        description={t("auth.confirmEmailDescription")}
        footer={<AuthLink label={t("auth.backToSignIn")} href="/auth/sign-in" />}
      >
        {null}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("auth.signUpTitle")}
      description={t("auth.signUpDescription")}
      error={error}
      footer={<AuthLink prompt={t("auth.haveAccount")} label={t("auth.signIn")} href="/auth/sign-in" />}
    >
      <Input
        label={t("auth.name")}
        value={name}
        onChangeText={setName}
        error={fieldErrors.name}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
      <Input
        label={t("auth.email")}
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        inputMode="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <Input
        label={t("auth.password")}
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        placeholder={t("auth.passwordTooShort")}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Button size="lg" loading={submitting} onPress={submit}>
        {t("auth.createAccount")}
      </Button>
    </AuthCard>
  );
}
