// Page 1, Step 1: Welcome (logged out)
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import WellnessNote from "@/components/WellnessNote";
import RisingSun from "./RisingSun";
import ProtectPanel from "./ProtectPanel";

export default function Welcome() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pt-8 pb-10 text-center">
      <Wordmark />

      <RisingSun className="mt-10 w-56 max-w-full sm:w-64" />

      <h1 className="mt-8 text-[1.75rem] font-semibold leading-tight tracking-tight text-balance sm:text-[1.875rem]">
        Midlife is a new chapter. You don&apos;t have to figure it out alone.
      </h1>

      <p className="mt-4 text-text-muted">
        LaterUp helps you understand what your body is going through, find small things
        that help, and know when to see a doctor.
        <span className="mt-2 block">For women in the years before, during and after menopause.</span>
      </p>

      <p className="mt-6 inline-flex items-center gap-2 text-helper">
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 shrink-0 text-accent">
          <rect x="4" y="9" width="12" height="8.5" rx="2" fill="currentColor" />
          <path d="M6.75 9V6.5a3.25 3.25 0 0 1 6.5 0V9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        Private by design. Your words stay yours.
      </p>

      <div className="mt-8 w-full space-y-3">
        <Link
          href="/signup"
          className="flex min-h-tap w-full items-center justify-center rounded-card bg-primary px-6 font-semibold text-white"
        >
          Let&apos;s begin
        </Link>
        <Link
          href="/login"
          className="flex min-h-tap w-full items-center justify-center rounded-card border-2 border-primary/40 px-6 font-semibold text-primary"
        >
          I already have an account
        </Link>
      </div>

      <div className="mt-6 w-full">
        <ProtectPanel />
      </div>

      <div className="mt-auto pt-12">
        <WellnessNote withEmergency />
      </div>
    </main>
  );
}
