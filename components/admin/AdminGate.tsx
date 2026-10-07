import type { ReactNode } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAuthDialog } from "../../store/authDialogStore";
import { Page, PageHeader, LoadingCard, EmptyState, type PageTab } from "../ui/page";
import { Button } from "../ui/button";

// Admin area pages (English only; the admin is the app owner)
export const ADMIN_TABS: PageTab[] = [
  { label: "Accounts", route: "/admin" },
  { label: "Feedback", route: "/admin/feedback" },
];

// Shows `children` only to the admin; everyone else gets a sign-in prompt or a notice
export function AdminGate({ children }: { children: ReactNode }) {
  const { session, loading, isAdmin } = useAuthStore();

  if (loading) {
    return (
      <Page sidebar={false}>
        <LoadingCard />
      </Page>
    );
  }

  if (!session || !isAdmin) {
    return (
      <Page sidebar={false}>
        <PageHeader title="Admin" />
        <EmptyState
          title={session ? "This page is only for the Ave admin" : "Sign in to continue"}
          description={session ? "Your account doesn't have admin access." : "The admin area needs the admin account."}
        >
          {!session && <Button onPress={() => useAuthDialog.getState().open("signIn")}>Sign in</Button>}
        </EmptyState>
      </Page>
    );
  }

  return <>{children}</>;
}
