// Page 1: Welcome and Intake (docs/pages/01-welcome-intake.md)
// Logged out -> Welcome. Logged in -> promises and questions, resuming where she stopped.
// Intake already finished -> straight to Home.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Welcome from "@/components/intake/Welcome";
import IntakeFlow from "@/components/intake/IntakeFlow";
import type { Profile } from "@/lib/intake";

export default async function Page1() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <Welcome />;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (profile?.intake_completed) redirect("/home");

  // Profile row is created at sign-up; fall back to an empty one just in case
  return (
    <IntakeFlow
      profile={
        profile ?? {
          id: user.id, name: null, age_group: null, stage: null, stage_answer: null,
          top_symptoms: [], diet: null, life_context: [], doctor_status: null,
          consent_given: false, consent_date: null, intake_step: 0, intake_completed: false,
        }
      }
    />
  );
}
