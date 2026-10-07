/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Patterns: the plain rules behind Page 4 (docs/pages/04-patterns.md, Sections 6 and 9).
// No AI. Everything is counted from her own check-ins on her device.
// Always counts ("5 of 6"), never percentages. Observations, never causes.
import { SYMPTOMS, labelFor, isRealSymptom } from "./intake";
import { daysBetween } from "./local";
import { SLEPT_BADLY } from "./checkin";

export type Feeling = "good" | "okay" | "tough";
export type CheckIn = {
  date: string;
  feeling: Feeling;
  bothering: string[];
  sleep?: string | null; // well | on_off | barely
  energy?: string | null; // low | okay | good
};
export type ConvTags = { date: string; tags: string[] };
export type Feedback = { date: string; answer: "yes" | "a_little" | "not_really" };
export type TryingItem = {
  id: string;
  action: string;
  for_symptom: string | null;
  started_date: string;
  active: boolean;
  feedback: Feedback[];
};
export type PatternsData = { checkIns: CheckIn[]; conversations: ConvTags[]; trying: TryingItem[] };

export const symptomName = (s: string) => labelFor(SYMPTOMS, s);
export const symptomLower = (s: string) => {
  const l = symptomName(s);
  return l.charAt(0).toLowerCase() + l.slice(1);
};

// ---------------- Dates ----------------
export function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
}

// Oldest first, ending today
export function lastNDates(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

// ---------------- Section 1: days and the summary sentence ----------------
export type Day = { date: string; checkIn: CheckIn | null };

export function buildDays(dates: string[], checkIns: CheckIn[]): Day[] {
  const byDate = new Map(checkIns.map((c) => [c.date, c]));
  return dates.map((date) => ({ date, checkIn: byDate.get(date) ?? null }));
}

function countFeeling(days: Day[], f: Feeling) {
  return days.filter((d) => d.checkIn?.feeling === f).length;
}

export function summarySentence(current: Day[], previous: Day[]): string {
  const checked = current.filter((d) => d.checkIn).length;
  if (checked < 4) return "A few more check-ins and you'll start to see your patterns.";

  const tough = countFeeling(current, "tough");
  const good = countFeeling(current, "good");
  if (good === checked) return "You've had a good stretch. Lovely to see.";

  const hasPrevious = previous.some((d) => d.checkIn);
  const prevTough = countFeeling(previous, "tough");
  if (hasPrevious && tough < prevTough) {
    return `You had ${tough} tough ${tough === 1 ? "day" : "days"}, fewer than the ${prevTough} before. That's real progress.`;
  }
  if (hasPrevious && tough > prevTough) {
    return `You've had ${tough} tough days lately, more than before. Let's look at what might help.`;
  }
  return `You had ${good} good ${good === 1 ? "day" : "days"} and ${tough} tough ${tough === 1 ? "day" : "days"} in this period.`;
}

// ---------------- Symptom days (check-in taps + conversation tags) ----------------
export function symptomDays(dates: string[], checkIns: CheckIn[], conversations: ConvTags[]): Map<string, Set<string>> {
  const inRange = new Set(dates);
  const map = new Map<string, Set<string>>();
  const add = (s: string, date: string) => {
    if (!inRange.has(date)) return;
    if (!map.has(s)) map.set(s, new Set());
    map.get(s)!.add(date);
  };
  checkIns.forEach((c) => c.bothering.forEach((s) => add(s, c.date)));
  conversations.forEach((c) => c.tags.forEach((s) => add(s, c.date)));
  return map;
}

export function topSymptoms(map: Map<string, Set<string>>, limit = 5) {
  return [...map.entries()]
    .filter(([s]) => isRealSymptom(s))
    .map(([symptom, days]) => ({ symptom, days: days.size }))
    .sort((a, b) => b.days - a.days)
    .slice(0, limit);
}

// ---------------- Section 3: is it helping? ----------------
export type TryLabel = "Too early to tell" | "Seems to help" | "Mixed" | "Not helping yet";

export function tryingResult(feedback: Feedback[]) {
  const total = feedback.length;
  const helpful = feedback.filter((f) => f.answer === "yes" || f.answer === "a_little").length;
  let label: TryLabel;
  if (total < 3) label = "Too early to tell";
  else if (helpful / total >= 0.75) label = "Seems to help";
  else if (helpful / total >= 0.4) label = "Mixed";
  else label = "Not helping yet";
  return { total, helpful, label };
}

export function tryingFor(item: TryingItem, today: string): string {
  const days = daysBetween(item.started_date, today);
  if (days <= 0) return "Started today";
  return `Trying for ${days} ${days === 1 ? "day" : "days"}`;
}

// ---------------- Section 2: "Something we noticed" ----------------
export type Insight = { text: string; talk?: string };

export function insights(current: Day[], previous: Day[], data: PatternsData, periodDays: number): Insight[] {
  const checked = current.filter((d) => d.checkIn);
  if (checked.length < 7) return [];
  const found: Insight[] = [];

  // 1. Something is helping: 4+ answers, 75% or more Yes / A little
  for (const item of data.trying) {
    const r = tryingResult(item.feedback);
    if (r.total >= 4 && r.helpful / r.total >= 0.75) {
      found.push({
        text: `${capitalise(item.action)} has seemed to help on ${r.helpful} of the ${r.total} days you answered. Worth keeping.`,
      });
      break;
    }
  }

  // 2. One thing shapes the day: a symptom, a bad night's sleep, or low energy.
  //    Tough share 30+ points higher with it, at least 3 days in each group.
  const dates = current.map((d) => d.date);
  const sDays = symptomDays(dates, data.checkIns, data.conversations);
  type Candidate = { key: string; withDays: Day[]; withoutDays: Day[] };
  const candidates: Candidate[] = [];
  for (const [symptom, daySet] of sDays) {
    if (!isRealSymptom(symptom)) continue;
    candidates.push({
      key: symptom,
      withDays: checked.filter((d) => daySet.has(d.date)),
      withoutDays: checked.filter((d) => !daySet.has(d.date)),
    });
  }
  // Sleep and energy: compare only days where she answered that question
  const sleepNoted = checked.filter((d) => d.checkIn!.sleep);
  candidates.push({
    key: "slept_badly",
    withDays: sleepNoted.filter((d) => SLEPT_BADLY.includes(d.checkIn!.sleep!)),
    withoutDays: sleepNoted.filter((d) => !SLEPT_BADLY.includes(d.checkIn!.sleep!)),
  });
  const energyNoted = checked.filter((d) => d.checkIn!.energy);
  candidates.push({
    key: "low_energy",
    withDays: energyNoted.filter((d) => d.checkIn!.energy === "low"),
    withoutDays: energyNoted.filter((d) => d.checkIn!.energy !== "low"),
  });

  const tough = (days: Day[]) => days.filter((d) => d.checkIn!.feeling === "tough").length;
  let best: (Candidate & { diff: number }) | null = null;
  for (const cand of candidates) {
    if (cand.withDays.length < 3 || cand.withoutDays.length < 3) continue;
    const diff = tough(cand.withDays) / cand.withDays.length - tough(cand.withoutDays) / cand.withoutDays.length;
    if (diff >= 0.3 && (!best || diff > best.diff)) best = { ...cand, diff };
  }
  if (best) {
    const a = tough(best.withDays), b = best.withDays.length;
    const c = tough(best.withoutDays), d = best.withoutDays.length;
    const others = c === 0 ? `none of ${d} were` : `only ${c} of ${d} ${c === 1 ? "was" : "were"}`;
    if (best.key === "slept_badly") {
      found.push({
        text: `On days after you slept badly, ${a} of ${b} were tough days. On other days, ${others} tough. Sleep seems to affect how your whole day feels.`,
        talk: "Why does poor sleep affect my mood so much?",
      });
    } else if (best.key === "low_energy") {
      found.push({
        text: `On low-energy days, ${a} of ${b} were tough days. On other days, ${others} tough. Your energy seems to shape how the day feels.`,
        talk: "Why am I tired all the time?",
      });
    } else {
      const name = symptomLower(best.key);
      const shaper = best.key === "poor_sleep" ? "Sleep" : capitalise(name);
      found.push({
        text: `On days you mentioned ${name}, ${a} of ${b} were tough days. On other days, ${others} tough. ${shaper} seems to affect how your whole day feels.`,
        talk: best.key === "poor_sleep" ? "Why does poor sleep affect my mood so much?" : `Why does ${name} affect my day so much?`,
      });
    }
  }

  // 3. Days are getting better: at least 3 fewer tough days than the previous period
  if (previous.some((d) => d.checkIn)) {
    const now = countFeeling(current, "tough");
    const before = countFeeling(previous, "tough");
    if (before - now >= 3) {
      // Brief copy said "Whatever you're doing, it's working": changed, patterns are never causes
      found.push({ text: `Your tough days went from ${before} to ${now}. That's a real change worth noticing.` });
    }
  }

  // 4. Most common symptom: tagged on 5+ days
  const top = topSymptoms(sDays, 1)[0];
  if (top && top.days >= 5) {
    found.push({
      text: `${symptomName(top.symptom)} came up most often, on ${top.days} of the last ${periodDays} days. Want to learn what helps?`,
      talk: `What helps with ${symptomLower(top.symptom)}?`,
    });
  }
  return found;
}

// ---------------- Sleep and energy, in plain counts ----------------
// e.g. "You slept well on 3 of the 12 nights you noted."
export function sleepEnergyLines(current: Day[]): string[] {
  const lines: string[] = [];
  const sleeps = current.map((d) => d.checkIn?.sleep).filter(Boolean) as string[];
  if (sleeps.length) {
    const well = sleeps.filter((s) => s === "well").length;
    const barely = sleeps.filter((s) => s === "barely").length;
    const nights = (n: number) => `${n} ${n === 1 ? "night" : "nights"}`;
    lines.push(
      `You slept well on ${well} of the ${nights(sleeps.length)} you noted` +
        (barely ? `, and barely slept on ${barely}.` : ".")
    );
  }
  const energies = current.map((d) => d.checkIn?.energy).filter(Boolean) as string[];
  if (energies.length) {
    const low = energies.filter((e) => e === "low").length;
    lines.push(`Your energy was low on ${low} of the ${energies.length} ${energies.length === 1 ? "day" : "days"} you noted.`);
  }
  return lines;
}

// ---------------- Section 5: gentle support card ----------------
// 8+ tough days in the last 14, or 5+ tough days in a row
export function needsSupport(today: string, checkIns: CheckIn[]): boolean {
  const days = buildDays(lastNDates(today, 14), checkIns);
  if (countFeeling(days, "tough") >= 8) return true;
  let run = 0;
  for (const d of days) {
    run = d.checkIn?.feeling === "tough" ? run + 1 : 0;
    if (run >= 5) return true;
  }
  return false;
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
