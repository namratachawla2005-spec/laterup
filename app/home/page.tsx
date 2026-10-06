// TEMPORARY placeholder. Replaced by Page 2 (Home).
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Wordmark from "@/components/Wordmark";
import LogOutButton from "@/components/LogOutButton";

export default async function HomePlaceholder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, intake_completed")
    .eq("id", user.id)
    .single();

  // Not finished Page 1 yet: back to where she left off
  if (!profile?.intake_completed) redirect("/");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-8">
      <Wordmark />
      <h1 className="mt-10 text-3xl font-semibold">
        {profile.name ? `Hello, ${profile.name}` : "Hello"}
      </h1>
      <p className="mt-2 text-text-muted">Home is being built next.</p>
      <LogOutButton className="mt-8 rounded-card border-2 border-primary px-6 font-semibold text-primary" />
    </main>
  );
}
