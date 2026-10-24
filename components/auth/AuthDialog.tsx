import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthDialog } from "../../store/authDialogStore";
import { useAuthStore } from "../../store/authStore";
import { PAYMENTS_ENABLED } from "../../constants/features";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { SignInForm, SignUpForm, ForgotPasswordForm } from "./forms";
import { continueWithoutAccount, runWhenAccountReady } from "../../lib/accountPrompt";

// The sign-in pop-up. Mounted once in the root layout; open it with
// useAuthDialog.getState().open("signIn") or the hook.
export function AuthDialog() {
  const router = useRouter();
  const { t } = useTranslation();
  const { view, redirectTo, pendingAction, show, close } = useAuthDialog();
  const session = useAuthStore((state) => state.session);

  // Signed in from the pop-up: close it, finish what the user was doing
  // (e.g. saving a favourite), and go on if a destination was given
  useEffect(() => {
    if (!session || !view) return;
    // A reset code was entered: the form goes on to choosing a new password
    if (useAuthStore.getState().recoveringPassword) return;
    const destination = redirectTo;
    const action = pendingAction;
    close();
    if (action) runWhenAccountReady(session.user.id, action);
    if (destination) router.replace(destination as any);
  }, [session]);

  if (!view) return null;

  const copy = {
    signIn: { title: t("auth.signInTitle"), description: t("auth.signInDescription") },
    signUp: { title: t("auth.signUpTitle"), description: t(PAYMENTS_ENABLED ? "auth.signUpDescription" : "auth.signUpDescriptionFree") },
    forgot: { title: t("auth.resetTitle"), description: t("auth.resetDescription") },
  }[view];
  // Opened by Save or Mark as prayed: explain why an account helps
  const description = pendingAction ? t("progress.signInToKeep") : copy.description;

  return (
    <Dialog glass open onClose={close} title={copy.title} description={description} closeLabel={t("common.close")}>
      {view === "signIn" && <SignInForm onSwitch={show} />}
      {view === "signUp" && <SignUpForm onSwitch={show} />}
      {view === "forgot" && <ForgotPasswordForm onSwitch={show} />}
      {pendingAction && (
        <View className="border-t border-black/10 pt-4">
          <Button variant="ghost" onPress={continueWithoutAccount}>
            {t("auth.notNow")}
          </Button>
        </View>
      )}
    </Dialog>
  );
}
