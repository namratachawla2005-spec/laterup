// Faint thin-line decorations behind a page, kept to the edges so the text stays easy to read.
// "leaves" (Sign up, Log in, About), "rangoli" corners (Welcome), teal "waves" (Home; on phones Home shows
// small waves beside its headings instead) or teal kolam "dots" (Talk, before a conversation starts). Decorative only.
export default function MotifBackground({
  motif = "leaves",
  children,
}: {
  motif?: "leaves" | "rangoli" | "waves" | "dots" | "none";
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-hidden">
      {motif === "leaves" && (
        <>
          <LeafSprig className="absolute -top-8 -right-16 -z-10 h-48 w-36 rotate-[200deg] opacity-20 sm:right-[8%] sm:h-56 sm:w-44" />
          <LeafSprig className="absolute top-[45%] -left-14 -z-10 hidden h-64 w-48 rotate-[20deg] opacity-15 sm:left-[6%] md:block" />
          <LeafSprig className="absolute -bottom-6 -left-12 -z-10 h-52 w-40 rotate-[10deg] opacity-20 sm:left-[10%]" />
        </>
      )}
      {motif === "rangoli" && (
        <>
          <RangoliCorner className="absolute top-0 right-0 -z-10 h-36 w-36 rotate-90 opacity-30 sm:h-56 sm:w-56" />
          <RangoliCorner className="absolute bottom-0 left-0 -z-10 h-36 w-36 -rotate-90 opacity-30 sm:h-56 sm:w-56" />
        </>
      )}
      {motif === "dots" && (
        <>
          {/* Only on wide screens, in the side margins, clear of the content */}
          <KolamDots className="absolute top-[18%] left-[8%] -z-10 hidden w-24 lg:block" />
          <KolamDots className="absolute top-[45%] right-[8%] -z-10 hidden w-20 lg:block" />
          <KolamDots className="absolute top-[72%] left-[10%] -z-10 hidden w-16 lg:block" />
        </>
      )}
      {motif === "waves" && (
        <>
          {/* Only on wide screens, where the side margins are wide enough to keep them clear of the content */}
          <Waves className="absolute top-[13%] left-[4%] -z-10 hidden w-40 lg:block" />
          <Waves className="absolute top-[36%] right-[4%] -z-10 hidden w-40 lg:block" />
          <Waves className="absolute top-[60%] left-[5%] -z-10 hidden w-40 lg:block" />
          <Waves className="absolute top-[84%] right-[5%] -z-10 hidden w-40 lg:block" />
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

// Teal polka dots set out in a diamond, like the dot grid a kolam is drawn on
export function KolamDots({ className = "" }: { className?: string }) {
  const rows = [1, 3, 5, 3, 1];
  const dots = rows.flatMap((count, row) =>
    Array.from({ length: count }, (_, i) => ({ x: 40 + (i - (count - 1) / 2) * 16, y: 8 + row * 16, centre: row === 2 && i === 2 }))
  );
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" focusable="false" className={`text-primary ${className}`}>
      {dots.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r={d.centre ? 4.5 : 3} fill="currentColor" opacity={d.centre ? 0.9 : 0.55} />
      ))}
    </svg>
  );
}
