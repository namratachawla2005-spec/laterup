"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EmailField, PasswordField, SubmitButton, FormMessage } from "@/components/AuthFields";

// Turn Supabase errors into short, human messages. Never show technical text.
function friendlyError(message: string, code?: string): string {
  if (/signups_full|database error/i.test(message)) {
    return "LaterUp is in private preview, signups are currently full.";
  }
  if (code === "user_already_exists" || /already registered/i.test(message)) {
    return "This email already has an account. Try logging in instead.";
  }
  if (code === "weak_password" || /password/i.test(message)) {
    return "Please choose a password with at least 8 characters.";
  }
  if (/email/i.test(message)) {
    return "That email doesn't look quite right. Please check it.";
  }
  if (/fetch|network/i.test(message)) {
    return "We couldn't reach LaterUp just now. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Please choose a password with at least 8 characters.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error || !data.session) {
      setError(friendlyError(error?.message ?? "", error?.code));
      setBusy(false);
      return;
    }

    // Logged in straight away (email confirmation is off). Next: promises and intake.
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} isNew />
      <FormMessage text={error} />
      <SubmitButton busy={busy} label="Create my account" />

      <p className="text-center">
        <Link href="/login" className="inline-flex min-h-tap items-center px-2 font-medium text-primary underline underline-offset-4">
          I already have an account
        </Link>
      </p>
    </form>
  );
}
