import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { signInWithEmail, signUpWithEmail, sendPasswordReset, verifyEmailCode, resendConfirmation } from "../../lib/supabase/auth";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "expo-router";
import { useAuthDialog, type AuthView } from "../../store/authDialogStore";
import { PasswordRules, isStrongPassword } from "./PasswordRules";
import { MAX_LENGTH, cleanName, rateLimit } from "../../lib/limits";

// Sign-in, sign-up and forgot-password forms, shared by the pop-up
// (AuthDialog) and the /auth pages. `onSwitch` moves between the forms.

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

// "I agree to the Terms and the Privacy Policy", required to create an
// account. The links close the pop-up first so the page isn't hidden behind it.
function AgreeToTerms({ checked, onChange, error }: { checked: boolean; onChange: (value: boolean) => void; error?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const closeDialog = useAuthDialog((state) => state.close);
  const open = (path: "/terms" | "/privacy") => {
    closeDialog();
    router.push(path);
  };
  return (
    <View className="gap-1.5">
      <View className="flex-row items-start gap-2.5">
        <Pressable role="checkbox" aria-checked={checked} aria-label={t("auth.agreeLabel")} onPress={() => onChange(!checked)} hitSlop={6}>
          <Ionicons name={checked ? "checkbox" : "square-outline"} size={22} color={error ? "#DC2626" : "#01758F"} />
        </Pressable>
        <Text className="flex-1 text-sm leading-5 text-muted-foreground" onPress={() => onChange(!checked)}>
          {t("auth.agreeStart")}{" "}
          <Text role="link" className="font-medium text-primary underline" onPress={() => open("/terms")}>
            {t("legal.terms")}
          </Text>{" "}
          {t("auth.agreeAnd")}{" "}
          <Text role="link" className="font-medium text-primary underline" onPress={() => open("/privacy")}>
            {t("legal.privacy")}
          </Text>
        </Text>
      </View>
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
}

const emailProps = {
  maxLength: MAX_LENGTH.email,
  autoCapitalize: "none",
  autoComplete: "email",
  keyboardType: "email-address",
  inputMode: "email",
  textContentType: "emailAddress",
} as const;

// Step two of creating an account (or of a password reset): the code from the
// email. The link in the same email still works; the code keeps people in the
// installed app, where an email link would open the browser instead.
export function EmailCodeForm({
  email,
  type,
  onVerified,
  onBack,
}: {
  email: string;
  type: "signup" | "recovery";
  onVerified?: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async () => {
    setError(null);
    setNotice(null);
    // Supabase codes are 6 digits by default (up to 10 if changed)
    if (!/^\d{6,10}$/.test(code)) return setFieldError(t("auth.codeInvalid"));
    setFieldError(null);
    const limit = rateLimit("verifyCode");
    if (limit.blocked()) return setError(t("auth.errors.tooManyAttempts"));
    setSubmitting(true);
    const { errorKey } = await verifyEmailCode(email, code, type);
    setSubmitting(false);
    if (!errorKey) {
      limit.reset();
      return onVerified?.();
    }
    limit.record();
    setError(t(errorKey));
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    const limit = rateLimit("passwordReset");
    if (limit.blocked()) return setError(t("auth.errors.waitBeforeResend"));
    limit.record();
    setResending(true);
    const { errorKey } = type === "signup" ? await resendConfirmation(email) : await sendPasswordReset(email);
    setResending(false);
    if (errorKey && errorKey !== "auth.errors.generic") setError(t(errorKey));
    else setNotice(t("auth.codeResent"));
  };

  return (
    <View className="gap-4">
      <View className="rounded-md bg-primary/5 p-3 gap-1">
        <Text className="text-sm font-semibold text-foreground">{t("auth.confirmEmailTitle")}</Text>
        <Text className="text-sm leading-6 text-foreground">
          {t(type === "signup" ? "auth.codeSentSignUp" : "auth.codeSentReset")} <Text className="font-semibold">{email.trim()}</Text>
        </Text>
      </View>
      <FormError message={error} />
      {notice ? <Text className="text-sm text-primary">{notice}</Text> : null}
      <Input
        label={t("auth.code")}
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 10))}
        error={fieldError}
        keyboardType="number-pad"
        inputMode="numeric"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={10}
        placeholder="123456"
        className="text-center text-xl tracking-[0.3em]"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Button size="lg" loading={submitting} onPress={submit}>
        {t("auth.verify")}
      </Button>
      <View className="flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Pressable onPress={resend} disabled={resending}>
          <Text className="text-sm font-semibold text-primary">{t("auth.resendCode")}</Text>
        </Pressable>
        <Pressable onPress={onBack}>
          <Text className="text-sm font-medium text-muted-foreground">{t("auth.changeEmail")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function SignInForm({ onSwitch }: { onSwitch: (view: AuthView) => void }) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
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
    const limit = rateLimit("signIn");
    if (limit.blocked()) return setError(t("auth.errors.tooManyAttempts"));
    setSubmitting(true);
    const { errorKey } = await signInWithEmail(email, password);
    setSubmitting(false);
    if (!errorKey) return limit.reset();
    if (errorKey === "auth.errors.invalidCredentials") limit.record();
    // Never confirmed: send a fresh code and ask for it here
    if (errorKey === "auth.errors.emailNotConfirmed") {
      resendConfirmation(email);
      return setConfirming(true);
    }
    setError(t(errorKey));
  };

  if (confirming) return <EmailCodeForm email={email} type="signup" onBack={() => setConfirming(false)} />;

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
          maxLength={MAX_LENGTH.password}
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

export function SignUpForm({ onSwitch }: { onSwitch: (view: AuthView) => void }) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; agree?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const errors = {
      name: cleanName(name) ? undefined : t("auth.nameRequired"),
      email: isEmail(email) ? undefined : t("auth.emailInvalid"),
      password: isStrongPassword(password) ? undefined : t("auth.passwordInvalid"),
      agree: agreed ? undefined : t("auth.agreeRequired"),
    };
    setFieldErrors(errors);
    setError(null);
    if (errors.name || errors.email || errors.password || errors.agree) return;
    const limit = rateLimit("signUp");
    if (limit.blocked()) return setError(t("auth.errors.tooManyAttempts"));
    limit.record();
    setSubmitting(true);
    const { errorKey, needsConfirmation } = await signUpWithEmail(cleanName(name), email, password);
    setSubmitting(false);
    if (errorKey) setError(t(errorKey));
    else if (needsConfirmation) setConfirming(true);
  };

  // Signed in by the code: the caller reacts to the new session
  if (confirming) return <EmailCodeForm email={email} type="signup" onBack={() => setConfirming(false)} />;

  return (
    <View className="gap-4">
      <FormError message={error} />
      <Input label={t("auth.name")} value={name} onChangeText={setName} error={fieldErrors.name} maxLength={MAX_LENGTH.name} autoComplete="name" textContentType="name" returnKeyType="next" />
      <Input label={t("auth.email")} value={email} onChangeText={setEmail} error={fieldErrors.email} returnKeyType="next" {...emailProps} />
      <View className="gap-2">
        <Input
          label={t("auth.password")}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setFieldErrors((errors) => ({ ...errors, password: undefined }));
          }}
          error={fieldErrors.password}
          secureTextEntry
          maxLength={MAX_LENGTH.password}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <PasswordRules password={password} />
      </View>
      <AgreeToTerms
        checked={agreed}
        onChange={(value) => {
          setAgreed(value);
          setFieldErrors((errors) => ({ ...errors, agree: undefined }));
        }}
        error={fieldErrors.agree}
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
  const router = useRouter();
  const closeDialog = useAuthDialog((state) => state.close);
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError(null);
    if (!isEmail(email)) return setFieldError(t("auth.emailInvalid"));
    setFieldError(null);
    const limit = rateLimit("passwordReset");
    if (limit.blocked()) return setError(t("auth.errors.waitBeforeResend"));
    limit.record();
    setSubmitting(true);
    const { errorKey } = await sendPasswordReset(email);
    setSubmitting(false);
    // Same message whether or not the email has an account
    if (errorKey && errorKey !== "auth.errors.generic") setError(t(errorKey));
    else setSent(true);
  };

  // The code signs the person in; then they choose a new password
  if (sent) {
    return (
      <EmailCodeForm
        email={email}
        type="recovery"
        onBack={() => setSent(false)}
        onVerified={() => {
          closeDialog();
          router.replace("/auth/reset-password");
        }}
      />
    );
  }

  return (
    <View className="gap-4">
      <FormError message={error} />
      <Input label={t("auth.email")} value={email} onChangeText={setEmail} error={fieldError} returnKeyType="send" onSubmitEditing={submit} {...emailProps} />
      <Button size="lg" loading={submitting} onPress={submit}>
        {t("auth.sendResetLink")}
      </Button>
      <SwitchLink label={t("auth.backToSignIn")} onPress={() => onSwitch("signIn")} />
    </View>
  );
}
