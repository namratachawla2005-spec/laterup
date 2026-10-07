// A woman in a sari enjoying a kulhad of chai, in thin terracotta lines. Decorative only.
export default function ChaiWoman({ className = "" }: { className?: string }) {
  // Small dots along the pallu's border
  const borderDots = [104, 114, 124, 134, 144, 154, 164];
  return (
    <svg
      viewBox="0 0 160 170"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`text-accent ${className}`}
    >
      {/* hair with a middle parting, and a bun */}
      <path d="M56 60 C52 30 66 19 80 19 C94 19 108 30 104 60 C102 46 96 36 80 33 C64 36 58 46 56 60 Z" fill="currentColor" fillOpacity=".22" />
      <path d="M80 20 V33" strokeWidth="1.4" />
      <circle cx="106" cy="34" r="9" fill="currentColor" fillOpacity=".22" />
      {/* face: closed, smiling eyes, bindi, smile, earring */}
      <path d="M57 54 C57 72 67 81 80 81 C93 81 103 72 103 54" />
      <circle cx="80" cy="44" r="2.2" fill="currentColor" stroke="none" />
      <path d="M68 56 q5 4 10 0 M82 56 q5 4 10 0" strokeWidth="1.6" />
      <path d="M75 68 q5 4 10 0" strokeWidth="1.6" />
      <circle cx="57" cy="65" r="2.4" strokeWidth="1.4" />
      {/* neck, shoulders, blouse neckline */}
      <path d="M73 80 V89 M87 80 V89" />
      <path d="M73 89 C55 91 40 99 34 119 L30 168" />
      <path d="M87 89 C105 91 120 99 126 119 L130 168" />
      <path d="M73 89 Q80 98 87 89" strokeWidth="1.6" />
      {/* pallu over her shoulder, with a dotted border */}
      <path d="M100 91 C111 96 118 106 120 122 L122 168" />
      <path d="M105 95 C111 106 113 122 112 140 L111 168" strokeWidth="1.5" />
      {borderDots.map((y) => (
        <circle key={y} cx="116.5" cy={y} r="1.4" fill="currentColor" stroke="none" />
      ))}
      {/* a kulhad of chai cradled in both hands, with steam */}
      <path d="M71 104 H89 L86.5 121 H73.5 Z" />
      <path d="M71 104 Q80 107 89 104" strokeWidth="1.4" />
      <path d="M71 110 C62 111 61 122 69 124 H91 C99 122 98 111 89 110" strokeWidth="1.8" />
      <path d="M76 99 c-3 -4 3 -6 0 -10 M84 99 c-3 -4 3 -6 0 -10" strokeWidth="1.4" opacity=".7" />
    </svg>
  );
}
