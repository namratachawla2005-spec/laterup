/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Doctor Prep: the plain rules behind Page 5 (docs/pages/05-doctor-prep.md).
// No AI. Everything is assembled from her own data with fixed templates.
// Her stage is always shown in her own words, never as a medical label.
import { AGE_GROUPS, DIETS, labelFor, isRealSymptom } from "./intake";
import { daysBetween } from "./local";
import {
  lastNDates, buildDays, symptomDays, topSymptoms, tryingResult, symptomName, symptomLower,
  type PatternsData,
} from "./patterns";

export type DoctorNote = { id: string; date: string; her_words: string; symptom_tags: string[]; see_doctor_soon: boolean };
export type Question = { text: string; included: boolean; custom: boolean };
export type AfterVisitNote = { id: string; date: string; text: string };
export type Include = {
  aboutMe: boolean; diet: boolean; experiencing: boolean; ownWords: boolean; whatTried: boolean; anythingElse: boolean;
};
export type Prep = {
  include: Include;
  excluded_note_ids: string[];
  anything_else: string;
  questions: Question[]; // only the ones she has changed or added
  after_visit_notes: AfterVisitNote[];
};
export type DoctorProfile = {
  age_group: string | null;
  stage_answer: string | null;
  top_symptoms: string[];
  diet: string | null;
  doctor_status: string | null;
  symptoms_other?: string | null;
  diet_other?: string | null;
};

export const DEFAULT_INCLUDE: Include = {
  aboutMe: true, diet: false, experiencing: true, ownWords: true, whatTried: true, anythingElse: true,
};
export const MAX_QUESTIONS = 8;
export const MAX_OWN_WORDS = 5;
export const MAX_ANYTHING_ELSE = 500;

// ---------------- Top of the page ----------------
export function reassurance(doctorStatus: string | null): string {
  switch (doctorStatus) {
    case "seeing_doctor": return "Here's everything in one place for your next visit.";
    case "mentioned_no_help": return "You deserve to be heard. This summary helps you explain clearly what you're going through.";
    case "not_yet": return "Talking to a doctor is a strong step. We've put everything together to make it easier.";
    case "not_comfortable": return "It's okay to feel unsure. Doctors hear about this every day. You can simply show them this page.";
    default: return "Here's everything in one place for when you're ready.";
  }
}

// ---------------- Section 3: questions ----------------
const GENERAL_QUESTIONS = [
  "Could what I'm feeling be related to perimenopause or menopause?",
  "Are there any tests I should have, for example for thyroid, iron or vitamin D?",
  "What are my options for managing these symptoms, and which might suit me?",
];

const SYMPTOM_QUESTIONS: Record<string, string> = {
  poor_sleep: "What can I do about waking up at night?",
  hot_flashes: "What options are there for hot flashes, and what are the pros and cons of each?",
  mood_swings: "Could my mood changes be related to hormones, and what support is available?",
  anxiety_low: "Could my mood changes be related to hormones, and what support is available?",
  brain_fog: "Is this kind of forgetfulness common at my stage?",
  periods: "Are my period changes normal, or should they be checked?",
  body_aches: "Should I be checking my bone health?",
  weight_changes: "What's a realistic way to manage weight changes at this stage?",
  intimacy: "What can help with discomfort during intimacy?",
  tiredness: "Could my tiredness be due to something like low iron or thyroid?",
};

// The questions LaterUp suggests: one for a "see a doctor soon" note, 3 general, up to 3 by symptom
export function suggestedQuestions(symptoms: string[], soonNotes: DoctorNote[]): string[] {
  const list: string[] = [];
  if (soonNotes.length) {
    const tag = soonNotes[0].symptom_tags.find(isRealSymptom);
    list.push(tag ? `What should I do about my ${symptomLower(tag)}?` : "What should I do about what I mentioned first?");
  }
  list.push(...GENERAL_QUESTIONS);
  const bySymptom = [...new Set(symptoms.map((s) => SYMPTOM_QUESTIONS[s]).filter(Boolean))].slice(0, 3);
  return [...list, ...bySymptom];
}

// Suggested questions (with her ticks) followed by her own
export function mergeQuestions(suggested: string[], saved: Question[]): Question[] {
  const merged = suggested.map(
    (text) => saved.find((q) => !q.custom && q.text === text) ?? { text, included: true, custom: false }
  );
  const custom = saved.filter((q) => q.custom);
  // Ticked by default, but never more than 8 in the summary
  let ticked = 0;
  return [...merged, ...custom].map((q) => {
    if (q.included && ticked < MAX_QUESTIONS) { ticked++; return q; }
    return { ...q, included: false };
  });
}

// ---------------- Section 4: how to start the conversation ----------------
// Each phrase is a whole clause, so two can be joined with "and" / "और".
const PHRASES: Record<string, [string, string]> = {
  poor_sleep: ["having trouble sleeping", "मुझे ठीक से नींद नहीं आ रही"],
  mood_swings: ["feeling irritable", "मुझे चिड़चिड़ापन हो रहा है"],
  hot_flashes: ["having hot flashes or night sweats", "मुझे अचानक गर्मी लगती है और रात को पसीना आता है"],
  anxiety_low: ["feeling anxious or low", "मुझे घबराहट या उदासी महसूस हो रही है"],
  brain_fog: ["forgetting things more often", "मुझे चीज़ें याद रखने में मुश्किल हो रही है"],
  tiredness: ["feeling tired all the time", "मुझे हर समय थकान रहती है"],
  body_aches: ["having joint or body aches", "मेरे जोड़ों और शरीर में दर्द रहता है"],
  weight_changes: ["noticing changes in my weight", "मेरे वज़न में बदलाव आ रहा है"],
  periods: ["having irregular or heavy periods", "मेरे पीरियड्स अनियमित हो गए हैं या ज़्यादा हो रहे हैं"],
  headaches: ["getting headaches", "मुझे सिरदर्द हो रहा है"],
  hair_skin: ["noticing changes in my hair or skin", "मेरे बालों या त्वचा में बदलाव आ रहे हैं"],
  intimacy: ["having discomfort during intimacy", "मुझे संबंध के समय तकलीफ़ होती है"],
};
const NO_SYMPTOMS: [string, string] = ["noticing some changes in my body and mood", "मेरे शरीर और मन में कुछ बदलाव हो रहे हैं"];

export function conversationStarter(symptoms: string[], firstCheckIn: string | null, today: string) {
  let en = "for some time", hi = "कुछ समय से";
  if (firstCheckIn) {
    const days = daysBetween(firstCheckIn, today);
    if (days < 14) [en, hi] = ["for the last few days", "पिछले कुछ दिनों से"];
    else if (days <= 42) [en, hi] = ["for the last few weeks", "पिछले कुछ हफ़्तों से"];
    else [en, hi] = ["for the last few months", "पिछले कुछ महीनों से"];
  }
  const picked = symptoms.filter((s) => PHRASES[s]).slice(0, 2).map((s) => PHRASES[s]);
  if (!picked.length) picked.push(NO_SYMPTOMS);

  const enWhat = picked.map((p) => p[0]).join(" and ");
  // "मुझे ... और मुझे ..." reads better as "मुझे ... और ..."
  const hiWhat = picked
    .map((p, i) => (i > 0 && picked[0][1].startsWith("मुझे ") && p[1].startsWith("मुझे ") ? p[1].slice(5) : p[1]))
    .join(" और ");

  return {
    english: `Doctor, ${en} I've been ${enWhat}. I think it might be related to menopause, and I'd like to talk about it. I've written a short summary.`,
    hindi: `डॉक्टर, ${hi} ${hiWhat}। मुझे लगता है यह मेनोपॉज़ से जुड़ा हो सकता है, और मैं इस बारे में बात करना चाहती हूँ। मैंने एक छोटा सा सारांश लिखा है।`,
  };
}

// ---------------- Section 2: the summary parts ----------------
export const shortDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
export const fullDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const sentenceCase = (items: string[]) =>
  items.map((s, i) => (i === 0 ? s : s.charAt(0).toLowerCase() + s.slice(1))).join(", ");

export function aboutMeLines(p: DoctorProfile, withDiet: boolean): string[] {
  const lines: string[] = [];
  if (p.age_group) lines.push(`Age group: ${labelFor(AGE_GROUPS, p.age_group)}`);
  if (p.stage_answer) lines.push(`Periods: "${p.stage_answer}"`);
  const concerns = p.top_symptoms.filter(isRealSymptom).map(symptomName);
  if (p.symptoms_other) concerns.push(`"${p.symptoms_other}"`); // her own words
  if (concerns.length) lines.push(`Main concerns: ${sentenceCase(concerns)}`);
  else if (p.top_symptoms.includes("none")) lines.push("Main concerns: none right now");
  if (withDiet && p.diet && p.diet !== "prefer_not_to_say") {
    lines.push(`Diet: ${p.diet === "other" && p.diet_other ? p.diet_other : labelFor(DIETS, p.diet)}`);
  }
  return lines;
}

// Same counting rule as Page 4. Fewer than 7 check-ins: a gentle "started recently" version.
export function experiencingLines(data: PatternsData, p: DoctorProfile, today: string): { intro?: string; lines: string[] } {
  const dates = lastNDates(today, 30);
  const days = buildDays(dates, data.checkIns).filter((d) => d.checkIn);
  if (days.length < 7) {
    const started = p.top_symptoms.filter(isRealSymptom).map(symptomName);
    return {
      intro: "I've started tracking recently. Here's what I've noticed so far:",
      lines: started.length ? started : ["Some changes in my body and mood"],
    };
  }
  const lines = topSymptoms(symptomDays(dates, data.checkIns, data.conversations)).map(
    ({ symptom, days: n }) => `${symptomName(symptom)}: ${n} ${n === 1 ? "day" : "days"}`
  );
  const count = (f: string) => days.filter((d) => d.checkIn!.feeling === f).length;
  lines.push(`How my days have been: ${count("good")} good, ${count("okay")} okay, ${count("tough")} tough (${days.length} check-ins)`);

  // Sleep and energy, plain counts of the days she noted them
  const sleeps = days.map((d) => d.checkIn!.sleep).filter(Boolean);
  if (sleeps.length) {
    const n = (v: string) => sleeps.filter((s) => s === v).length;
    lines.push(`Sleep: well ${n("well")}, on and off ${n("on_off")}, barely ${n("barely")} (${sleeps.length} ${sleeps.length === 1 ? "night" : "nights"} noted)`);
  }
  const energies = days.map((d) => d.checkIn!.energy).filter(Boolean);
  if (energies.length) {
    const n = (v: string) => energies.filter((e) => e === v).length;
    lines.push(`Energy: low ${n("low")}, okay ${n("okay")}, good ${n("good")} (${energies.length} ${energies.length === 1 ? "day" : "days"} noted)`);
  }
  return { lines };
}

export function triedLines(data: PatternsData): string[] {
  return data.trying.map((item) => {
    const r = tryingResult(item.feedback);
    const forText = item.for_symptom ? ` (for ${symptomLower(item.for_symptom)})` : "";
    const result =
      r.label === "Seems to help" ? `seemed to help, ${r.helpful} of ${r.total} days`
      : r.label === "Mixed" ? `mixed, ${r.helpful} of ${r.total} days`
      : r.label === "Not helping yet" ? `didn't seem to help, ${r.helpful} of ${r.total} days`
      : "just started";
    return `${item.action}${forText}: ${result}`;
  });
}

// The symptoms her starter sentence and questions are built from:
// Page 4's top symptoms first, then her Page 1 answers.
export function leadingSymptoms(data: PatternsData, p: DoctorProfile, today: string): string[] {
  const dates = lastNDates(today, 30);
  const fromData = topSymptoms(symptomDays(dates, data.checkIns, data.conversations)).map((s) => s.symptom);
  return [...new Set([...fromData, ...p.top_symptoms])].filter(isRealSymptom);
}

// ---------------- The finished summary (Show to doctor, Print, WhatsApp, Copy) ----------------
export type SummarySection = { title: string; intro?: string; lines: string[] };
export type Summary = { prepared: string; mentionFirst: string[]; sections: SummarySection[]; questions: string[]; footer: string };

export function footerText(today: string) {
  return `Prepared by the patient using LaterUp, a wellness app, on ${fullDate(today)}. Based on self-reported check-ins. This is not a medical record or diagnosis.`;
}

export function toPlainText(s: Summary): string {
  const out = [`HEALTH SUMMARY (prepared ${s.prepared})`];
  if (s.mentionFirst.length) out.push("", "PLEASE MENTION FIRST", ...s.mentionFirst.map((l) => `- ${l}`));
  for (const sec of s.sections) {
    out.push("", sec.title.toUpperCase());
    if (sec.intro) out.push(sec.intro);
    out.push(...sec.lines.map((l) => `- ${l}`));
  }
  if (s.questions.length) out.push("", "QUESTIONS", ...s.questions.map((q, i) => `${i + 1}. ${q}`));
  out.push("", s.footer);
  return out.join("\n");
}
