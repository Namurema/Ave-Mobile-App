import { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { getProfiles, type Profile } from "../../lib/supabase/admin";
import { Page, PageHeader, Section, ListCard, LoadingCard, EmptyState } from "../../components/ui/page";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

// Admin area (English only; the admin is the app owner). Lists signed-up accounts.
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="p-1.5 w-full sm:w-1/3">
      <Card className="p-5 gap-1">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="text-3xl font-bold tracking-tight text-card-foreground">{value}</Text>
      </Card>
    </View>
  );
}

export default function AdminScreen() {
  const router = useRouter();
  const { session, loading: authLoading, isAdmin } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProfiles(await getProfiles());
    } catch (e: any) {
      // Table missing means the setup SQL hasn't been run yet
      setError(
        e?.code === "42P01" || /profiles/.test(e?.message ?? "")
          ? "The accounts table isn't set up yet. Run supabase/migrations/20261004_admin_profiles.sql in the Supabase SQL Editor."
          : "Couldn't load accounts. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) => p.email?.toLowerCase().includes(q) || p.full_name?.toLowerCase().includes(q)
    );
  }, [profiles, query]);

  const newThisWeek = profiles.filter((p) => Date.now() - new Date(p.created_at).getTime() < WEEK_MS).length;
  const confirmed = profiles.filter((p) => p.email_confirmed_at).length;

  if (authLoading) {
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
          {!session && <Button onPress={() => router.push("/auth/sign-in")}>Sign in</Button>}
        </EmptyState>
      </Page>
    );
  }

  return (
    <Page sidebar={false}>
      <PageHeader title="Admin" description="Accounts that have signed up to Ave." />

      {loading ? (
        <LoadingCard label="Loading accounts..." />
      ) : error ? (
        <EmptyState title="Accounts unavailable" description={error}>
          <Button variant="outline" onPress={load}>
            Try again
          </Button>
        </EmptyState>
      ) : (
        <>
          <View className="flex-row flex-wrap -m-1.5">
            <Stat label="Total accounts" value={profiles.length} />
            <Stat label="New this week" value={newThisWeek} />
            <Stat label="Confirmed emails" value={confirmed} />
          </View>

          <Input
            label="Search"
            value={query}
            onChangeText={setQuery}
            placeholder="Name or email"
            autoCapitalize="none"
          />

          <Section
            title="Accounts"
            count={filtered.length}
            action={{ label: "Refresh", onPress: load }}
          >
            {filtered.length === 0 ? (
              <Text className="p-5 text-sm text-muted-foreground">
                {profiles.length === 0 ? "No accounts yet." : "No accounts match your search."}
              </Text>
            ) : (
              <ListCard
                items={filtered.map((p) => ({
                  key: p.id,
                  title: p.full_name || "No name",
                  description: p.email ?? undefined,
                  meta: [
                    `Joined ${formatDate(p.created_at)}`,
                    p.last_sign_in_at ? `Last signed in ${formatDate(p.last_sign_in_at)}` : "Never signed in",
                  ].join(" · "),
                  badge: p.email_confirmed_at ? undefined : "Unconfirmed",
                }))}
              />
            )}
          </Section>
        </>
      )}
    </Page>
  );
}
