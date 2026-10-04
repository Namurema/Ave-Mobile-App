import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthDialog } from "../../store/authDialogStore";
import { useAuthStore } from "../../store/authStore";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { SignInForm, SignUpForm, ForgotPasswordForm } from "./forms";

// The sign-in pop-up. Mounted once in the root layout; open it with
// useAuthDialog.getState().open("signIn") or the hook.
export function AuthDialog() {
  const router = useRouter();
  const { t } = useTranslation();
  const { view, redirectTo, show, close } = useAuthDialog();
  const session = useAuthStore((state) => state.session);

  // Signed in from the pop-up: close it, and go on if a destination was given
  useEffect(() => {
    if (!session || !view || view === "confirmEmail") return;
    const destination = redirectTo;
    close();
    if (destination) router.replace(destination as any);
  }, [session]);

  if (!view) return null;

  const copy = {
    signIn: { title: t("auth.signInTitle"), description: t("auth.signInDescription") },
    signUp: { title: t("auth.signUpTitle"), description: t("auth.signUpDescription") },
    forgot: { title: t("auth.resetTitle"), description: t("auth.resetDescription") },
    confirmEmail: { title: t("auth.confirmEmailTitle"), description: t("auth.confirmEmailDescription") },
  }[view];

  return (
    <Dialog open onClose={close} title={copy.title} description={copy.description} closeLabel={t("common.close")}>
      {view === "signIn" && <SignInForm onSwitch={show} />}
      {view === "signUp" && <SignUpForm onSwitch={show} onNeedsConfirmation={() => show("confirmEmail")} />}
      {view === "forgot" && <ForgotPasswordForm onSwitch={show} />}
      {view === "confirmEmail" && (
        <View className="gap-3">
          <Button size="lg" onPress={() => show("signIn")}>
            {t("auth.backToSignIn")}
          </Button>
        </View>
      )}
    </Dialog>
  );
}
