// About LaterUp: a public page, no login needed (linked from Welcome).
// Thin-line decorations: a sunrise over the title (the LaterUp motif), jaali bands
// between sections, and faint leaves in the background.
import type { Metadata } from "next";
import Link from "next/link";
import WellnessNote from "@/components/WellnessNote";
import { BackIcon } from "@/components/icons";

export const metadata: Metadata = { title: "About LaterUp" };

const sectionHeading = "text-xl font-semibold text-accent";

export default function AboutPage() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-hidden">
      {/* Faint leaves in the background, kept to the edges so text stays easy to read */}
      <LeafSprig className="absolute -top-8 -right-16 -z-10 h-48 w-36 rotate-[200deg] sm:h-56 sm:w-44 text-primary opacity-20 sm:right-[8%]" />
      <LeafSprig className="absolute top-[45%] -left-14 -z-10 hidden h-64 w-48 rotate-[20deg] text-primary opacity-15 sm:left-[6%] md:block" />
      <LeafSprig className="absolute -bottom-6 -left-12 -z-10 h-52 w-40 rotate-[10deg] text-primary opacity-20 sm:left-[10%]" />

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
            by an Indian woman. It can also help you talk to your doctor in Hindi.
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
    </div>
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

// A sprig of leaves: a curved stem with leaves on alternate sides
function LeafSprig({ className = "" }: { className?: string }) {
  // [x, y, angle] where each leaf joins the stem
  const leaves: [number, number, number][] = [
    [62, 140, -50], [60, 118, 210], [63, 96, -40], [66, 74, 220], [71, 52, -30], [77, 32, 230],
  ];
  return (
    <svg viewBox="0 0 120 160" {...lineStyle} strokeWidth="1.3" className={className}>
      <path d="M60 160 C58 120 64 70 82 12" />
      {leaves.map(([x, y, a]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M0 0 C8 -10 26 -10 34 0 C26 10 8 10 0 0 Z" />
          <line x1="2" y1="0" x2="30" y2="0" opacity=".6" />
        </g>
      ))}
    </svg>
  );
}
