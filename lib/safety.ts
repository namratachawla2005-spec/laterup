/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Safety checks for the Talk page (docs/pages/03-talk.md, Section 5; BUILD-SPEC 9).
// Runs on her device BEFORE anything else, and again in /api/understand.
// Plain word matching: instant, private, and works even if the AI is down.

export const MAX_MESSAGE_CHARS = 1000;
export const COUNTER_FROM = 800; // "characters left" appears after this

export const LENGTH_MESSAGE =
  "That's a lot to hold. Try sharing the one thing weighing on you most right now.";
export const OFF_TOPIC_MESSAGE =
  "I'm here for midlife and menopause questions. Is there something you're feeling I can help with?";
export const SHORT_MESSAGE_REPLY = "I'm here. What's been on your mind lately?";

// Lowercase, straight apostrophes, single spaces
function normalise(text: string): string {
  return text.toLowerCase().replace(/[‘’`]/g, "'").replace(/\s+/g, " ").trim();
}

// ---------------- Level 1: Emergency ----------------
// Self-harm is checked first, so she always sees the helpline card.
const SELF_HARM = [
  /\bwant(ed)? to die\b/,
  /\bwish i (was|were) dead\b/,
  /\bend (my|it all|my own) li(fe|ves)\b/,
  /\bend it all\b/,
  /\bkill(ing)? myself\b/,
  /\bhurt(ing)? myself\b/,
  /\bharm(ing)? myself\b/,
  /\bsuicid/,
  /\bno reason to (live|go on)\b/,
  /\bdon'?t want to (live|be alive|go on)\b/,
  /\bbetter off (dead|without me)\b/,
  /\bmar jaa?na chaa?hti\b/,
  /\bmarna chaa?hti\b/,
  /\bjeena nahi chaa?hti\b/,
];

const PHYSICAL = [
  /\bchest (pain|tightness|is tight|feels tight|hurts)\b/,
  /\bpain in (my )?chest\b/,
  /\b(can'?t|cannot|can not|unable to) breathe\b/,
  /\bsaa?ns nahi?n? (aa? ?rahi|le pa)/,
  /\bsoak(ing|ed)? (through )?(a |one )?pad (every|each) hour\b/,
  /\bbleeding a lot\b/,
  /\bclots?\b.*\bdizzy\b|\bdizzy\b.*\bclots?\b/,
  /\bfaint(ed|ing)\b/,
  /\bpassed out\b/,
  /\bbehosh\b/,
  /\bface (is )?droop/,
  /\b(can'?t|cannot) speak properly\b/,
  /\barm (is )?(suddenly )?weak\b|\bsuddenly weak arm\b/,
  /\bworst headache of my life\b/,
];

export type Emergency = "self_harm" | "physical" | null;

export function emergencyCheck(text: string): Emergency {
  const t = normalise(text);
  if (SELF_HARM.some((p) => p.test(t))) return "self_harm";
  if (PHYSICAL.some((p) => p.test(t))) return "physical";
  return null;
}

// ---------------- Level 2: See a doctor soon ----------------
// The answer still shows, but the doctor card moves to the top.
type ProfileBits = { stage?: string | null; age_group?: string | null };

export function seeDoctorSoonCheck(text: string, profile: ProfileBits): boolean {
  const t = normalise(text);
  const mentionsBleeding = /\b(bleed|bleeding|spotting|spot|blood|khoon)\b|periods? (came|come|has come|have come) back|period again/.test(t);

  // Bleeding after periods stopped for a year or more
  if (profile.stage === "postmenopause" && mentionsBleeding) return true;
  // Bleeding between periods or after intimacy
  if (/\bbleed(ing)? (between|in between) periods\b|\bspotting between\b/.test(t)) return true;
  if (/\bbleed(ing)?\b.*\bafter (sex|intimacy|intercourse|being intimate)\b/.test(t)) return true;
  // A lump in the breast
  if (/\blump\b.*\bbreast\b|\bbreast\b.*\blump\b|\bgaanth\b/.test(t)) return true;
  // Low or hopeless most days for 2+ weeks
  if (
    /\b(hopeless|depressed|empty|sad|low|teary|crying)\b/.test(t) &&
    /\b(weeks?|months?|every day|most days|all the time|for days)\b/.test(t)
  ) return true;
  // Fear of a serious illness: answer gently, doctor card first
  if (/\b(cancer|tumou?r)\b/.test(t)) return true;
  // Very heavy or very long periods
  if (/\b(very|so|really|too|extremely) heavy\b|\bheavier than (ever|usual|before)\b|\bheavy bleeding\b|\bflooding\b|\bperiods? (lasting|lasts|last|going on) (more than|over|for) (a week|\d+|two|three)/.test(t)) return true;
  // Under 40 with periods stopping
  if (
    profile.age_group === "under_40" &&
    (/\bperiods? (have |has )?(stopped|stop|gone)\b|\bno periods?\b|\bmissed (my )?periods?\b/.test(t) ||
      ["late_perimenopause", "postmenopause"].includes(profile.stage ?? ""))
  ) {
    if (/\bperiod/.test(t)) return true;
  }
  return false;
}

// ---------------- Topic and very short messages ----------------
const OFF_TOPIC = [
  /\b(write|draft|compose)\b.*\b(essay|code|program|poem|story|letter|email|assignment|homework|resume|cv)\b/,
  /\b(homework|assignment)\b/,
  /\btranslate\b/,
  /\b(python|javascript|java|sql|html|excel formula)\b/,
  /\b(cricket|football) score\b/,
  /\bweather\b/,
  /\bstock (price|market)\b/,
  /\btell me a joke\b/,
];

export function isOffTopic(text: string): boolean {
  const t = normalise(text);
  return OFF_TOPIC.some((p) => p.test(t));
}

const GREETINGS = /^(hi+|hello+|hey+|help|namaste|hii+|ok|okay|hmm+|test)[.!?]*$/;

export function isTooShort(text: string): boolean {
  const t = normalise(text);
  return t.length < 3 || GREETINGS.test(t);
}
