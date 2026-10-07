"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearSession, useIsBrowser } from "@/lib/local";
import { readTextSize, saveTextSize, type TextSize } from "@/lib/textSize";
import { AGE_GROUPS, labelFor, type Profile } from "@/lib/intake";
import IntakeFlow from "@/components/intake/IntakeFlow";
import ProtectPanel from "@/components/intake/ProtectPanel";
import LogOutButton from "@/components/LogOutButton";
import WellnessNote from "@/components/WellnessNote";
import MotifBackground, { HeadingWaves } from "@/components/MotifBackground";
import { FormMessage, PasswordField, SubmitButton } from "@/components/AuthFields";
import { BackIcon } from "@/components/icons";

const rowClass = "flex w-full items-center rounded-card-sm bg-surface px-5 text-left font-medium";

export default function SettingsView({ profile, email, memberSince }: { profile: Profile; email: string; memberSince: string }) {
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
    <MotifBackground motif="waves">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-4 pb-10">
        <Link href="/home" className="-ml-2 inline-flex min-h-tap items-center gap-1 self-start rounded-card-sm px-2 font-medium text-text-muted">
          <BackIcon />
          Home
        </Link>

        <div className="mt-4 flex items-center gap-6">
          <h1 className="text-[1.75rem] font-semibold">Settings</h1>
          <HeadingWaves />
        </div>

        {notice && (
          <p role="status" className="mt-4 rounded-card-sm bg-surface px-4 py-3">
            {notice}
          </p>
        )}

        {/* My profile: only what she already gave us (no new data) */}
        <section className="mt-6" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="font-semibold">My profile</h2>
          <dl className="mt-3 divide-y divide-text/10 rounded-card border-2 border-surface px-5">
            {[
              ["Name", profile.name || "Not set"],
              ["Email", email],
              ["Age group", profile.age_group ? labelFor(AGE_GROUPS, profile.age_group) : "Not set"],
              ["Member since", new Date(memberSince).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-x-4 py-3">
                <dt className="text-text-muted">{label}</dt>
                <dd className="min-w-0 text-right font-medium [overflow-wrap:anywhere]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-3 space-y-3">
          <button type="button" onClick={() => setEditing(true)} className={`${rowClass} flex-col items-start py-3`}>
            Edit my answers
            <span className="text-helper font-normal text-text-muted">Your name, age group, what&apos;s bothering you, and more</span>
          </button>
          <ChangePassword onChanged={() => setNotice("Your password has been changed.")} />
        </div>

        <TextSizeChoice />

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
    </MotifBackground>
  );
}

// "Change password": opens in place (no pop-up). Checks her current password first.
function ChangePassword({ onChanged }: { onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function close() {
    setOpen(false);
    setCurrent("");
    setNext("");
    setError("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next === current) {
      setError("Please choose a new password that's different from your current one.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    // Make sure it's really her: her current password must be right
    const { error: wrong } = await supabase.auth.signInWithPassword({ email: data.user?.email ?? "", password: current });
    if (wrong) {
      setBusy(false);
      setError(/fetch|network/i.test(wrong.message)
        ? "We couldn't reach LaterUp just now. Please check your connection and try again."
        : "That current password isn't right. Please try again.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) {
      setError(error.code === "weak_password"
        ? "Please choose a longer password, at least 8 characters."
        : "Something went wrong. Please try again.");
      return;
    }
    close();
    onChanged();
    window.scrollTo(0, 0);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={rowClass}>
        Change password
      </button>
    );
  }

  return (
    <form onSubmit={save} className="space-y-5 rounded-card border-2 border-surface p-5" aria-labelledby="change-password-heading">
      <h2 id="change-password-heading" className="font-semibold">Change password</h2>
      <PasswordField id="current-password" label="Current password" value={current} onChange={setCurrent} isNew={false} />
      <PasswordField id="new-password" label="New password" value={next} onChange={setNext} isNew />
      <FormMessage text={error} />
      <SubmitButton busy={busy} label="Save new password" />
      <button type="button" onClick={close} disabled={busy} className="w-full rounded-card border-2 border-primary px-6 font-semibold text-primary">
        Cancel
      </button>
    </form>
  );
}

// "Text size": Standard or Larger, remembered on this device
function TextSizeChoice() {
  const isBrowser = useIsBrowser();
  return isBrowser ? <TextSizeButtons /> : null;
}

function TextSizeButtons() {
  const [size, setSize] = useState<TextSize>(readTextSize);
  const choose = (s: TextSize) => {
    setSize(s);
    saveTextSize(s);
  };
  return (
    <section className="mt-8" aria-labelledby="text-size-heading">
      <h2 id="text-size-heading" className="font-semibold">Text size</h2>
      <div role="group" aria-labelledby="text-size-heading" className="mt-3 inline-flex rounded-card bg-surface p-1">
        {(["standard", "larger"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={size === s}
            onClick={() => choose(s)}
            className={`rounded-card-sm px-5 font-medium ${size === s ? "bg-primary text-white" : "text-text"}`}
          >
            {s === "standard" ? "Standard" : "Larger"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-helper text-text-muted">Saved on this device.</p>
    </section>
  );
}
