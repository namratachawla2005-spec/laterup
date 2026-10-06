// "See an example": a clearly labelled sample story (BUILD-SPEC section 8, 04-patterns.md Section 7).
// Lives only in this file. NEVER written to the database, never mixed with her
// real data, never shareable.
//
// The story: Meena, 45 to 49, poor sleep and mood. Early days mostly tough,
// later days mostly good or okay. Poor sleep on 6 days, 5 of them tough.
// "Last chai before 4 pm + 10 minutes of slow breathing" seemed to help on 4 of 5 days.
import { addDays, type PatternsData, type Feeling } from "./patterns";

export const EXAMPLE_NAME = "Meena";

// Last 14 days, oldest first: [feeling, bothering]
const RECENT: [Feeling, string[]][] = [
  ["tough", ["poor_sleep", "mood_swings"]],
  ["tough", ["poor_sleep"]],
  ["okay", ["mood_swings"]],
  ["tough", ["poor_sleep"]],
  ["tough", ["poor_sleep", "mood_swings"]],
  ["okay", []],
  ["okay", ["poor_sleep"]],
  ["good", []],
  ["tough", ["poor_sleep"]],
  ["good", []],
  ["tough", ["mood_swings"]],
  ["okay", []],
  ["good", []],
  ["good", []],
];

// The 14 days before that: harder, with a few missed days (null)
const EARLIER: ([Feeling, string[]] | null)[] = [
  ["tough", ["poor_sleep"]], ["tough", ["poor_sleep", "mood_swings"]], null, ["okay", []],
  ["tough", ["poor_sleep"]], ["tough", ["mood_swings"]], ["tough", ["poor_sleep"]], null,
  ["okay", ["poor_sleep"]], ["tough", ["poor_sleep"]], ["tough", ["mood_swings"]], ["good", []],
  ["tough", ["poor_sleep"]], ["tough", ["poor_sleep"]],
];

export function examplePatterns(today: string): PatternsData {
  const checkIns = [
    ...EARLIER.map((e, i) => (e ? { date: addDays(today, i - 27), feeling: e[0], bothering: e[1] } : null)),
    ...RECENT.map((r, i) => ({ date: addDays(today, i - 13), feeling: r[0], bothering: r[1] })),
  ].filter((c): c is NonNullable<typeof c> => c !== null);

  return {
    checkIns,
    conversations: [],
    trying: [
      {
        id: "example-chai",
        action: "Last chai before 4 pm + 10 minutes of slow breathing",
        for_symptom: "poor_sleep",
        started_date: addDays(today, -6),
        active: true,
        feedback: [
          { date: addDays(today, -4), answer: "yes" },
          { date: addDays(today, -3), answer: "a_little" },
          { date: addDays(today, -2), answer: "not_really" },
          { date: addDays(today, -1), answer: "yes" },
          { date: today, answer: "yes" },
        ],
      },
      {
        id: "example-walk",
        action: "A 10-minute walk after dinner",
        for_symptom: "mood_swings",
        started_date: addDays(today, -2),
        active: true,
        feedback: [
          { date: addDays(today, -1), answer: "a_little" },
          { date: today, answer: "yes" },
        ],
      },
    ],
  };
}
