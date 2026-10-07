// Page 5: Doctor Prep (docs/pages/05-doctor-prep.md)
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DoctorView from "./DoctorView";
import type { Feedback } from "@/lib/patterns";
import type { Prep } from "@/lib/doctor";

export default async function DoctorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("age_group, stage_answer, top_symptoms, diet, doctor_status, intake_completed")
    .eq("id", user.id)
    .single();
  if (!profile?.intake_completed) redirect("/");

  // A little more than 30 days, so "last 30 days" works in her own time zone
  const since = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 32))
    .toISOString()
    .slice(0, 10);

  const [checkIns, firstCheckIn, conversations, trying, feedback, notes, prep] = await Promise.all([
    supabase.from("check_ins").select("date, feeling, bothering, sleep, energy").gte("date", since).order("date"),
    supabase.from("check_ins").select("date").order("date").limit(1),
    supabase.from("conversations").select("started_at, symptom_tags").gte("started_at", since),
    supabase.from("trying").select("id, action, for_symptom, started_date, active").order("created_at"),
    supabase.from("trying_feedback").select("trying_id, date, answer").order("date"),
    supabase
      .from("doctor_notes")
      .select("id, date, her_words, symptom_tags, see_doctor_soon")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("doctor_prep").select("include, excluded_note_ids, anything_else, questions, after_visit_notes").maybeSingle(),
  ]);

  const saved: Prep = {
    include: prep.data?.include ?? {}, // defaults are filled in on the page
    excluded_note_ids: prep.data?.excluded_note_ids ?? [],
    anything_else: prep.data?.anything_else ?? "",
    questions: prep.data?.questions ?? [],
    after_visit_notes: prep.data?.after_visit_notes ?? [],
  };

  return (
    <DoctorView
      userId={user.id}
      profile={{
        age_group: profile.age_group,
        stage_answer: profile.stage_answer,
        top_symptoms: profile.top_symptoms ?? [],
        diet: profile.diet,
        doctor_status: profile.doctor_status,
      }}
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
      firstCheckIn={firstCheckIn.data?.[0]?.date ?? null}
      notes={notes.data ?? []}
      prep={saved}
    />
  );
}
