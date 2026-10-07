// The LaterUp logo: a sun rising over the horizon (Later + Up, "a new chapter").
// Decorative next to the name, so hidden from screen readers.
export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <g stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round">
        <line x1="32" y1="9" x2="32" y2="15" />
        <line x1="14.5" y1="20" x2="18.8" y2="24.3" />
        <line x1="49.5" y1="20" x2="45.2" y2="24.3" />
      </g>
      <path d="M15 44 A17 17 0 0 1 49 44 Z" fill="var(--color-accent)" />
      <line x1="7" y1="45" x2="57" y2="45" stroke="var(--color-primary)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="20" y1="54" x2="44" y2="54" stroke="var(--color-primary)" strokeWidth="4.5" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}
