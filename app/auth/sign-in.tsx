import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { AuthCard } from "../../components/AuthCard";
import { SignInForm } from "../../components/auth/forms";
import { AUTH_ROUTES } from "../../constants/navigation";

// Full-page sign-in (for links); most sign-ins happen in the pop-up
export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);

  // Already signed in, or just signed in: go back to where the user came from
  useEffect(() => {
    if (session) router.canGoBack() ? router.back() : router.replace("/(tabs)/home");
  }, [session]);

  return (
    <AuthCard title={t("auth.signInTitle")} description={t("auth.signInDescription")}>
      <SignInForm onSwitch={(view) => router.replace(AUTH_ROUTES[view] as any)} />
    </AuthCard>
  );
}
