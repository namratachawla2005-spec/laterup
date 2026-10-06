import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/server";
import SignupForm from "./SignupForm";

const SIGNUPS_FULL = "LaterUp is in private preview, signups are currently full.";

export default async function SignupPage() {
  // Check the signup cap before showing the form (BUILD-SPEC section 4)
  const supabase = await createClient();
  const { data: open, error } = await supabase.rpc("signups_open");

  // If the check itself fails, show the form anyway: the database still enforces the cap
  if (!error && open === false) {
    return (
      <AuthShell heading="Signups are full for now">
        <p>{SIGNUPS_FULL}</p>
        <Link
          href="/login"
          className="mt-8 flex min-h-tap items-center justify-center rounded-card border-2 border-primary px-6 font-semibold text-primary"
        >
          I already have an account
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      heading="Create your private space"
      subline="Just an email and a password. Nothing else."
    >
      <SignupForm />
    </AuthShell>
  );
}
