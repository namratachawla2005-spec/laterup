// A woman in a sari, in thin terracotta lines, beside the Home greeting (and on Talk and Patterns). Decorative only.
// What she's doing follows the time of day, like the greeting:
// morning: a kulhad of chai; afternoon: reading; evening: listening to music;
// late night: asleep in bed under a crescent moon.
// Talk uses "thinking": a thought bubble with a question. Patterns uses "garland": a string of marigolds.
export type Scene = "chai" | "reading" | "music" | "night" | "thinking" | "garland";

export function sceneFor(hour: number): Scene {
  if (hour >= 22 || hour < 5) return "night";
  if (hour < 12) return "chai";
  if (hour < 17) return "reading";
  return "music";
}

// Thinking needs room for the bubble on the right
const VIEW_BOX: Partial<Record<Scene, string>> = { thinking: "0 0 210 170" };

export default function HomeWoman({ scene, className = "" }: { scene: Scene; className?: string }) {
  return (
    <svg
      viewBox={VIEW_BOX[scene] ?? "0 0 160 170"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`text-accent ${className}`}
    >
      {scene === "night" ? (
        <Asleep />
      ) : (
        <>
          <Woman earring={scene !== "music"} thinking={scene === "thinking"} />
          {scene === "chai" && <Chai />}
          {scene === "reading" && <Book />}
          {scene === "music" && <Music />}
          {scene === "thinking" && <Thinking />}
          {scene === "garland" && <Garland />}
        </>
      )}
    </svg>
  );
}

// The same woman in every scene: hair with a bun, bindi, closed smiling eyes, sari with a teal dotted pallu
function Woman({ earring, thinking = false }: { earring: boolean; thinking?: boolean }) {
  return (
    <>
      <path d="M56 60 C52 30 66 19 80 19 C94 19 108 30 104 60 C102 46 96 36 80 33 C64 36 58 46 56 60 Z" fill="currentColor" fillOpacity=".22" />
      <path d="M80 20 V33" strokeWidth="1.4" />
      <circle cx="106" cy="34" r="9" fill="currentColor" fillOpacity=".22" />
      <path d="M57 54 C57 72 67 81 80 81 C93 81 103 72 103 54" />
      <circle cx="80" cy="44" r="2.2" fill="currentColor" stroke="none" />
      {thinking ? (
        <>
          {/* eyes open, looking up at her thought */}
          <circle cx="74" cy="55" r="2.3" fill="currentColor" stroke="none" />
          <circle cx="90" cy="55" r="2.3" fill="currentColor" stroke="none" />
          <path d="M68 49 q5 -3 10 0 M84 49 q5 -3 10 0" strokeWidth="1.4" />
          <path d="M76 69 q4 2 8 0" strokeWidth="1.6" />
        </>
      ) : (
        <>
          <path d="M68 56 q5 4 10 0 M82 56 q5 4 10 0" strokeWidth="1.6" />
          <path d="M75 68 q5 4 10 0" strokeWidth="1.6" />
        </>
      )}
      {earring && <circle cx="57" cy="65" r="2.4" strokeWidth="1.4" />}
      <path d="M73 80 V89 M87 80 V89" />
      <path d="M73 89 C55 91 40 99 34 119 L30 168" />
      <path d="M87 89 C105 91 120 99 126 119 L130 168" />
      <path d="M73 89 Q80 98 87 89" strokeWidth="1.6" />
      {/* the pallu in teal, with a dotted border */}
      <g className="text-primary">
        <path d="M100 91 C111 96 118 106 120 122 L122 168" />
        <path d="M105 95 C111 106 113 122 112 140 L111 168" strokeWidth="1.5" />
        {[104, 114, 124, 134, 144, 154, 164].map((y) => (
          <circle key={y} cx="116.5" cy={y} r="1.4" fill="currentColor" stroke="none" />
        ))}
      </g>
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

// A teal thought bubble with a question mark
function Thinking() {
  return (
    <g className="text-primary">
      <circle cx="113" cy="52" r="2.5" />
      <circle cx="123" cy="42" r="4" />
      <path d="M144 50 C132 50 130 36 140 33 C138 21 154 16 160 24 C166 13 186 15 186 28 C198 29 200 46 188 49 C186 57 170 58 166 52 C160 58 148 57 144 50 Z" />
      <text x="164" y="44" textAnchor="middle" fontSize="22" fontWeight="600" fill="currentColor" stroke="none">?</text>
    </g>
  );
}

// A string of marigolds held in both hands, dipping between them, with teal leaves
// and a short end hanging from each hand
function Garland() {
  // Points on the curve from her left hand (46,118) to her right hand (114,118)
  const at = (t: number) => [
    (1 - t) ** 2 * 46 + 2 * (1 - t) * t * 80 + t ** 2 * 114,
    (1 - t) ** 2 * 118 + 2 * (1 - t) * t * 166 + t ** 2 * 118,
  ];
  const flowers = [0.12, 0.27, 0.42, 0.58, 0.73, 0.88].map(at);
  const leaves = [0.345, 0.5, 0.655].map(at);
  // the hanging ends: one flower and a leaf below each hand
  const hanging = [[44, 134], [116, 134]];
  return (
    <>
      <path d="M46 118 Q80 166 114 118 M45 120 V140 M115 120 V140" strokeWidth="1.2" opacity=".6" />
      <g className="text-primary">
        {leaves.map(([x, y]) => (
          <path key={x} d={`M${x - 5} ${y + 5} q5 -9 10 -8 q-4 9 -10 8 Z`} fill="currentColor" fillOpacity=".5" strokeWidth="1.1" />
        ))}
        <path d="M41 148 q4 -7 8 -6 q-3 7 -8 6 Z M111 148 q4 -7 8 -6 q-3 7 -8 6 Z" fill="currentColor" fillOpacity=".5" strokeWidth="1.1" />
      </g>
      {[...flowers, ...hanging].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="6" fill="currentColor" fillOpacity=".3" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="1.8" fill="currentColor" stroke="none" />
        </g>
      ))}
      {/* her hands, holding each end */}
      <path d="M40 111 C34 115 35 124 43 125 C49 126 52 120 50 115 C48 112 44 110 40 111 Z" fill="var(--color-background)" strokeWidth="1.8" />
      <path d="M120 111 C126 115 125 124 117 125 C111 126 108 120 110 115 C112 112 116 110 120 111 Z" fill="var(--color-background)" strokeWidth="1.8" />
    </>
  );
}

// Asleep in bed: head on a pillow, a blanket with a dotted border, a crescent moon and "z z"
function Asleep() {
  return (
    <>
      <path d="M30 20 A13 13 0 1 0 44 40 A10 10 0 1 1 30 20 Z" strokeWidth="1.6" />
      <path d="M110 46 h11 l-11 13 h11 M130 28 h8 l-8 10 h8" strokeWidth="1.6" opacity=".7" />
      {/* bed: headboard, mattress, legs */}
      <rect x="8" y="86" width="9" height="66" rx="4" />
      <path d="M17 142 H152 M24 142 V156 M146 142 V156" />
      {/* pillow and her head, hair and bun towards the pillow */}
      <rect x="20" y="106" width="48" height="24" rx="12" strokeWidth="1.6" />
      <circle cx="48" cy="97" r="15" />
      <path d="M33 99 C31 84 40 79 50 82 C43 86 39 92 39 104 Z" fill="currentColor" fillOpacity=".22" />
      <circle cx="29" cy="90" r="7" fill="currentColor" fillOpacity=".22" />
      <circle cx="52" cy="89" r="1.8" fill="currentColor" stroke="none" />
      <path d="M47 96 q4 3 8 0" strokeWidth="1.6" />
      <path d="M49 104 q3 2.5 6 0" strokeWidth="1.4" />
      {/* blanket over her, from the shoulders down, with a dotted border like her pallu */}
      <path d="M66 112 C86 100 120 102 150 112 L152 142 H58 C59 128 61 119 66 112 Z" fill="currentColor" fillOpacity=".12" />
      <g className="text-primary">
        <path d="M64 120 C86 109 120 111 151 120" strokeWidth="1.4" />
        {[[80, 113], [95, 110], [110, 110], [125, 111], [140, 114]].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="1.3" fill="currentColor" stroke="none" />
        ))}
      </g>
    </>
  );
}
