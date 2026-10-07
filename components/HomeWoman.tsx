// A woman in a sari, in thin terracotta lines, beside the Home greeting. Decorative only.
// What she's doing follows the time of day, like the greeting:
// morning: a kulhad of chai; afternoon: reading; evening: listening to music;
// late night: music under a crescent moon.
export type Scene = "chai" | "reading" | "music" | "night";

export function sceneFor(hour: number): Scene {
  if (hour >= 22 || hour < 5) return "night";
  if (hour < 12) return "chai";
  if (hour < 17) return "reading";
  return "music";
}

export default function HomeWoman({ scene, className = "" }: { scene: Scene; className?: string }) {
  const music = scene === "music" || scene === "night";
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
      <Woman earring={!music} />
      {scene === "chai" && <Chai />}
      {scene === "reading" && <Book />}
      {music && <Music />}
      {scene === "night" && <path d="M28 14 A12 12 0 1 0 40 32 A9 9 0 1 1 28 14 Z" strokeWidth="1.6" />}
    </svg>
  );
}

// The same woman in every scene: hair with a bun, bindi, closed smiling eyes, sari with a dotted pallu
function Woman({ earring }: { earring: boolean }) {
  return (
    <>
      <path d="M56 60 C52 30 66 19 80 19 C94 19 108 30 104 60 C102 46 96 36 80 33 C64 36 58 46 56 60 Z" fill="currentColor" fillOpacity=".22" />
      <path d="M80 20 V33" strokeWidth="1.4" />
      <circle cx="106" cy="34" r="9" fill="currentColor" fillOpacity=".22" />
      <path d="M57 54 C57 72 67 81 80 81 C93 81 103 72 103 54" />
      <circle cx="80" cy="44" r="2.2" fill="currentColor" stroke="none" />
      <path d="M68 56 q5 4 10 0 M82 56 q5 4 10 0" strokeWidth="1.6" />
      <path d="M75 68 q5 4 10 0" strokeWidth="1.6" />
      {earring && <circle cx="57" cy="65" r="2.4" strokeWidth="1.4" />}
      <path d="M73 80 V89 M87 80 V89" />
      <path d="M73 89 C55 91 40 99 34 119 L30 168" />
      <path d="M87 89 C105 91 120 99 126 119 L130 168" />
      <path d="M73 89 Q80 98 87 89" strokeWidth="1.6" />
      <path d="M100 91 C111 96 118 106 120 122 L122 168" />
      <path d="M105 95 C111 106 113 122 112 140 L111 168" strokeWidth="1.5" />
      {[104, 114, 124, 134, 144, 154, 164].map((y) => (
        <circle key={y} cx="116.5" cy={y} r="1.4" fill="currentColor" stroke="none" />
      ))}
    </>
  );
}

// A kulhad of chai cradled in both hands, with steam
function Chai() {
  return (
    <>
      <path d="M71 104 H89 L86.5 121 H73.5 Z" />
      <path d="M71 104 Q80 107 89 104" strokeWidth="1.4" />
      <path d="M71 110 C62 111 61 122 69 124 H91 C99 122 98 111 89 110" strokeWidth="1.8" />
      <path d="M76 99 c-3 -4 3 -6 0 -10 M84 99 c-3 -4 3 -6 0 -10" strokeWidth="1.4" opacity=".7" />
    </>
  );
}

// An open book held in both hands
function Book() {
  return (
    <>
      <path d="M58 104 Q69 100 80 106 Q91 100 102 104 V124 Q91 120 80 126 Q69 120 58 124 Z" />
      <path d="M80 106 V126" strokeWidth="1.4" />
      <path d="M64 109 Q70 107 75 110 M64 114 Q70 112 75 115 M85 110 Q90 107 96 109 M85 115 Q90 112 96 114" strokeWidth="1.1" opacity=".6" />
      <path d="M58 112 C52 114 52 122 58 124 M102 112 C108 114 108 122 102 124" strokeWidth="1.8" />
    </>
  );
}

// Headphones, and music notes floating up
function Music() {
  return (
    <>
      <path d="M52 58 C48 22 112 22 108 58" strokeWidth="2.6" />
      <rect x="47" y="52" width="10" height="16" rx="4" fill="currentColor" fillOpacity=".22" />
      <rect x="103" y="52" width="10" height="16" rx="4" fill="currentColor" fillOpacity=".22" />
      <g strokeWidth="1.6">
        <ellipse cx="135" cy="62" rx="4" ry="3" fill="currentColor" />
        <path d="M139 61 V44 L146 47" />
        <ellipse cx="144" cy="88" rx="3.2" ry="2.4" fill="currentColor" opacity=".7" />
        <path d="M147 87 V74" opacity=".7" />
      </g>
    </>
  );
}
