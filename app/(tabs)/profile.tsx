import { View, Text, Platform, Pressable } from "react-native";
import { InstallCard } from "../../components/InstallCard";
import { buildId } from "../../lib/pwa";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAuthStore, displayName } from "../../store/authStore";
import { useAuthDialog } from "../../store/authDialogStore";
import { useUserDataStore } from "../../store/userDataStore";
import { useRoutineStore } from "../../store/routineStore";
import { useAccessStore } from "../../store/accessStore";
import { formatDayMonth } from "../../lib/i18n/helpers";
import { currentStreak, splitLogId } from "../../lib/progress";
import { useLanguageStore } from "../../store/LanguageStore";
import { LOGIN_ENABLED, PAYMENTS_ENABLED } from "../../constants/features";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Page, PageHeader, Section, ListCard } from "../../components/ui/page";
import { Dialog } from "../../components/ui/dialog";
import { FormError } from "../../components/auth/forms";
import { deleteAccount } from "../../lib/supabase/account";
import { languageInfo } from "../../constants/languages";
import { DonateCard } from "../../components/Popups";
import { DONATIONS_ENABLED } from "../../constants/donate";

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, session, signOut, isAdmin } = useAuthStore();
  const { language } = useLanguageStore();
  const [signingOut, setSigningOut] = useState(false);
  const openAuth = useAuthDialog((state) => state.open);
  const log = useUserDataStore((state) => state.log);
  const favouriteCount = useUserDataStore((state) => state.favourites.length);
  const routineCount = useRoutineStore((state) => state.entries.length);
  const access = useAccessStore((state) => state.access);
  const streak = currentStreak(new Set([...log].map((id) => splitLogId(id).day)));

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(user.id);
      setConfirmDelete(false);
      router.replace("/splash");
    } catch {
      setDeleteError(t("account.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  const isSignedIn = !!session;

  return (
    <Page sidebar={false}>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />

      <Section title={t("settings.activity")}>
        <ListCard
          items={[
            {
              key: "progress",
              title: t("progress.title"),
              description: `${t("progress.streak")}: ${streak}`,
              onPress: () => router.push("/progress"),
            },
            {
              key: "favourites",
              title: t("favourites.title"),
              description: `${favouriteCount}`,
              onPress: () => router.push("/favourites"),
            },
            {
              key: "routine",
              title: t("routine.title"),
              description: routineCount ? `${routineCount} ${t("routine.prayersCount")}` : t("routine.none"),
              onPress: () => router.push("/routine"),
            },
          ]}
        />
      </Section>

      <Section title={t("settings.language")}>
        <Card className="p-4 flex-row items-center gap-3">
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-card-foreground">
              {languageInfo(language).name}
            </Text>
            <Text className="text-sm text-muted-foreground">{t("settings.languageHint")}</Text>
          </View>
          <Button variant="outline" size="sm" onPress={() => router.push("/Language")}>
            {t("common.change")}
          </Button>
        </Card>
      </Section>

      {LOGIN_ENABLED && (
        <Section title={t("settings.account")}>
          {isSignedIn ? (
            <Card className="p-4 flex-row items-center gap-3">
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-card-foreground">{displayName(user)}</Text>
                <Text className="text-sm text-muted-foreground">{user?.email}</Text>
              </View>
              <Button variant="outline" size="sm" loading={signingOut} onPress={handleSignOut}>
                {t("common.signOut")}
              </Button>
            </Card>
          ) : null}
          {isSignedIn ? (
            <Pressable onPress={() => setConfirmDelete(true)} className="self-start rounded-md px-1 py-2">
              <Text className="text-sm font-medium text-destructive">{t("account.delete")}</Text>
            </Pressable>
          ) : (
            <Card className="p-4 gap-3">
              <Text className="text-sm leading-6 text-muted-foreground">{t("settings.signInToSync")}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Button size="sm" onPress={() => openAuth("signIn")}>
                  {t("auth.signIn")}
                </Button>
                <Button variant="outline" size="sm" onPress={() => openAuth("signUp")}>
                  {t("auth.createAccount")}
                </Button>
              </View>
            </Card>
          )}
        </Section>
      )}

      {isAdmin && (
        <Section title="Admin">
          <Card className="p-4 flex-row items-center gap-3">
            <Text className="flex-1 text-sm text-muted-foreground">See the accounts that have signed up.</Text>
            <Button variant="outline" size="sm" onPress={() => router.push("/admin")}>
              View accounts
            </Button>
          </Card>
        </Section>
      )}

      {/* Only once the server has answered (payments may not be set up yet) */}
      {PAYMENTS_ENABLED && isSignedIn && access && (
        <Section title={t("billing.subscription")}>
          <Card className="p-4 gap-3">
            <Text className="text-sm leading-5 text-card-foreground">
              {access.granted
                ? t("billing.granted")
                : access?.paidUntil && access.paidUntil > new Date()
                ? `${t("billing.paidUntil")} ${formatDayMonth(access.paidUntil, language)} ${access.paidUntil.getFullYear()}`
                : access?.trialEndsAt && access.trialEndsAt > new Date()
                  ? `${t("billing.trialUntil")} ${formatDayMonth(access.trialEndsAt, language)}`
                  : t("billing.trialEnded")}
            </Text>
            <Button size="sm" className="self-start" onPress={() => router.push("/subscribe")}>
              {access?.paidUntil && access.paidUntil > new Date() ? t("billing.extend") : t("billing.choosePlan")}
            </Button>
          </Card>
        </Section>
      )}

      {Platform.OS === "web" && (
        <Section title={t("settings.app")}>
          <InstallCard dismissible={false} />
        </Section>
      )}

      {DONATIONS_ENABLED && (
        <Section title={t("donate.settingsTitle")}>
          <DonateCard />
        </Section>
      )}

      <Section title={t("settings.about")}>
        <Card className="p-4 gap-1">
          <Text className="text-sm font-semibold text-card-foreground">Ave</Text>
          <Text className="text-sm leading-6 text-muted-foreground">
            {t("settings.aboutText")}
          </Text>
          <Text className="mt-2 text-xs text-muted-foreground">{t("settings.version")} 1.0.0{buildId() ? ` (${buildId()})` : ""}</Text>
        </Card>
      </Section>

      <Section title={t("settings.help")}>
        <ListCard
          items={[
            {
              key: "feedback",
              title: t("feedback.title"),
              description: t("feedback.hint"),
              onPress: () => router.push("/feedback"),
            },
          ]}
        />
      </Section>

      <Section title={t("settings.legal")}>
        <ListCard
          items={[
            {
              key: "privacy",
              title: t("legal.privacy"),
              description: t("legal.privacyHint"),
              onPress: () => router.push("/privacy"),
            },
            {
              key: "terms",
              title: t("legal.terms"),
              description: t("legal.termsHint"),
              onPress: () => router.push("/terms"),
            },
          ]}
        />
      </Section>
      <Dialog
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        title={t("account.deleteTitle")}
        description={t("account.deleteText")}
        closeLabel={t("routine.cancel")}
      >
        <View className="gap-3">
          <FormError message={deleteError} />
          <View className="flex-row flex-wrap gap-2">
            <Button className="bg-destructive web:hover:bg-destructive/90" loading={deleting} onPress={handleDelete}>
              {t("account.deleteConfirm")}
            </Button>
            <Button variant="outline" disabled={deleting} onPress={() => setConfirmDelete(false)}>
              {t("routine.cancel")}
            </Button>
          </View>
        </View>
      </Dialog>
    </Page>
  );
}
