// Patterns: the plain rules behind Page 4 (docs/pages/04-patterns.md, Sections 6 and 9).
// No AI. Everything is counted from her own check-ins on her device.
// Always counts ("5 of 6"), never percentages. Observations, never causes.
import { SYMPTOMS, labelFor } from "./intake";
import { daysBetween } from "./local";

export type Feeling = "good" | "okay" | "tough";
export type CheckIn = { date: string; feeling: Feeling; bothering: string[] };
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
    .filter(([s]) => s !== "something_else")
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

  // 2. One symptom shapes the day: tough share 30+ points higher with it, 3+ days in each group
  const dates = current.map((d) => d.date);
  const sDays = symptomDays(dates, data.checkIns, data.conversations);
  let best: { symptom: string; withTough: number; withTotal: number; withoutTough: number; withoutTotal: number; diff: number } | null = null;
  for (const [symptom, daySet] of sDays) {
    if (symptom === "something_else") continue;
    const withDays = checked.filter((d) => daySet.has(d.date));
    const withoutDays = checked.filter((d) => !daySet.has(d.date));
    if (withDays.length < 3 || withoutDays.length < 3) continue;
    const withTough = withDays.filter((d) => d.checkIn!.feeling === "tough").length;
    const withoutTough = withoutDays.filter((d) => d.checkIn!.feeling === "tough").length;
    const diff = withTough / withDays.length - withoutTough / withoutDays.length;
    if (diff >= 0.3 && (!best || diff > best.diff)) {
      best = { symptom, withTough, withTotal: withDays.length, withoutTough, withoutTotal: withoutDays.length, diff };
    }
  }
  if (best) {
    const name = symptomLower(best.symptom);
    const others = best.withoutTough === 0 ? `none of ${best.withoutTotal} were` : `only ${best.withoutTough} of ${best.withoutTotal} ${best.withoutTough === 1 ? "was" : "were"}`;
    const shaper = best.symptom === "poor_sleep" ? "Sleep" : capitalise(name);
    found.push({
      text: `On days you mentioned ${name}, ${best.withTough} of ${best.withTotal} were tough days. On other days, ${others} tough. ${shaper} seems to affect how your whole day feels.`,
      talk: best.symptom === "poor_sleep" ? "Why does poor sleep affect my mood so much?" : `Why does ${name} affect my day so much?`,
    });
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
