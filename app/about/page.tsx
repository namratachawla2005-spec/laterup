// About LaterUp: a public page, no login needed (linked from Welcome).
// Thin-line decorations inspired by Indian architecture: an arch, a jaali band, a lotus.
import type { Metadata } from "next";
import Link from "next/link";
import WellnessNote from "@/components/WellnessNote";
import { BackIcon } from "@/components/icons";

export const metadata: Metadata = { title: "About LaterUp" };

const sectionHeading = "text-xl font-semibold text-accent";

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pt-4 pb-10">
      <Link href="/" className="-ml-2 inline-flex min-h-tap items-center gap-1 self-start rounded-card-sm px-2 font-medium text-text-muted">
        <BackIcon /> Back
      </Link>

      {/* Title framed by a pointed arch */}
      <div className="relative mx-auto mt-6 flex h-44 w-64 items-end justify-center pb-6">
        <Arch className="absolute inset-0 h-full w-full" />
        <h1 className="relative text-[1.75rem] font-semibold tracking-tight">About LaterUp</h1>
      </div>

      <section className="mt-12 space-y-3" aria-labelledby="why-heading">
        <h2 id="why-heading" className={sectionHeading}>Why we started</h2>
        <p>
          In India, menopause is rarely talked about, even at home. Many women go through these years quietly,
          without anyone to explain what is happening or what might help. We built LaterUp so every woman has a
          kind, reliable place to turn to, whenever she needs it.
        </p>
      </section>

      <Jaali className="mx-auto my-12 h-6 w-[216px]" />

      <section className="space-y-3" aria-labelledby="what-heading">
        <h2 id="what-heading" className={sectionHeading}>What LaterUp is and isn&apos;t</h2>
        <p>
          LaterUp helps you understand what your body is going through, find small things that help, and know
          when to see a doctor.
        </p>
        <p>
          It is not a doctor. It does not diagnose, and it never suggests medicines. It is made for Indian women,
          and can help you talk to your doctor in Hindi.
        </p>
      </section>

      <section className="mt-14 space-y-3" aria-labelledby="privacy-heading">
        <Lotus className="h-8 w-12" />
        <h2 id="privacy-heading" className={sectionHeading}>Your privacy promise</h2>
        <p>
          Your information is yours. We never sell or share it, and only you can see it. You can delete
          everything, anytime, from Settings.
        </p>
      </section>

      <div className="mt-auto pt-16">
        <WellnessNote />
      </div>
    </main>
  );
}

// ---------------- Decorations: thin terracotta lines, hidden from screen readers ----------------
// Each drawing sets its line style once; the shapes inside inherit it.
const lineStyle = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

// A Mughal-style pointed arch, with a finer arch inside it
function Arch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 176" {...lineStyle} className={`text-accent ${className}`}>
      <path d="M6 176 V78 C6 46 46 26 92 16 C112 12 124 6 128 2 C132 6 144 12 164 16 C210 26 250 46 250 78 V176" strokeWidth="1.5" />
      <g strokeWidth="1" opacity=".45">
        <path d="M18 176 V82 C18 54 54 37 96 28 C114 24 124 19 128 15 C132 19 142 24 160 28 C202 37 238 54 238 82 V176" />
        <line x1="0" y1="175" x2="256" y2="175" />
      </g>
    </svg>
  );
}

// A jaali band: a row of touching circles, each with a small diamond at its centre
function Jaali({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 216 24" {...lineStyle} className={`text-accent ${className}`}>
      <defs>
        <pattern id="jaali" width="24" height="24" patternUnits="userSpaceOnUse">
          <g strokeWidth="0.9" opacity=".55">
            <circle cx="12" cy="12" r="12" />
            <path d="M12 8 L16 12 L12 16 L8 12 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#jaali)" stroke="none" />
    </svg>
  );
}

// A small lotus
function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" {...lineStyle} strokeWidth="1.4" className={`text-accent ${className}`}>
      <path d="M24 4 C30 11 30 21 24 28 C18 21 18 11 24 4 Z" />
      <path d="M24 28 C21 19 15 13 8 11 C8 20 14 27 24 28 Z" />
      <path d="M24 28 C27 19 33 13 40 11 C40 20 34 27 24 28 Z" />
      <path d="M24 28 C16 27 8 24 2 19 M24 28 C32 27 40 24 46 19" opacity=".6" />
      <line x1="10" y1="31" x2="38" y2="31" opacity=".45" />
    </svg>
  );
}
