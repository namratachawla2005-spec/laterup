// Page 4: Patterns (docs/pages/04-patterns.md)
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PatternsView from "./PatternsView";
import type { Feedback } from "@/lib/patterns";

export default async function PatternsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("intake_completed").eq("id", user.id).single();
  if (!profile?.intake_completed) redirect("/");

  // Enough history for "last 30 days" and the 30 days before it
  const since = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 62))
    .toISOString()
    .slice(0, 10);

  const [checkIns, conversations, trying, feedback] = await Promise.all([
    supabase.from("check_ins").select("date, feeling, bothering, sleep, energy").gte("date", since).order("date"),
    supabase.from("conversations").select("started_at, symptom_tags").gte("started_at", since),
    supabase.from("trying").select("id, action, for_symptom, started_date, active").order("created_at", { ascending: false }),
    supabase.from("trying_feedback").select("trying_id, date, answer").order("date"),
  ]);

  return (
    <PatternsView
      data={{
        checkIns: checkIns.data ?? [],
        // Dates are turned into her local dates in the browser
        conversations: (conversations.data ?? []).map((c) => ({ date: c.started_at, tags: c.symptom_tags ?? [] })),
        trying: (trying.data ?? []).map((t) => ({
          ...t,
          feedback: (feedback.data ?? [])
            .filter((f) => f.trying_id === t.id)
            .map((f) => ({ date: f.date, answer: f.answer as Feedback["answer"] })),
        })),
      }}
    />
  );
}
