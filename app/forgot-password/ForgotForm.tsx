/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
"use client";

// Password reset by email is planned but not switched on yet (no email service
// connected), so this shows the form greyed out with an honest "Coming soon".
// When email is set up: call supabase.auth.resetPasswordForEmail(email,
// { redirectTo: origin + "/reset-password" }); /reset-password already handles the link.
import Link from "next/link";

const inputClass = "w-full rounded-card-sm border-2 border-transparent bg-surface px-4 text-body text-text-muted";

export default function ForgotForm() {
  return (
    <div className="space-y-6">
      <p role="note" className="rounded-card bg-surface p-5">
        Password reset by email is coming soon. If you can&apos;t log in for now, you can create a new account with a
        different email.
      </p>

      <div>
        <label htmlFor="email" className="block font-medium text-text-muted">
          Email
        </label>
        <input id="email" type="email" disabled className={`mt-2 ${inputClass}`} />
      </div>
      <button type="button" disabled className="w-full rounded-card border-2 border-primary/40 px-6 font-semibold text-primary/70">
        Coming soon
      </button>

      <div className="flex flex-col items-center">
        <Link href="/login" className="inline-flex min-h-tap items-center px-2 font-medium text-primary underline underline-offset-4">
          Back to log in
        </Link>
        <Link href="/signup" className="inline-flex min-h-tap items-center px-2 font-medium text-primary underline underline-offset-4">
          Create a new account
        </Link>
      </div>
    </div>
  );
}
