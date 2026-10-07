/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Page 2: Home (docs/pages/02-home.md)
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomeView from "./HomeView";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, top_symptoms, intake_completed")
    .eq("id", user.id)
    .single();

  // Not finished Page 1 yet: back to where she left off
  if (!profile?.intake_completed) redirect("/");

  const [checkIns, conversations, trying] = await Promise.all([
    supabase.from("check_ins").select("date, feeling, bothering, bothering_other, sleep, energy").order("date", { ascending: false }).limit(3),
    supabase.from("conversations").select("id").limit(1),
    supabase
      .from("trying")
      .select("id, action, for_symptom, started_date")
      .eq("active", true)
      .order("created_at", { ascending: false }),
  ]);

  const tryingIds = (trying.data ?? []).map((t) => t.id);
  const feedback = tryingIds.length
    ? await supabase
        .from("trying_feedback")
        .select("trying_id, date, answer")
        .in("trying_id", tryingIds)
        .order("date", { ascending: false })
        .limit(20)
    : { data: [] };

  const hasHistory =
    (checkIns.data?.length ?? 0) > 0 ||
    (conversations.data?.length ?? 0) > 0 ||
    (trying.data?.length ?? 0) > 0;

  return (
    <HomeView
      userId={user.id}
      name={profile.name}
      topSymptoms={profile.top_symptoms ?? []}
      checkIns={checkIns.data ?? []}
      hasHistory={hasHistory}
      trying={trying.data ?? []}
      feedback={feedback.data ?? []}
    />
  );
}
