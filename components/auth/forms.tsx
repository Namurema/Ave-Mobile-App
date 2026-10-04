import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { signInWithEmail, signUpWithEmail, sendPasswordReset } from "../../lib/supabase/auth";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { AuthView } from "../../store/authDialogStore";

// Sign-in, sign-up and forgot-password forms, shared by the pop-up
// (AuthDialog) and the /auth pages. `onSwitch` moves between the forms.

const MIN_PASSWORD = 8;
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
      <Text className="text-sm text-destructive">{message}</Text>
    </View>
  );
}

function SwitchLink({ prompt, label, onPress }: { prompt?: string; label: string; onPress: () => void }) {
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-1">
      {prompt ? <Text className="text-sm text-muted-foreground">{prompt}</Text> : null}
      <Pressable onPress={onPress}>
        <Text className="text-sm font-semibold text-primary">{label}</Text>
      </Pressable>
    </View>
  );
}

const emailProps = {
  autoCapitalize: "none",
  autoComplete: "email",
  keyboardType: "email-address",
  inputMode: "email",
  textContentType: "emailAddress",
} as const;

export function SignInForm({ onSwitch }: { onSwitch: (view: AuthView) => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // On success the auth store gets the new session; the caller reacts to it
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
    <View className="gap-4">
      <FormError message={error} />
      <Input label={t("auth.email")} value={email} onChangeText={setEmail} error={fieldErrors.email} returnKeyType="next" {...emailProps} />
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
        <Pressable onPress={() => onSwitch("forgot")} className="self-end">
          <Text className="text-sm font-medium text-primary">{t("auth.forgotPassword")}</Text>
        </Pressable>
      </View>
      <Button size="lg" loading={submitting} onPress={submit}>
        {t("auth.signIn")}
      </Button>
      <SwitchLink prompt={t("auth.noAccount")} label={t("auth.createAccount")} onPress={() => onSwitch("signUp")} />
    </View>
  );
}

export function SignUpForm({
  onSwitch,
  onNeedsConfirmation,
}: {
  onSwitch: (view: AuthView) => void;
  onNeedsConfirmation: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    else if (needsConfirmation) onNeedsConfirmation();
  };

  return (
    <View className="gap-4">
      <FormError message={error} />
      <Input label={t("auth.name")} value={name} onChangeText={setName} error={fieldErrors.name} autoComplete="name" textContentType="name" returnKeyType="next" />
      <Input label={t("auth.email")} value={email} onChangeText={setEmail} error={fieldErrors.email} returnKeyType="next" {...emailProps} />
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
      <SwitchLink prompt={t("auth.haveAccount")} label={t("auth.signIn")} onPress={() => onSwitch("signIn")} />
    </View>
  );
}

export function ForgotPasswordForm({ onSwitch }: { onSwitch: (view: AuthView) => void }) {
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
    <View className="gap-4">
      <FormError message={error} />
      {sent ? (
        <View className="rounded-md bg-primary/5 p-3">
          <Text className="text-sm leading-6 text-foreground">{t("auth.resetSent")}</Text>
        </View>
      ) : (
        <>
          <Input label={t("auth.email")} value={email} onChangeText={setEmail} error={fieldError} returnKeyType="send" onSubmitEditing={submit} {...emailProps} />
          <Button size="lg" loading={submitting} onPress={submit}>
            {t("auth.sendResetLink")}
          </Button>
        </>
      )}
      <SwitchLink label={t("auth.backToSignIn")} onPress={() => onSwitch("signIn")} />
    </View>
  );
}
