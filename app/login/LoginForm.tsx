/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EmailField, PasswordField, SubmitButton, FormMessage } from "@/components/AuthFields";

function friendlyError(message: string, code?: string): string {
  if (code === "invalid_credentials" || /invalid login/i.test(message)) {
    return "That email and password don't match. Please try again.";
  }
  if (/fetch|network/i.test(message)) {
    return "We couldn't reach LaterUp just now. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setError(friendlyError(error?.message ?? "", error?.code));
      setBusy(false);
      return;
    }

    // Intake done: go Home. Not done: back to intake, where she left off.
    const { data: profile } = await supabase
      .from("profiles")
      .select("intake_completed")
      .eq("id", data.user.id)
      .single();

    router.replace(profile?.intake_completed ? "/home" : "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EmailField value={email} onChange={setEmail} />
      <div>
        <PasswordField value={password} onChange={setPassword} isNew={false} />
        <Link href="/forgot-password" className="mt-1 inline-flex min-h-tap items-center px-1 text-helper font-medium text-primary underline underline-offset-4">
          Forgot your password?
        </Link>
      </div>
      <FormMessage text={error} />
      <SubmitButton busy={busy} label="Log in" />

      <p className="text-center">
        <Link href="/signup" className="inline-flex min-h-tap items-center px-2 font-medium text-primary underline underline-offset-4">
          New here? Create an account
        </Link>
      </p>
    </form>
  );
}
