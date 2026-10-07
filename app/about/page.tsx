// About LaterUp: a public page, no login needed (linked from Welcome).
// Thin-line decorations: a sunrise over the title (the LaterUp motif), jaali bands
// between sections, and faint leaves in the background (MotifBackground).
import type { Metadata } from "next";
import Link from "next/link";
import WellnessNote from "@/components/WellnessNote";
import { BackIcon } from "@/components/icons";
import MotifBackground from "@/components/MotifBackground";

export const metadata: Metadata = { title: "About LaterUp" };

const sectionHeading = "text-xl font-semibold text-accent";

export default function AboutPage() {
  return (
    <MotifBackground>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pt-4 pb-10">
        <Link href="/" className="-ml-2 inline-flex min-h-tap items-center gap-1 self-start rounded-card-sm px-2 font-medium text-text-muted">
          <BackIcon /> Back
        </Link>

        <Sunrise className="mx-auto mt-6 h-[120px] w-64" />
        <h1 className="mt-4 text-center text-[1.75rem] font-semibold tracking-tight">About LaterUp</h1>

        <section className="mt-12 space-y-3" aria-labelledby="why-heading">
          <h2 id="why-heading" className={sectionHeading}>Why we started</h2>
          <p>
            In India, menopause is rarely talked about, even at home. Many women go through these years quietly,
            without anyone to explain what is happening or what might help. We built LaterUp so every woman has a
            kind, reliable place to turn to, whenever she needs it.
          </p>
        </section>

        <Jaali />

        <section className="space-y-3" aria-labelledby="what-heading">
          <h2 id="what-heading" className={sectionHeading}>What LaterUp is and isn&apos;t</h2>
          <p>
            LaterUp helps you understand what your body is going through, find small things that help, and know
            when to see a doctor.
          </p>
          <p>
            It is not a doctor. It does not diagnose, and it never suggests medicines. It is made for Indian women,
            by a 20-year-old who has watched her mother and countless other women live with pain, and wishes
            to see them more energetic and happy.
          </p>
        </section>

        <Jaali />

        <section className="space-y-3" aria-labelledby="privacy-heading">
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
    </MotifBackground>
  );
}

// ---------------- Decorations: thin lines, hidden from screen readers ----------------
// Each drawing sets its line style once; the shapes inside inherit it.
const lineStyle = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

// A sunrise in thin lines, like the LaterUp logo: half sun, rays, horizon
function Sunrise({ className = "" }: { className?: string }) {
  const rays = [157.5, 135, 112.5, 90, 67.5, 45, 22.5].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return { x1: 128 + 60 * Math.cos(r), y1: 100 - 60 * Math.sin(r), x2: 128 + 76 * Math.cos(r), y2: 100 - 76 * Math.sin(r) };
  });
  return (
    <svg viewBox="0 0 256 120" {...lineStyle} className={`text-accent ${className}`}>
      <g strokeWidth="1.5">
        {rays.map((l) => <line key={l.x2} {...l} />)}
        <path d="M80 100 A48 48 0 0 1 176 100" />
        <line x1="16" y1="100" x2="240" y2="100" />
      </g>
      <g strokeWidth="1" opacity=".45">
        <path d="M94 100 A34 34 0 0 1 162 100" />
        <line x1="72" y1="112" x2="184" y2="112" />
      </g>
    </svg>
  );
}

// A jaali band: a row of nine touching circles, each with a small diamond at its centre
function Jaali() {
  return (
    <svg viewBox="0 0 216 24" {...lineStyle} className="mx-auto my-12 h-6 w-[216px] text-accent">
      <g strokeWidth="0.9" opacity=".55">
        {Array.from({ length: 9 }, (_, i) => {
          const x = 12 + i * 24;
          return (
            <g key={x}>
              <circle cx={x} cy="12" r="11.5" />
              <path d={`M${x} 8 L${x + 4} 12 L${x} 16 L${x - 4} 12 Z`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

