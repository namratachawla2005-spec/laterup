// "See an example": a clearly labelled sample story (BUILD-SPEC section 8, 04-patterns.md Section 7).
// Lives only in this file. NEVER written to the database, never mixed with her
// real data, never shareable.
//
// The story: Meena, 45 to 49, poor sleep and mood. Early days mostly tough,
// later days mostly good or okay. Poor sleep on 6 days, 5 of them tough.
// "Last chai before 4 pm + 10 minutes of slow breathing" seemed to help on 4 of 5 days.
import { addDays, type PatternsData, type Feeling } from "./patterns";
import { DEFAULT_INCLUDE, type DoctorProfile, type DoctorNote, type Prep } from "./doctor";

export const EXAMPLE_NAME = "Meena";

// Last 14 days, oldest first: [feeling, bothering, sleep last night, energy]
const RECENT: [Feeling, string[], string, string][] = [
  ["tough", ["poor_sleep", "mood_swings"], "barely", "low"],
  ["tough", ["poor_sleep"], "barely", "low"],
  ["okay", ["mood_swings"], "well", "low"],
  ["tough", ["poor_sleep"], "on_off", "low"],
  ["tough", ["poor_sleep", "mood_swings"], "barely", "okay"],
  ["okay", [], "well", "okay"],
  ["okay", ["poor_sleep"], "on_off", "okay"],
  ["good", [], "well", "good"],
  ["tough", ["poor_sleep"], "on_off", "low"],
  ["good", [], "well", "good"],
  ["tough", ["mood_swings"], "well", "okay"],
  ["okay", [], "well", "okay"],
  ["good", [], "well", "good"],
  ["good", [], "well", "good"],
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
    ...RECENT.map((r, i) => ({ date: addDays(today, i - 13), feeling: r[0], bothering: r[1], sleep: r[2], energy: r[3] })),
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

// ---------------- Page 5: Doctor Prep example (05-doctor-prep.md Section 7) ----------------
// Same story as above. Meena's periods are irregular, so her "mention first" note
// is about a long, heavy period (a warning sign to check), not spotting after periods stopped.
export const EXAMPLE_PROFILE: DoctorProfile = {
  age_group: "45-49",
  stage_answer: "My periods have become irregular",
  top_symptoms: ["poor_sleep", "mood_swings"],
  diet: "vegetarian",
  doctor_status: "not_yet",
};

export function exampleDoctorNotes(today: string): DoctorNote[] {
  return [
    { id: "example-note-1", date: addDays(today, -2), her_words: "My last period went on for almost two weeks and it was much heavier than usual.", symptom_tags: ["periods"], see_doctor_soon: true },
    { id: "example-note-2", date: addDays(today, -4), her_words: "I haven't slept properly in three nights and I snapped at my daughter today.", symptom_tags: ["poor_sleep", "mood_swings"], see_doctor_soon: false },
    { id: "example-note-3", date: addDays(today, -11), her_words: "Some evenings I feel so low I don't want to talk to anyone at home.", symptom_tags: ["anxiety_low"], see_doctor_soon: false },
    { id: "example-note-4", date: addDays(today, -19), her_words: "I keep forgetting why I walked into a room.", symptom_tags: ["brain_fog"], see_doctor_soon: false },
  ];
}

export function examplePrep(today: string): Prep {
  return {
    include: { ...DEFAULT_INCLUDE },
    excluded_note_ids: [],
    anything_else: "My mother had weak bones in her 60s.",
    questions: [],
    after_visit_notes: [
      { id: "example-visit-1", date: addDays(today, -40), text: "Doctor asked for thyroid and iron tests. Go back in 4 weeks." },
    ],
  };
}
