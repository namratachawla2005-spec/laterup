"use client";

// Sends a password reset link. Always shows the same message, so this page
// can't be used to find out whether someone has an account.
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EmailField, SubmitButton, FormMessage } from "@/components/AuthFields";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error && (error.status === 429 || /rate limit/i.test(error.message))) {
      setError("Please wait a few minutes before asking for another link.");
      return;
    }
    if (error && /fetch|network/i.test(error.message)) {
      setError("We couldn't reach LaterUp just now. Please check your connection and try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="space-y-6">
        <p className="rounded-card bg-surface p-5">
          If an account exists for <strong>{email.trim()}</strong>, we&apos;ve sent a link to set a new password.
          It may take a minute to arrive. Please check your spam folder too.
        </p>
        <Link href="/login" className="flex min-h-tap items-center justify-center rounded-card border-2 border-primary px-6 font-semibold text-primary">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EmailField value={email} onChange={setEmail} />
      <FormMessage text={error} />
      <SubmitButton busy={busy} label="Send reset link" />
      <p className="text-center">
        <Link href="/login" className="inline-flex min-h-tap items-center px-2 font-medium text-primary underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
