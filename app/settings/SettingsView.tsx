"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearSession } from "@/lib/local";
import type { Profile } from "@/lib/intake";
import IntakeFlow from "@/components/intake/IntakeFlow";
import ProtectPanel from "@/components/intake/ProtectPanel";
import LogOutButton from "@/components/LogOutButton";
import WellnessNote from "@/components/WellnessNote";
import { FormMessage } from "@/components/AuthFields";
import { BackIcon } from "@/components/icons";

const rowClass = "flex w-full items-center rounded-card-sm bg-surface px-5 text-left font-medium";

export default function SettingsView({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // "Edit my answers": the Page 1 questions, her answers already selected
  if (editing) {
    return (
      <IntakeFlow
        profile={profile}
        mode="edit"
        onExit={(saved) => {
          setEditing(false);
          setNotice(saved ? "Your answers are saved." : "");
          router.refresh();
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  async function deleteEverything() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!res.ok) throw new Error();
      await createClient().auth.signOut().catch(() => {});
      clearSession();
      router.replace("/");
      router.refresh();
    } catch {
      setDeleting(false);
      setError("We couldn't delete your data just now. Please try again.");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-4 pb-10">
      <Link href="/home" className="-ml-2 inline-flex min-h-tap items-center gap-1 self-start rounded-card-sm px-2 font-medium text-text-muted">
        <BackIcon />
        Home
      </Link>

      <h1 className="mt-4 text-[1.75rem] font-semibold">Settings</h1>

      {notice && (
        <p role="status" className="mt-4 rounded-card-sm bg-surface px-4 py-3">
          {notice}
        </p>
      )}

      <div className="mt-6 space-y-3">
        <button type="button" onClick={() => setEditing(true)} className={rowClass}>
          Edit my answers
        </button>
      </div>

      <div className="mt-6">
        <ProtectPanel />
      </div>

      <section className="mt-8" aria-labelledby="delete-heading">
        <h2 id="delete-heading" className="sr-only">Delete my data</h2>
        {!confirming ? (
          <button type="button" onClick={() => setConfirming(true)} className={rowClass}>
            Delete my data
          </button>
        ) : (
          <div className="rounded-card border-2 border-gentle p-5">
            <p role="alert">Are you sure? This will remove everything and can&apos;t be undone.</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={deleteEverything}
                disabled={deleting}
                className="w-full rounded-card bg-primary px-6 font-semibold text-white disabled:bg-surface disabled:text-text-muted"
              >
                {deleting ? "Deleting..." : "Yes, delete everything"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setError("");
                }}
                disabled={deleting}
                className="w-full rounded-card border-2 border-primary px-6 font-semibold text-primary"
              >
                Cancel
              </button>
            </div>
            {error && <div className="mt-3"><FormMessage text={error} /></div>}
          </div>
        )}
      </section>

      <div className="mt-3">
        <LogOutButton className={rowClass} />
      </div>

      <div className="mt-auto pt-12">
        <WellnessNote withEmergency />
      </div>
    </main>
  );
}
