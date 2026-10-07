/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Page 3: Talk, the hero (docs/pages/03-talk.md)
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TalkView, { type RecentConversation } from "./TalkView";

export default async function TalkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, top_symptoms, diet, stage, age_group, doctor_status, intake_completed")
    .eq("id", user.id)
    .single();
  if (!profile?.intake_completed) redirect("/");

  // Recent: her last 5 conversations, each with its first line
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, started_at")
    .order("started_at", { ascending: false })
    .limit(5);

  let recent: RecentConversation[] = [];
  if (convs?.length) {
    const { data: firstLines } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", convs.map((c) => c.id))
      .eq("role", "user")
      .order("created_at", { ascending: true });
    recent = convs
      .map((c) => ({
        id: c.id,
        startedAt: c.started_at,
        firstLine: (firstLines?.find((m) => m.conversation_id === c.id)?.content as { text?: string })?.text ?? "",
      }))
      .filter((c) => c.firstLine);
  }

  return (
    <TalkView
      userId={user.id}
      profile={{
        name: profile.name,
        top_symptoms: profile.top_symptoms ?? [],
        diet: profile.diet,
        stage: profile.stage,
        age_group: profile.age_group,
        doctor_status: profile.doctor_status,
      }}
      recent={recent}
    />
  );
}
