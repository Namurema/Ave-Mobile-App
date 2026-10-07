import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { AdminGate, ADMIN_TABS } from "../../components/admin/AdminGate";
import { getFeedback, setFeedbackResolved, type Feedback, type FeedbackKind } from "../../lib/supabase/feedback";
import { Page, PageHeader, Section, LoadingCard, EmptyState } from "../../components/ui/page";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

// Admin: feedback sent from the app, unresolved first
const kindLabels: Record<FeedbackKind, string> = {
  suggestion: "Idea",
  translation: "Translation",
  problem: "Problem",
  other: "Other",
};

const languageLabels: Record<string, string> = { en: "English", lg: "Luganda", rny: "Runyankore" };

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="p-1.5 w-1/2 sm:w-1/3">
      <Card className="p-5 gap-1">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="text-3xl font-bold tracking-tight text-card-foreground">{value}</Text>
      </Card>
    </View>
  );
}

function FeedbackCard({ item, onToggle }: { item: Feedback; onToggle: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const details = [
    formatDate(item.created_at),
    item.language ? languageLabels[item.language] ?? item.language : null,
    item.user_id ? "Signed in" : "Guest",
  ].filter(Boolean);

  return (
    <Card className={item.resolved ? "p-5 gap-3 border-b border-border opacity-60" : "p-5 gap-3 border-b border-border"}>
      <View className="flex-row flex-wrap items-center gap-2">
        <Badge>{kindLabels[item.kind] ?? item.kind}</Badge>
        <Text className="text-xs text-muted-foreground">{details.join(" · ")}</Text>
      </View>
      <Text selectable className="text-base leading-7 text-card-foreground">
        {item.message}
      </Text>
      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <Text selectable className="text-sm text-muted-foreground">
          {item.email ? `Reply to ${item.email}` : "No email left"}
        </Text>
        <Button
          variant="outline"
          size="sm"
          loading={saving}
          onPress={async () => {
            setSaving(true);
            await onToggle();
            setSaving(false);
          }}
        >
          {item.resolved ? "Reopen" : "Mark resolved"}
        </Button>
      </View>
    </Card>
  );
}

function FeedbackList() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getFeedback());
    } catch (e: any) {
      // Table missing means the setup SQL hasn't been run yet
      setError(
        e?.code === "42P01" || /feedback/.test(e?.message ?? "")
          ? "The feedback table isn't set up yet. Run supabase/migrations/20261007_feedback.sql in the Supabase SQL Editor."
          : "Couldn't load feedback. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (item: Feedback) => {
    try {
      await setFeedbackResolved(item.id, !item.resolved);
      setItems((current) => current.map((f) => (f.id === item.id ? { ...f, resolved: !f.resolved } : f)));
    } catch {
      setError("Couldn't update that feedback. Try again.");
    }
  };

  const open = items.filter((f) => !f.resolved);
  const resolved = items.filter((f) => f.resolved);

  return (
    <Page sidebar={false}>
      <PageHeader title="Admin" description="Feedback sent from the app." tabs={ADMIN_TABS} />

      {loading ? (
        <LoadingCard label="Loading feedback..." />
      ) : error ? (
        <EmptyState title="Feedback unavailable" description={error}>
          <Button variant="outline" onPress={load}>
            Try again
          </Button>
        </EmptyState>
      ) : (
        <>
          <View className="flex-row flex-wrap -m-1.5">
            <Stat label="To review" value={open.length} />
            <Stat label="Total" value={items.length} />
          </View>

          <Section title="To review" count={open.length} action={{ label: "Refresh", onPress: load }}>
            {open.length === 0 ? (
              <Text className="p-5 text-sm text-muted-foreground">
                {items.length === 0 ? "No feedback yet." : "All feedback has been resolved."}
              </Text>
            ) : (
              open.map((item) => <FeedbackCard key={item.id} item={item} onToggle={() => toggle(item)} />)
            )}
          </Section>

          {resolved.length > 0 && (
            <Section title="Resolved" count={resolved.length}>
              {resolved.map((item) => (
                <FeedbackCard key={item.id} item={item} onToggle={() => toggle(item)} />
              ))}
            </Section>
          )}
        </>
      )}
    </Page>
  );
}

export default function AdminFeedbackScreen() {
  return (
    <AdminGate>
      <FeedbackList />
    </AdminGate>
  );
}
