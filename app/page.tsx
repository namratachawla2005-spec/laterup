// TEMPORARY setup check. Replaced by Page 1 (Welcome and Intake).
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogOutButton from "@/components/LogOutButton";

const swatches = [
  { name: "background", className: "bg-background" },
  { name: "surface", className: "bg-surface" },
  { name: "accent", className: "bg-accent" },
  { name: "primary", className: "bg-primary" },
  { name: "gentle", className: "bg-gentle" },
  { name: "text", className: "bg-text" },
  { name: "text-muted", className: "bg-text-muted" },
];

export default async function SetupCheck() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
      <p className="text-2xl font-semibold text-accent">LaterUp</p>
      <h1 className="mt-4 text-3xl font-semibold">Setup check</h1>

      <section className="mt-6 rounded-card bg-surface p-4">
        <h2 className="font-semibold">Login test</h2>
        {user ? (
          <>
            <p className="mt-1">Logged in as {user.email}</p>
            <LogOutButton className="mt-3 rounded-card border-2 border-primary px-6 font-semibold text-primary" />
          </>
        ) : (
          <>
            <p className="mt-1">Not logged in.</p>
            <div className="mt-3 flex gap-3">
              <Link href="/signup" className="flex min-h-tap items-center rounded-card bg-primary px-6 font-semibold text-white">
                Sign up
              </Link>
              <Link href="/login" className="flex min-h-tap items-center rounded-card border-2 border-primary px-6 font-semibold text-primary">
                Log in
              </Link>
            </div>
          </>
        )}
      </section>

      <p className="mt-6">
        Body text is 18px DM Sans. This screen will be replaced by Page 1.
      </p>
      <p className="mt-1 text-helper text-text-muted">
        Helper text is 15px in the muted colour.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {swatches.map((s) => (
          <li key={s.name} className="rounded-card bg-surface p-3">
            <div
              className={`h-12 rounded-card-sm border border-text/10 ${s.className}`}
            />
            <p className="mt-2 text-helper">{s.name}</p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-helper text-text-muted">
        LaterUp is a wellness guide, not medical advice.
      </p>
    </main>
  );
}
