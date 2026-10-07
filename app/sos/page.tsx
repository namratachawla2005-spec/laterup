/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// SOS: emergency numbers and government websites, nothing else, so it's instant in a crisis.
// Public page (no login needed). Numbers and websites checked 7 Oct 2026 against
// official / reliable sources (112.gov.in, telemanas.mohfw.gov.in, myscheme.gov.in, mea.gov.in, Vikaspedia).
import type { Metadata } from "next";
import Link from "next/link";
import WellnessNote from "@/components/WellnessNote";
import MotifBackground, { HeadingWaves } from "@/components/MotifBackground";
import { BackIcon } from "@/components/icons";
import { AlertIcon } from "@/components/FloatingButtons";

export const metadata: Metadata = { title: "LaterUp SOS" };

const PHONES = [
  { number: "112", call: "112", name: "Any emergency", detail: "Police, ambulance or fire. Free, 24 hours." },
  { number: "108", call: "108", name: "Ambulance", detail: "Medical emergency, in many states." },
  { number: "14416", call: "14416", name: "Tele-MANAS", detail: "Toll-free mental health support, 24 hours, in many Indian languages. Also 1800-891-4416." },
  { number: "181", call: "181", name: "Women Helpline", detail: "Toll-free, for women in distress, 24 hours." },
  { number: "7827170170", call: "+917827170170", name: "National Commission for Women", detail: "Helpline for women facing violence or stress, 24 hours." },
  { number: "14567", call: "14567", name: "Elderline", detail: "Toll-free help for parents and in-laws who are senior citizens. 8 am to 8 pm, every day." },
];

const WEBSITES = [
  { href: "https://telemanas.mohfw.gov.in/home", name: "Tele-MANAS", detail: "Government mental health support" },
  { href: "https://esanjeevani.mohfw.gov.in", name: "eSanjeevani", detail: "Free online doctor consultation from the Government of India, including gynaecology" },
  { href: "https://www.ncwwomenhelpline.in", name: "NCW Women Helpline", detail: "National Commission for Women" },
  { href: "https://112.gov.in", name: "112 India", detail: "Emergency Response Support System" },
];

export default function SosPage() {
  return (
    <MotifBackground motif="waves">
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pt-4 pb-10">
        <Link href="/" className="-ml-2 inline-flex min-h-tap items-center gap-1 self-start rounded-card-sm px-2 font-medium text-text-muted">
          <BackIcon /> Back
        </Link>

        <h1 className="mt-4 flex items-center gap-2 text-[1.75rem] font-semibold">
          <AlertIcon className="h-8 w-8 text-accent" />
          Need help right now?
        </h1>
        <p className="mt-1 text-text-muted">Tap a number to call. You don&apos;t have to go through this alone.</p>

        <ul className="mt-6 space-y-3">
          {PHONES.map((p) => (
            <li key={p.number}>
              <a href={`tel:${p.call}`} className="block rounded-card border-l-4 border-accent bg-surface p-4">
                <span className="block font-semibold">{p.name}</span>
                <span className="block text-2xl font-semibold text-accent">{p.number}</span>
                <span className="block text-helper text-text-muted">{p.detail}</span>
              </a>
            </li>
          ))}
        </ul>

        <section className="mt-10" aria-labelledby="sites-heading">
          <div className="flex items-center gap-6">
            <h2 id="sites-heading" className="text-xl font-semibold text-accent">Government websites</h2>
            <HeadingWaves />
          </div>
          <ul className="mt-3 space-y-2">
            {WEBSITES.map((w) => (
              <li key={w.href}>
                <a href={w.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-tap flex-col justify-center">
                  <span className="font-medium text-primary underline underline-offset-4">{w.name}</span>
                  <span className="text-helper text-text-muted">{w.detail}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-helper text-text-muted">These are services run by the Government of India. LaterUp is not connected to them.</p>
        </section>

        <div className="mt-auto pt-12">
          <WellnessNote withEmergency />
        </div>
      </main>
    </MotifBackground>
  );
}
