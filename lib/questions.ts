// The 15 suggested questions (docs/pages/02-home.md, Section 3).
// Home shows 3 of them; Talk has a pre-written answer for every one.

export const QUESTION_BY_SYMPTOM: Record<string, string> = {
  hot_flashes: "Why do I suddenly feel so hot?",
  poor_sleep: "Why can't I sleep through the night anymore?",
  mood_swings: "Why do I get angry so easily these days?",
  anxiety_low: "Is it normal to feel anxious for no reason?",
  brain_fog: "Why am I forgetting small things?",
  tiredness: "Why am I tired all the time?",
  body_aches: "Can menopause cause body pain?",
  weight_changes: "Why am I gaining weight around my stomach?",
  periods: "Is it normal for my periods to change like this?",
  headaches: "Why am I getting more headaches?",
  hair_skin: "Why is my hair thinning?",
  intimacy: "Is discomfort during intimacy common at this age?",
};

export const GENERAL_QUESTIONS = [
  "What is perimenopause, in simple words?",
  "When should I see a doctor?",
  "How do I talk to my family about this?",
];

// 3 questions from her top symptoms, topped up from the general list in order
export function suggestedQuestions(topSymptoms: string[]): string[] {
  const fromSymptoms = topSymptoms
    .map((s) => QUESTION_BY_SYMPTOM[s])
    .filter((q): q is string => Boolean(q));
  return [...fromSymptoms, ...GENERAL_QUESTIONS].slice(0, 3);
}
