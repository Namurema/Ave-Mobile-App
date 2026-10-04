import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AuthCard } from "../../components/AuthCard";
import { ForgotPasswordForm } from "../../components/auth/forms";
import { AUTH_ROUTES } from "../../constants/navigation";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <AuthCard title={t("auth.resetTitle")} description={t("auth.resetDescription")}>
      <ForgotPasswordForm onSwitch={(view) => router.replace(AUTH_ROUTES[view] as any)} />
    </AuthCard>
  );
}
