import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { AuthCard } from "../../components/AuthCard";
import { SignUpForm } from "../../components/auth/forms";
import { AUTH_ROUTES } from "../../constants/navigation";
import { PAYMENTS_ENABLED } from "../../constants/features";

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);

  // Signed in: straight away, or after entering the code from the email
  useEffect(() => {
    if (session) router.replace("/(tabs)/home");
  }, [session]);

  return (
    <AuthCard title={t("auth.signUpTitle")} description={t(PAYMENTS_ENABLED ? "auth.signUpDescription" : "auth.signUpDescriptionFree")}>
      <SignUpForm onSwitch={(view) => router.replace(AUTH_ROUTES[view] as any)} />
    </AuthCard>
  );
}
