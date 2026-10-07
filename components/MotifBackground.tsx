/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Faint thin-line decorations behind a page, kept to the edges so the text stays easy to read.
// "leaves" (Sign up, Log in, About, Plans), "rangoli" corners plus wide-screen waves (Welcome), teal "waves" (Home, Talk, Patterns,
// Doctor Prep, Settings, Help, SOS; on phones these pages show small HeadingWaves beside a heading instead). Decorative only.
export default function MotifBackground({
  motif = "leaves",
  children,
}: {
  motif?: "leaves" | "rangoli" | "waves";
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-hidden">
      {motif === "leaves" && (
        <>
          {/* Tucked into the top-right corner on every screen; the other two only where the margins are empty */}
          <LeafSprig className="absolute -top-14 -right-12 -z-10 h-36 w-28 rotate-[200deg] opacity-20 sm:-right-10 sm:h-56 sm:w-44 lg:right-[3%]" />
          <LeafSprig className="absolute top-[45%] left-[4%] -z-10 hidden h-64 w-48 rotate-[20deg] opacity-15 xl:block" />
          <LeafSprig className="absolute -bottom-6 left-[2%] -z-10 hidden h-52 w-40 rotate-[10deg] opacity-20 lg:block" />
        </>
      )}
      {motif === "rangoli" && (
        <>
          <RangoliCorner className="absolute top-0 right-0 -z-10 h-36 w-36 rotate-90 opacity-30 sm:h-56 sm:w-56" />
          <RangoliCorner className="absolute bottom-0 left-0 -z-10 h-36 w-36 -rotate-90 opacity-30 sm:h-56 sm:w-56" />
          {/* Wide screens only: a few waves in the empty side margins, away from both rangoli corners */}
          <Waves className="absolute top-[22%] left-[6%] -z-10 hidden w-40 lg:block print:hidden" />
          <Waves className="absolute top-[44%] right-[6%] -z-10 hidden w-40 lg:block print:hidden" />
          <Waves className="absolute top-[60%] left-[7%] -z-10 hidden w-40 lg:block print:hidden" />
          <Waves className="absolute top-[80%] right-[7%] -z-10 hidden w-40 lg:block print:hidden" />
        </>
      )}
      {motif === "waves" && (
        <>
          {/* Only on wide screens, where the side margins are wide enough to keep them clear of the content */}
          <Waves className="absolute top-[13%] left-[4%] -z-10 hidden w-40 lg:block print:hidden" />
          <Waves className="absolute top-[36%] right-[4%] -z-10 hidden w-40 lg:block print:hidden" />
          <Waves className="absolute top-[60%] left-[5%] -z-10 hidden w-40 lg:block print:hidden" />
          <Waves className="absolute top-[84%] right-[5%] -z-10 hidden w-40 lg:block print:hidden" />
        </>
      )}
      {children}
    </div>
  );
}

const lineStyle = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

// A sprig of leaves: a curved stem with leaves on alternate sides
function LeafSprig({ className = "" }: { className?: string }) {
  // [x, y, angle] where each leaf joins the stem
  const leaves: [number, number, number][] = [
    [62, 140, -50], [60, 118, 210], [63, 96, -40], [66, 74, 220], [71, 52, -30], [77, 32, 230],
  ];
  return (
    <svg viewBox="0 0 120 160" {...lineStyle} strokeWidth="1.3" className={`text-primary ${className}`}>
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

// A quarter rangoli / mandala that sits in a corner: rings, lotus petals, dots and a scalloped edge.
// Drawn for the top-left corner; rotate it for the others.
function RangoliCorner({ className = "" }: { className?: string }) {
  const at = (r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return [r * Math.cos(a), r * Math.sin(a)];
  };
  const petals = [7.5, 22.5, 37.5, 52.5, 67.5, 82.5];
  const dots = Array.from({ length: 10 }, (_, i) => 4.5 + i * 9);
  const scallops = [0, 15, 30, 45, 60, 75];
  return (
    <svg viewBox="0 0 160 160" {...lineStyle} strokeWidth="1.2" className={`text-accent ${className}`}>
      <path d="M28 0 A28 28 0 0 1 0 28" />
      <path d="M38 0 A38 38 0 0 1 0 38" opacity=".6" />
      {/* lotus petals between the rings */}
      {petals.map((deg) => (
        <path key={deg} transform={`rotate(${deg})`} d="M40 0 C50 -9 62 -6 70 0 C62 6 50 9 40 0 Z" />
      ))}
      <path d="M76 0 A76 76 0 0 1 0 76" />
      {/* ring of dots */}
      {dots.map((deg) => {
        const [x, y] = at(88, deg);
        return <circle key={deg} cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" />;
      })}
      <path d="M100 0 A100 100 0 0 1 0 100" />
      {/* scalloped outer edge */}
      {scallops.map((deg) => {
        const [x1, y1] = at(100, deg);
        const [x2, y2] = at(100, deg + 15);
        return <path key={deg} d={`M${x1} ${y1} A13.5 13.5 0 0 1 ${x2} ${y2}`} />;
      })}
    </svg>
  );
}

// Three gentle, parallel wavy lines in teal, like a wave border on a textile.
// The ends fade out softly.
export function Waves({ className = "" }: { className?: string }) {
  const wave = (y: number) => `M0 ${y} q12.5 -9 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0`;
  const fade = "linear-gradient(to right, transparent, black 30%, black 70%, transparent)";
  return (
    <svg
      viewBox="0 0 200 48"
      {...lineStyle}
      strokeWidth="1.6"
      className={`text-primary ${className}`}
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <path d={wave(12)} opacity=".85" />
      <path d={wave(24)} opacity=".6" />
      <path d={wave(36)} opacity=".35" />
    </svg>
  );
}


// Small teal waves beside a heading on phones and tablets, kept clear of the words
// (on wide screens the waves sit in the side margins instead)
export function HeadingWaves() {
  return <Waves className="ml-auto h-6 w-20 shrink-0 lg:hidden" />;
}
