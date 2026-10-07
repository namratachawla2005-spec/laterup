// Faint thin-line leaves behind a page (Welcome, Sign up, Log in, About).
// Kept to the edges so the text stays easy to read. Decorative only.
export default function LeafBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-hidden">
      <LeafSprig className="absolute -top-8 -right-16 -z-10 h-48 w-36 rotate-[200deg] opacity-20 sm:right-[8%] sm:h-56 sm:w-44" />
      <LeafSprig className="absolute top-[45%] -left-14 -z-10 hidden h-64 w-48 rotate-[20deg] opacity-15 sm:left-[6%] md:block" />
      <LeafSprig className="absolute -bottom-6 -left-12 -z-10 h-52 w-40 rotate-[10deg] opacity-20 sm:left-[10%]" />
      {children}
    </div>
  );
}

// A sprig of leaves: a curved stem with leaves on alternate sides
function LeafSprig({ className = "" }: { className?: string }) {
  // [x, y, angle] where each leaf joins the stem
  const leaves: [number, number, number][] = [
    [62, 140, -50], [60, 118, 210], [63, 96, -40], [66, 74, 220], [71, 52, -30], [77, 32, 230],
  ];
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`text-primary ${className}`}
    >
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
