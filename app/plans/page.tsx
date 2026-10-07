/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Plans: a public page showing pricing only (no login, no payments).
import type { Metadata } from "next";
import Link from "next/link";
import WellnessNote from "@/components/WellnessNote";
import MotifBackground from "@/components/MotifBackground";
import { BackIcon } from "@/components/icons";

export const metadata: Metadata = { title: "LaterUp plans" };

type Plan = {
  name: string;
  price?: string;
  priceNote?: string; // always given with a price
  features: string[];
  label?: string; // quiet label instead of a button
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    priceNote: "always",
    features: [
      "Ask questions on Talk (a few each day)",
      "Daily check-ins",
      "Emergency help, always free",
      "Patterns and Doctor Prep",
      "Track the small things you try, and see what seems to help",
      "Words to start the conversation with your doctor, in English or Hindi",
    ],
  },
  {
    name: "LaterUp Plus",
    price: "₹299",
    priceNote: "per month, or ₹2,499 per year",
    features: [
      "A higher daily limit for questions on Talk",
      "4-week programmes for sleep, hot flashes and mood, built around your day",
      "Guided yoga, breathing and sleep sessions",
      "Monthly live Q&A sessions with gynaecologists",
      "Private chat with a certified menopause coach",
      "Book a visit with a partner gynaecologist, with your Doctor Prep summary sent ahead",
    ],
    label: "Coming soon",
    highlight: true,
  },
  {
    name: "For workplaces and clinics",
    features: [
      "Offer LaterUp Plus free to employees or patients",
      "Menopause awareness sessions for your team, run with gynaecologists",
      "Private by design: employers and clinics never see anyone's personal data",
    ],
    label: "Contact us",
  },
];

export default function PlansPage() {
  return (
    <MotifBackground>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 pt-4 pb-10">
        <Link href="/" className="-ml-2 inline-flex min-h-tap items-center gap-1 self-start rounded-card-sm px-2 font-medium text-text-muted">
          <BackIcon /> Back
        </Link>

        <h1 className="mt-6 text-center text-[1.75rem] font-semibold tracking-tight">Plans</h1>
        <p className="mx-auto mt-2 max-w-md text-center text-text-muted">
          LaterUp is free during our early preview. Paid plans are coming soon.
        </p>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <li
              key={plan.name}
              className={`flex flex-col rounded-card bg-surface p-6 ${plan.highlight ? "border-2 border-primary" : ""}`}
            >
              <h2 className="text-xl font-semibold text-accent">{plan.name}</h2>
              {plan.price && (
                <p className="mt-2">
                  <span className="text-[1.75rem] font-semibold">{plan.price}</span>
                  <span className="ml-1 text-text-muted">{plan.priceNote}</span>
                </p>
              )}
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {plan.label && (
                <p className="mt-6 self-start rounded-full border border-primary/40 px-4 py-1 text-helper font-medium text-primary">
                  {plan.label}
                </p>
              )}
            </li>
          ))}
        </ul>

        {/* centred under the cards, clear of the corner leaf */}
        <div className="mt-auto pt-16 text-center">
          <WellnessNote />
        </div>
      </main>
    </MotifBackground>
  );
}
