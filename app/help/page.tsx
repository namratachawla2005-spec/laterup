/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Help: a public page (no login needed): what LaterUp is, how each page works, tips.
// Emergency numbers live on the SOS page (/sos), linked at the top.
import type { Metadata } from "next";
import Link from "next/link";
import WellnessNote from "@/components/WellnessNote";
import MotifBackground, { HeadingWaves } from "@/components/MotifBackground";
import { BackIcon, HomeIcon, TalkIcon, PatternsIcon, DoctorIcon, GearIcon } from "@/components/icons";
import { AlertIcon } from "@/components/FloatingButtons";
import HomeWoman, { type Scene } from "@/components/HomeWoman";

export const metadata: Metadata = { title: "LaterUp help" };

// Terms of use for this prototype (plain language)
const TERMS = [
  "LaterUp shares general wellness information. It is not a doctor, does not diagnose, and does not replace advice, diagnosis or treatment from a qualified doctor.",
  "Answers on Talk are written by AI. They can be incomplete or wrong. Please check with a doctor before making any health decision, and never ignore or delay medical advice because of something you read here.",
  "In an emergency, call 112. Please don't rely on LaterUp.",
  "LaterUp is for adults aged 18 and over.",
  "Please use LaterUp with your own judgement. As this is a prototype, its maker can't take responsibility for decisions made using it.",
  "Features may change or stop at any time.",
];

// Asha through the day on Home (same times as the greeting)
const ASHA_DAY: [Scene, string, string][] = [
  ["chai", "Morning", "Sipping her chai"],
  ["reading", "Afternoon", "Reading a book"],
  ["music", "Evening", "Listening to music"],
  ["night", "Late night", "Fast asleep"],
];

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

        {/* Meet Asha, the woman drawn across LaterUp */}
        <section className="mt-10" aria-labelledby="asha-heading">
          <h2 id="asha-heading" className={sectionHeading}>Meet Asha</h2>
          <p className="mt-3">
            The woman you see across LaterUp is Asha. Her name means hope. On Home, she changes with your day, just
            like you.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ASHA_DAY.map(([scene, time, doing]) => (
              <li key={scene} className="flex flex-col items-center rounded-card bg-surface p-3 text-center">
                <HomeWoman scene={scene} className="h-24 w-24" />
                <span className="mt-2 font-semibold">{time}</span>
                <span className="text-helper text-text-muted">{doing}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            You&apos;ll find her on the other pages too: greeting you with a namaste on the first page, thinking on
            Talk, among butterflies on Patterns, and talking with her doctor on Doctor Prep.
          </p>
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

        {/* Terms of use and copyright for this prototype (linked from the consent tick) */}
        <section id="terms" className="mt-10 scroll-mt-6" aria-labelledby="terms-heading">
          <h2 id="terms-heading" className={sectionHeading}>Terms of use and copyright</h2>
          <p className="mt-3 rounded-card border-2 border-accent/40 bg-surface p-4 font-medium">
            LaterUp is a prototype, built only for demo and evaluation. It is not for real-world use.
          </p>
          <ul className="mt-4 space-y-2">
            {TERMS.map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            LaterUp is the original work of Namrata Chawla, shared for evaluation and as part of her portfolio. You
            are welcome to try it and share feedback.
          </p>
          <p className="mt-3">
            Please don&apos;t copy, reuse or share its design, content or code without written permission.
          </p>
          <p className="mt-3">
            Questions about use or licensing:{" "}
            <a href="mailto:namrata.chawla.2005@gmail.com" className="font-medium text-primary underline underline-offset-4 [overflow-wrap:anywhere]">
              namrata.chawla.2005@gmail.com
            </a>
          </p>
        </section>

        <div className="mt-auto pt-12">
          <WellnessNote withEmergency />
        </div>
      </main>
    </MotifBackground>
  );
}
