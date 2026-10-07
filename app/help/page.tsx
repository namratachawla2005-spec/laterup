// Help: a public page (no login needed): what LaterUp is, how each page works, tips.
// Emergency numbers live on the SOS page (/sos), linked at the top.
import type { Metadata } from "next";
import Link from "next/link";
import WellnessNote from "@/components/WellnessNote";
import MotifBackground, { HeadingWaves } from "@/components/MotifBackground";
import { BackIcon, HomeIcon, TalkIcon, PatternsIcon, DoctorIcon, GearIcon } from "@/components/icons";
import { AlertIcon } from "@/components/FloatingButtons";

export const metadata: Metadata = { title: "LaterUp help" };

const PAGES = [
  {
    name: "Home",
    Icon: HomeIcon,
    lead: "Your starting point each day.",
    steps: [
      "Type what's on your mind and tap Help me understand, or tap a suggested question.",
      "Check in with one tap: Good, Okay or Tough. You can add how you slept, your energy and what's bothering you.",
      "If you're trying something, tell us whether it helped.",
    ],
  },
  {
    name: "Talk",
    Icon: TalkIcon,
    lead: "Ask anything, in your own words.",
    steps: [
      "You get one short, warm answer: what may be happening, one small thing to try, and when to talk to a doctor.",
      "Tap I'll try this to keep track of whether it helps you.",
      "Tap Add to my doctor notes to save it for your doctor. Past conversations are under Recent.",
    ],
  },
  {
    name: "Patterns",
    Icon: PatternsIcon,
    lead: "See how your days have been.",
    steps: [
      "Built from your check-ins: good, okay and tough days, sleep and energy.",
      "After about a week, you'll see what seems to help and what's been bothering you.",
      "Tap See an example to see how it looks.",
    ],
  },
  {
    name: "Doctor Prep",
    Icon: DoctorIcon,
    lead: "Get ready for a doctor visit.",
    steps: [
      "A one-page summary of your check-ins and notes, in your own words. You choose what's included.",
      "Questions to ask, and a sentence to start the conversation, in English or Hindi.",
      "Show it on your phone, print it, or share it.",
    ],
  },
  {
    name: "Settings",
    Icon: GearIcon,
    lead: "Tap the gear on Home.",
    steps: ["See your profile, edit your answers, change your password, make the text larger, or delete your data."],
  },
];

const sectionHeading = "text-xl font-semibold text-accent";

export default function HelpPage() {
  return (
    <MotifBackground motif="waves">
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pt-4 pb-10">
        <Link href="/" className="-ml-2 inline-flex min-h-tap items-center gap-1 self-start rounded-card-sm px-2 font-medium text-text-muted">
          <BackIcon /> Back
        </Link>

        <div className="mt-4 flex items-center gap-6">
          <h1 className="text-[1.75rem] font-semibold">Help</h1>
          <HeadingWaves />
        </div>
        <p className="mt-1 text-text-muted">How LaterUp works, page by page.</p>

        <Link href="/sos" className="mt-6 flex min-h-tap items-center gap-2 rounded-card border-2 border-accent px-4 py-2 font-semibold text-accent">
          <AlertIcon className="h-6 w-6" />
          In an emergency? See emergency numbers (SOS)
        </Link>

        {/* What LaterUp is */}
        <section className="mt-10" aria-labelledby="what-heading">
          <h2 id="what-heading" className={sectionHeading}>What is LaterUp?</h2>
          <p className="mt-3">
            LaterUp is a private companion for the years before, during and after menopause. It helps you understand what
            you&apos;re feeling, try small things that might help, notice what works for you, and feel ready to talk to a
            doctor.
          </p>
          <p className="mt-3">It is not a doctor. It does not diagnose, and it never suggests medicines.</p>
        </section>

        {/* How each page works */}
        <section className="mt-10" aria-labelledby="pages-heading">
          <h2 id="pages-heading" className={sectionHeading}>How each page works</h2>
          <p className="mt-1 text-helper text-text-muted">Use the bar at the bottom of the screen to move between pages.</p>
          <ul className="mt-4 space-y-4">
            {PAGES.map(({ name, Icon, lead, steps }) => (
              <li key={name} className="rounded-card bg-surface p-5">
                <h3 className="flex items-center gap-3 text-lg font-semibold">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  {name}
                </h3>
                <p className="mt-2 font-medium">{lead}</p>
                <ul className="mt-2 space-y-2">
                  {steps.map((s) => (
                    <li key={s} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        {/* Good to know */}
        <section className="mt-10" aria-labelledby="tips-heading">
          <h2 id="tips-heading" className={sectionHeading}>Good to know</h2>
          <ul className="mt-3 space-y-2">
            {[
              "Only you can see your information. We never sell or share it.",
              "Want bigger text? Go to Settings, then Text size, and tap Larger.",
              "Forgot your password? Password reset by email is coming soon.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-auto pt-12">
          <WellnessNote withEmergency />
        </div>
      </main>
    </MotifBackground>
  );
}
