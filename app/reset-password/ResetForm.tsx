"use client";

// Opened from the reset email. The link carries a one-time code (token_hash),
// which works on any device, not only the one that asked for the email.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordField, SubmitButton, FormMessage } from "@/components/AuthFields";

type Stage = "checking" | "ready" | "expired" | "done";

export default function ResetForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function check() {
      const tokenHash = new URLSearchParams(window.location.search).get("token_hash");
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
        // Keep the one-time code out of the address bar and browser history
        window.history.replaceState(null, "", "/reset-password");
        setStage(error ? "expired" : "ready");
        return;
      }
      // Page reloaded after the code was used: she's already signed in for the reset
      const { data } = await supabase.auth.getUser();
      setStage(data.user ? "ready" : "expired");
    }
    void check();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      if (error.code === "same_password") setError("That's the same as your old password. Please choose a new one.");
      else if (error.code === "weak_password") setError("Please choose a longer password, at least 8 characters.");
      else setError("Something went wrong. Please try again.");
      return;
    }
    setStage("done");
    setTimeout(() => {
      router.replace("/");
      router.refresh();
    }, 1500);
  }

  if (stage === "checking") return <p className="text-text-muted">Just a moment...</p>;

  if (stage === "expired") {
    return (
      <div className="space-y-6">
        <p>This link has expired or has already been used. Each link works once, for a short time.</p>
        <Link href="/forgot-password" className="flex min-h-tap items-center justify-center rounded-card bg-primary px-6 font-semibold text-white">
          Send a new link
        </Link>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <p role="status" className="rounded-card bg-surface p-5">
        Your password has been changed. Taking you back to LaterUp...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PasswordField value={password} onChange={setPassword} isNew label="New password" />
      <FormMessage text={error} />
      <SubmitButton busy={busy} label="Save new password" />
    </form>
  );
}
