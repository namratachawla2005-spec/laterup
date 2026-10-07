/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Page 1 intake: the 7 questions, their options, and the thank-you reflection.
// Exact copy from docs/pages/01-welcome-intake.md. Saved values are short keys;
// other pages (Home, Talk, Patterns, Doctor Prep) read the same keys and labels.

export type Option = { value: string; label: string };

export type Profile = {
  id: string;
  name: string | null;
  age_group: string | null;
  stage: string | null;
  stage_answer: string | null;
  top_symptoms: string[];
  diet: string | null;
  life_context: string[];
  doctor_status: string | null;
  consent_given: boolean;
  consent_date: string | null;
  intake_step: number;
  intake_completed: boolean;
};

export const MAX_NAME_LENGTH = 30;
export const MAX_SYMPTOMS = 3;

export const AGE_GROUPS: Option[] = [
  { value: "under_40", label: "Under 40" },
  { value: "40-44", label: "40 to 44" },
  { value: "45-49", label: "45 to 49" },
  { value: "50-54", label: "50 to 54" },
  { value: "55_plus", label: "55 or above" },
];

// Q3. The value is the internal stage label (never shown to her).
export const STAGES: Option[] = [
  { value: "early_perimenopause", label: "My periods are still regular, but I've noticed other changes" },
  { value: "perimenopause", label: "My periods have become irregular" },
  { value: "late_perimenopause", label: "My periods stopped less than a year ago" },
  { value: "postmenopause", label: "My periods stopped more than a year ago" },
  { value: "unsure", label: "I'm not sure" },
];

export const SYMPTOMS: Option[] = [
  { value: "hot_flashes", label: "Hot flashes or night sweats" },
  { value: "poor_sleep", label: "Poor sleep" },
  { value: "mood_swings", label: "Mood swings or irritability" },
  { value: "anxiety_low", label: "Anxiety or feeling low" },
  { value: "brain_fog", label: "Forgetfulness or brain fog" },
  { value: "tiredness", label: "Tiredness or low energy" },
  { value: "body_aches", label: "Joint or body aches" },
  { value: "weight_changes", label: "Weight changes" },
  { value: "periods", label: "Irregular or heavy periods" },
  { value: "headaches", label: "Headaches" },
  { value: "hair_skin", label: "Hair or skin changes" },
  { value: "intimacy", label: "Discomfort during intimacy" },
  { value: "something_else", label: "Something else" },
];

export const DIETS: Option[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "non_vegetarian", label: "Non-vegetarian" },
  { value: "jain", label: "Jain" },
  { value: "vegan", label: "Vegan" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const LIFE_CONTEXT: Option[] = [
  { value: "works_outside", label: "I work outside the home" },
  { value: "works_from_home", label: "I work from home" },
  { value: "manages_home", label: "I manage the home full time" },
  { value: "joint_family", label: "I live in a joint family" },
  { value: "cares_for_elders", label: "I care for parents or in-laws" },
  { value: "children_at_home", label: "I have children at home" },
  { value: "lives_alone", label: "I live alone" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const DOCTOR_STATUS: Option[] = [
  { value: "seeing_doctor", label: "Yes, I'm seeing a doctor for this" },
  { value: "mentioned_no_help", label: "I've mentioned it, but didn't get much help" },
  { value: "not_yet", label: "Not yet" },
  { value: "not_comfortable", label: "I'm not comfortable talking about it" },
];

export function labelFor(options: Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

// "a", "a and b", "a, b and c"
function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// Thank-you screen (brief, Step 4). At most 3 short sentences.
export function buildReflection(p: Pick<Profile, "name" | "top_symptoms" | "age_group" | "doctor_status">) {
  const headline = p.name ? `Thank you, ${p.name}.` : "Thank you for sharing.";

  const named = p.top_symptoms
    .filter((s) => s !== "something_else")
    .map((s) => {
      const label = labelFor(SYMPTOMS, s);
      return label.charAt(0).toLowerCase() + label.slice(1);
    });

  const sentences =
    named.length > 0
      ? [
          `You mentioned ${joinWithAnd(named)}.`,
          "Many women go through this in midlife, and you're not alone in it.",
        ]
      : ["Whatever you're going through, many women feel it too, and you're not alone."];

  const extras: string[] = [];
  if (p.age_group === "under_40") {
    extras.push("Changes like these before 40 are worth mentioning to a doctor. We'll help you prepare.");
  }
  if (p.doctor_status === "not_comfortable") {
    extras.push("Whenever you're ready, we'll help you find the words for your doctor.");
  }
  extras.push("Let's take it one step at a time.");

  for (const extra of extras) {
    if (sentences.length >= 3) break;
    sentences.push(extra);
  }

  return { headline, body: sentences.join(" ") };
}
