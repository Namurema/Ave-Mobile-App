import { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { AdminGate, ADMIN_TABS } from "../../components/admin/AdminGate";
import { getActivity, getProfiles, type Activity, type Profile } from "../../lib/supabase/admin";
import { Page, PageHeader, Section, ListCard, LoadingCard, EmptyState } from "../../components/ui/page";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

// Admin: accounts that have signed up, and what each one does
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
  return (
    <AdminGate>
      <Accounts />
    </AdminGate>
  );
}

function Accounts() {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activity, setActivity] = useState<Map<string, Activity> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProfiles(await getProfiles());
      // Activity needs supabase/migrations/20261118_admin_activity.sql; without
      // it the accounts still show
      setActivity(await getActivity().then((rows) => new Map(rows.map((row) => [row.user_id, row]))).catch(() => null));
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
  const rows = activity ? [...activity.values()] : [];
  const now = Date.now();
  const paying = rows.filter((a) => a.paid_until && new Date(a.paid_until).getTime() > now).length;
  const activeThisWeek = rows.filter((a) => a.days_active_7d > 0).length;
  const onTrial = rows.filter(
    (a) => !(a.paid_until && new Date(a.paid_until).getTime() > now) && (a.free_access || new Date(a.trial_ends_at).getTime() > now)
  ).length;
  const needPlan = rows.length - paying - onTrial;

  // "Paying until 3 Dec", "Trial until 25 Nov", "Free until 25 Nov" or "Trial ended"
  const accessLabel = (a: Activity) => {
    if (a.paid_until && new Date(a.paid_until).getTime() > now) return `Paying (${a.plan}) until ${formatDate(a.paid_until)}`;
    if (a.free_access) return a.free_until ? `Free until ${formatDate(a.free_until)}` : "Free access";
    if (new Date(a.trial_ends_at).getTime() > now) return `Trial until ${formatDate(a.trial_ends_at)}`;
    return "Trial ended";
  };
  const activityLine = (a: Activity) =>
    [
      `Prayed ${a.prayers_7d} this week (${a.prayers_total} total)`,
      a.last_prayed_on ? `last ${formatDate(a.last_prayed_on)}` : "never marked a prayer",
      `${a.favourites} saved`,
      a.routine_prayers ? `routine of ${a.routine_prayers}` : "no routine",
      a.reminders_on ? "reminders on" : null,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <Page sidebar={false}>
      <PageHeader title="Admin" description="Accounts that have signed up to Ave, and what each one does." tabs={ADMIN_TABS} />

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
            {activity && (
              <>
                <Stat label="Prayed this week" value={activeThisWeek} />
                <Stat label="Paying" value={paying} />
                <Stat label="On trial or free" value={onTrial} />
                <Stat label="Trial ended, no plan" value={needPlan} />
              </>
            )}
          </View>
          {!activity && (
            <Card className="p-4">
              <Text className="text-sm leading-5 text-muted-foreground">
                To see what each person does, run supabase/migrations/20261118_admin_activity.sql in the Supabase SQL Editor.
              </Text>
            </Card>
          )}

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
                items={filtered.map((p) => {
                  const a = activity?.get(p.id);
                  return {
                    key: p.id,
                    title: p.full_name || "No name",
                    description: [p.email, a ? activityLine(a) : null].filter(Boolean).join("\n") || undefined,
                    meta: [
                      `Joined ${formatDate(p.created_at)}`,
                      p.last_sign_in_at ? `Last signed in ${formatDate(p.last_sign_in_at)}` : "Never signed in",
                      a ? accessLabel(a) : null,
                    ]
                      .filter(Boolean)
                      .join(" · "),
                    badge: p.email_confirmed_at ? undefined : "Unconfirmed",
                  };
                })}
              />
            )}
          </Section>
        </>
      )}
    </Page>
  );
}
