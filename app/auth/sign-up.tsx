import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { AuthCard, AuthLink } from "../../components/AuthCard";
import { SignUpForm } from "../../components/auth/forms";
import { AUTH_ROUTES } from "../../constants/navigation";

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  // Signed in straight away (no email confirmation required)
  useEffect(() => {
    if (session) router.replace("/(tabs)/home");
  }, [session]);

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
    <AuthCard title={t("auth.signUpTitle")} description={t("auth.signUpDescription")}>
      <SignUpForm
        onSwitch={(view) => router.replace(AUTH_ROUTES[view] as any)}
        onNeedsConfirmation={() => setAwaitingConfirmation(true)}
      />
    </AuthCard>
  );
}
