import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { signInWithEmail } from "../../lib/supabase/auth";
import { useAuthStore } from "../../store/authStore";
import { AuthCard, AuthLink, isEmail } from "../../components/AuthCard";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const leave = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home"));

  // Already signed in (or just signed in): go back to where the user came from
  useEffect(() => {
    if (session) leave();
  }, [session]);

  const submit = async () => {
    const errors = {
      email: isEmail(email) ? undefined : t("auth.emailInvalid"),
      password: password ? undefined : t("auth.passwordRequired"),
    };
    setFieldErrors(errors);
    setError(null);
    if (errors.email || errors.password) return;

    setSubmitting(true);
    const { errorKey } = await signInWithEmail(email, password);
    setSubmitting(false);
    if (errorKey) setError(t(errorKey));
  };

  return (
    <AuthCard
      title={t("auth.signInTitle")}
      description={t("auth.signInDescription")}
      error={error}
      footer={<AuthLink prompt={t("auth.noAccount")} label={t("auth.createAccount")} href="/auth/sign-up" />}
    >
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
      <View className="gap-2">
        <Input
          label={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <Pressable onPress={() => router.push("/auth/forgot-password")} className="self-end">
          <Text className="text-sm font-medium text-primary">{t("auth.forgotPassword")}</Text>
        </Pressable>
      </View>
      <Button size="lg" loading={submitting} onPress={submit}>
        {t("auth.signIn")}
      </Button>
    </AuthCard>
  );
}
