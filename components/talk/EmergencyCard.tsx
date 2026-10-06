// Emergency Card (docs/pages/03-talk.md, Section 5, Level 1).
// Shown INSTEAD of an answer. The message is never sent to the AI and never saved.
// Calm design: clay rose border, cream background, no flashing red.
import Link from "next/link";

const callPrimary = "flex min-h-tap w-full items-center justify-center rounded-card bg-primary px-6 font-semibold text-white";
const callSecondary = "flex min-h-tap w-full items-center justify-center rounded-card border-2 border-primary px-6 font-semibold text-primary";

export default function EmergencyCard({ kind }: { kind: "physical" | "self_harm" }) {
  return (
    <section
      role="alert"
      aria-labelledby="emergency-heading"
      className="rounded-card border-2 border-gentle bg-background p-6"
    >
      {kind === "physical" ? (
        <>
          <h2 id="emergency-heading" className="text-2xl font-semibold leading-tight">
            Please get help right now.
          </h2>
          <p className="mt-3">
            What you&apos;re describing needs a doctor urgently. Please call <strong>112</strong> or go to the
            nearest hospital. If you can, ask someone at home to stay with you.
          </p>
          <div className="mt-6 space-y-3">
            <a href="tel:112" className={callPrimary}>Call 112</a>
          </div>
        </>
      ) : (
        <>
          <h2 id="emergency-heading" className="text-2xl font-semibold leading-tight">
            You matter, and you don&apos;t have to carry this alone.
          </h2>
          <p className="mt-3">
            It sounds like you&apos;re going through something very painful. Please talk to someone right now.
          </p>
          <p className="mt-4">
            <strong>Tele-MANAS</strong> (free, 24x7, government mental health helpline): <strong>14416</strong>
          </p>
          <p className="mt-1">
            <strong>Emergency:</strong> <strong>112</strong>
          </p>
          <p className="mt-4">If you can, tell someone you trust at home how you&apos;re feeling.</p>
          <div className="mt-6 space-y-3">
            <a href="tel:14416" className={callPrimary}>Call 14416</a>
            <a href="tel:112" className={callSecondary}>Call 112</a>
          </div>
        </>
      )}
      <Link
        href="/home"
        className="mt-4 flex min-h-tap w-full items-center justify-center rounded-card px-6 font-medium text-text-muted underline underline-offset-4"
      >
        I&apos;m safe, go back
      </Link>
    </section>
  );
}
