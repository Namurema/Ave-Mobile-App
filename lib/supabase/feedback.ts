import { supabase } from './client';

export const FEEDBACK_KINDS = ['suggestion', 'translation', 'problem', 'other'] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export type Feedback = {
  id: string;
  created_at: string;
  user_id: string | null;
  kind: FeedbackKind;
  message: string;
  email: string | null;
  language: string | null;
  resolved: boolean;
};

// Sends feedback (table and rules: supabase/migrations/20261007_feedback.sql).
// No `.select()` afterwards: people who aren't the admin can't read feedback back.
export async function sendFeedback(input: {
  kind: FeedbackKind;
  message: string;
  email?: string;
  language: string;
  userId?: string;
}) {
  const { error } = await supabase.from('feedback').insert({
    kind: input.kind,
    message: input.message.trim(),
    email: input.email?.trim() || null,
    language: input.language,
    user_id: input.userId ?? null,
  });
  if (error) throw error;
}

// Admin only: all feedback, newest first
export async function getFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Admin only
export async function setFeedbackResolved(id: string, resolved: boolean) {
  const { error } = await supabase.from('feedback').update({ resolved }).eq('id', id);
  if (error) throw error;
}
