"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { localDate, useIsBrowser, writeSession, HANDOVER_KEY } from "@/lib/local";
import {
  buildDays, lastNDates, summarySentence, symptomDays, topSymptoms, insights, tryingResult, tryingFor,
  needsSupport, symptomName, symptomLower, addDays, sleepEnergyLines,
  type Day, type PatternsData, type TryingItem, type TryLabel,
} from "@/lib/patterns";
import { examplePatterns } from "@/lib/example";
import { sleepWord, energyWord } from "@/lib/checkin";
import BottomNav from "@/components/BottomNav";
import WellnessNote from "@/components/WellnessNote";

const RANGE_KEY = "laterup:patterns-range"; // her choice of 2 weeks / 30 days (no health data)
const SUPPORT_KEY = "laterup:support-dismissed"; // date she closed the support card
const readLocal = (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } };
const writeLocal = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

export default function PatternsView(props: { data: PatternsData }) {
  // Counts depend on her own date, so this draws only in the browser
  const isBrowser = useIsBrowser();
  return (
    <>
      {isBrowser ? <PatternsContent {...props} /> : <main className="flex-1" />}
      <BottomNav />
    </>
  );
}

function PatternsContent({ data: realData }: { data: PatternsData }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [today] = useState(() => localDate());
  const [range, setRange] = useState<14 | 30>(() => (readLocal(RANGE_KEY) === "30" ? 30 : 14));
  const [example, setExample] = useState(false);
  const [trying, setTrying] = useState(realData.trying);
  const [supportClosed, setSupportClosed] = useState(() => readLocal(SUPPORT_KEY) === today);

  // Conversation times -> her local dates
  const [real] = useState<PatternsData>(() => ({
    ...realData,
    conversations: realData.conversations.map((c) => ({ ...c, date: localDate(new Date(c.date)) })),
  }));
  const data: PatternsData = example ? examplePatterns(today) : { ...real, trying };

  const dates = lastNDates(today, range);
  const current = buildDays(dates, data.checkIns);
  const previous = buildDays(lastNDates(addDays(today, -range), range), data.checkIns);
  const totalCheckIns = data.checkIns.length;
  const isNew = totalCheckIns < 4;
  const found = insights(current, previous, data, range);
  const bothering = topSymptoms(symptomDays(dates, data.checkIns, data.conversations));
  const showSupport = !example && !supportClosed && needsSupport(today, data.checkIns);

  function talkAbout(question: string) {
    writeSession(HANDOVER_KEY, question);
    router.push("/talk");
  }

  async function stopTrying(id: string) {
    const { error } = await supabase.from("trying").update({ active: false }).eq("id", id);
    if (!error) setTrying((t) => t.map((i) => (i.id === id ? { ...i, active: false } : i)));
    return !error;
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-28">
      {example && (
        <div role="status" className="mb-6 rounded-card border-2 border-accent/40 bg-surface p-4">
          <p>
            <strong>This is an example.</strong> Your real patterns will appear as you check in.
          </p>
          <button
            type="button"
            onClick={() => { setExample(false); window.scrollTo(0, 0); }}
            className="mt-2 rounded-card border-2 border-primary px-5 font-semibold text-primary"
          >
            Exit example
          </button>
        </div>
      )}

      <h1 className="text-[1.75rem] font-semibold leading-tight">Your patterns</h1>
      <p className="mt-1 text-text-muted">Built from your check-ins. Only you can see this.</p>

      {!isNew && (
        <div role="group" aria-label="Time period" className="mt-5 inline-flex rounded-card bg-surface p-1">
          {([14, 30] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => { setRange(r); writeLocal(RANGE_KEY, String(r)); }}
              className={`rounded-card-sm px-4 font-medium ${range === r ? "bg-primary text-white" : "text-text"}`}
            >
              {r === 14 ? "Last 2 weeks" : "Last 30 days"}
            </button>
          ))}
        </div>
      )}

      {isNew ? (
        <EmptyState count={totalCheckIns} onExample={() => { setExample(true); window.scrollTo(0, 0); }} />
      ) : (
        <>
          {/* Section 1 */}
          <section className="mt-8" aria-labelledby="days-heading">
            <h2 id="days-heading" className="text-xl font-semibold">How your days have been</h2>
            <DotGrid days={current} showLetters={range === 14} />
            <p className="mt-4">{summarySentence(current, previous)}</p>
            {sleepEnergyLines(current).map((line) => (
              <p key={line} className="mt-1 text-text-muted">{line}</p>
            ))}
          </section>

          {/* Section 2 */}
          {found.length > 0 && <InsightCard insights={found} onTalk={talkAbout} />}
        </>
      )}

      {/* Section 3 (shown for new users too, if she's trying something) */}
      {(!isNew || data.trying.length > 0) && (
        <HelpingSection items={data.trying} today={today} example={example} onStop={stopTrying} onTalk={talkAbout} />
      )}

      {!isNew && (
        <>
          {/* Section 4 */}
          <section className="mt-10" aria-labelledby="bother-heading">
            <h2 id="bother-heading" className="text-xl font-semibold">What&apos;s been bothering you</h2>
            {bothering.length === 0 ? (
              <p className="mt-3 text-text-muted">When you check in on Home, you can tap what&apos;s bothering you. It&apos;ll show up here.</p>
            ) : (
              <ul className="mt-3 space-y-1">
                {bothering.map(({ symptom, days }) => (
                  <li key={symptom}>
                    <button
                      type="button"
                      onClick={() => talkAbout(`What helps with ${symptomLower(symptom)}?`)}
                      aria-label={`${symptomName(symptom)}, ${days} ${days === 1 ? "day" : "days"}. Ask what helps.`}
                      className="grid w-full grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 rounded-card-sm py-1 text-left"
                    >
                      <span className="truncate">{symptomName(symptom)}</span>
                      <span aria-hidden="true" className="h-3 rounded-full bg-surface">
                        <span className="block h-3 rounded-full bg-accent" style={{ width: `${(days / bothering[0].days) * 100}%` }} />
                      </span>
                      <span className="text-helper text-text-muted">{days} {days === 1 ? "day" : "days"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Section 5 */}
          {showSupport && (
            <SupportCard onClose={() => { setSupportClosed(true); writeLocal(SUPPORT_KEY, today); }} onTalk={() => router.push("/talk")} />
          )}
        </>
      )}

      {/* Bottom links */}
      <div className="mt-10 space-y-2">
        {!example && (
          <Link href="/doctor" className="inline-flex min-h-tap items-center font-semibold text-primary underline underline-offset-4">
            See your doctor summary →
          </Link>
        )}
        {!isNew && !example && (
          <div>
            <button
              type="button"
              onClick={() => { setExample(true); window.scrollTo(0, 0); }}
              className="-ml-2 rounded-card-sm px-2 text-text-muted underline underline-offset-4"
            >
              See an example
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <WellnessNote />
      </div>
    </main>
  );
}

// ---------------- Section 1: the dots ----------------
// Shape and colour together (never colour alone): filled teal, outlined sand, filled terracotta, small empty ring
function Dot({ feeling }: { feeling: "good" | "okay" | "tough" | null }) {
  if (feeling === "good") return <span className="block h-7 w-7 rounded-full bg-primary" />;
  if (feeling === "okay") return <span className="block h-7 w-7 rounded-full border-[3px] border-primary bg-surface" />;
  if (feeling === "tough") return <span className="block h-7 w-7 rounded-full bg-accent" />;
  return <span className="block h-4 w-4 rounded-full border-2 border-text-muted/50" />;
}

const longDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
const shortDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const FEELING_WORD = { good: "Good", okay: "Okay", tough: "Tough" };

function DotGrid({ days, showLetters }: { days: Day[]; showLetters: boolean }) {
  const [picked, setPicked] = useState<string | null>(null);
  const pickedDay = days.find((d) => d.date === picked);

  return (
    <div className="mt-4">
      <ul className="grid grid-cols-7">
        {days.map((d) => {
          const word = d.checkIn ? `${FEELING_WORD[d.checkIn.feeling].toLowerCase()} day` : "no check-in";
          return (
            <li key={d.date}>
              <button
                type="button"
                aria-pressed={picked === d.date}
                aria-label={`${longDate(d.date)}, ${word}`}
                onClick={() => setPicked(picked === d.date ? null : d.date)}
                className={`flex w-full flex-col items-center justify-center rounded-card-sm py-1 ${picked === d.date ? "bg-surface" : ""}`}
              >
                <span className="flex h-8 items-center justify-center"><Dot feeling={d.checkIn?.feeling ?? null} /></span>
                {showLetters && (
                  <span aria-hidden="true" className="text-helper text-text-muted">
                    {new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "narrow" })}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className="mt-2 min-h-[1.6em] text-helper">
        {pickedDay &&
          `${shortDate(pickedDay.date)}: ${pickedDay.checkIn ? FEELING_WORD[pickedDay.checkIn.feeling] : "No check-in"}.` +
            (pickedDay.checkIn?.sleep ? ` Slept: ${sleepWord(pickedDay.checkIn.sleep)}.` : "") +
            (pickedDay.checkIn?.energy ? ` Energy: ${energyWord(pickedDay.checkIn.energy)}.` : "") +
            (pickedDay.checkIn?.bothering.length
              ? ` Bothered by: ${pickedDay.checkIn.bothering.map(symptomLower).join(", ")}.`
              : "")}
      </p>

      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-helper text-text-muted" aria-label="Key">
        <li className="flex items-center gap-1.5"><span className="block h-3.5 w-3.5 rounded-full bg-primary" />Good</li>
        <li className="flex items-center gap-1.5"><span className="block h-3.5 w-3.5 rounded-full border-2 border-primary bg-surface" />Okay</li>
        <li className="flex items-center gap-1.5"><span className="block h-3.5 w-3.5 rounded-full bg-accent" />Tough</li>
        <li className="flex items-center gap-1.5"><span className="block h-2.5 w-2.5 rounded-full border-2 border-text-muted/50" />No check-in</li>
      </ul>
    </div>
  );
}

// ---------------- Section 2: "Something we noticed" ----------------
function InsightCard({ insights, onTalk }: { insights: { text: string; talk?: string }[]; onTalk: (q: string) => void }) {
  const [index, setIndex] = useState(0);
  const insight = insights[index % insights.length];

  return (
    <section className="mt-8 rounded-card bg-surface p-5" aria-labelledby="noticed-heading" aria-live="polite">
      <h2 id="noticed-heading" className="flex items-center gap-2 text-xl font-semibold">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-accent">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
        Something we noticed
      </h2>
      <p className="mt-3">{insight.text}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {insight.talk && (
          <button type="button" onClick={() => onTalk(insight.talk!)} className="rounded-card border-2 border-primary px-5 font-semibold text-primary">
            Talk about this
          </button>
        )}
        {insights.length > 1 && (
          <button type="button" onClick={() => setIndex(index + 1)} className="rounded-card-sm px-2 text-text-muted underline underline-offset-4">
            See another
          </button>
        )}
      </div>
      <p className="mt-4 text-helper text-text-muted">This is a pattern from your check-ins, not a medical finding.</p>
    </section>
  );
}

// ---------------- Section 3: "What's helping you" ----------------
const LABEL_STYLE: Record<TryLabel, string> = {
  "Seems to help": "text-primary",
  Mixed: "text-accent",
  "Not helping yet": "text-text-muted",
  "Too early to tell": "text-text-muted",
};

function HelpingSection({
  items, today, example, onStop, onTalk,
}: {
  items: TryingItem[];
  today: string;
  example: boolean;
  onStop: (id: string) => Promise<boolean>;
  onTalk: (q: string) => void;
}) {
  const [showBefore, setShowBefore] = useState(false);
  const active = items.filter((i) => i.active);
  const before = items.filter((i) => !i.active);

  return (
    <section className="mt-10" aria-labelledby="helping-heading">
      <h2 id="helping-heading" className="text-xl font-semibold">What&apos;s helping you</h2>

      {active.length === 0 && (
        <div className="mt-3">
          <p>
            You&apos;re not trying anything yet. When LaterUp suggests something on the Talk screen, tap{" "}
            <strong>I&apos;ll try this</strong> and we&apos;ll track whether it helps you.
          </p>
          <Link href="/talk" className="mt-3 inline-flex min-h-tap items-center rounded-card border-2 border-primary px-5 font-semibold text-primary">
            Go to Talk
          </Link>
        </div>
      )}

      <div className="mt-3 space-y-4">
        {active.map((item) => (
          <TryingCard key={item.id} item={item} today={today} example={example} onStop={onStop} onTalk={onTalk} />
        ))}
      </div>

      {before.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            aria-expanded={showBefore}
            onClick={() => setShowBefore(!showBefore)}
            className="-ml-2 rounded-card-sm px-2 font-medium text-primary underline underline-offset-4"
          >
            Things you tried before
          </button>
          {showBefore && (
            <div className="mt-3 space-y-4">
              {before.map((item) => (
                <TryingCard key={item.id} item={item} today={today} example={example} onStop={onStop} onTalk={onTalk} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// One dot per answer: filled = Yes, half = A little, empty = Not really
function AnswerDot({ answer }: { answer: string }) {
  if (answer === "yes") return <span className="block h-4 w-4 rounded-full bg-primary" />;
  if (answer === "a_little") return <span className="block h-4 w-4 rounded-full border-2 border-primary" style={{ background: "linear-gradient(90deg, var(--color-primary) 50%, transparent 50%)" }} />;
  return <span className="block h-4 w-4 rounded-full border-2 border-primary" />;
}

function TryingCard({
  item, today, example, onStop, onTalk,
}: {
  item: TryingItem;
  today: string;
  example: boolean;
  onStop: (id: string) => Promise<boolean>;
  onTalk: (q: string) => void;
}) {
  const [kept, setKept] = useState(false);
  const r = tryingResult(item.feedback);
  const forText = item.for_symptom ? `For: ${symptomName(item.for_symptom)} · ` : "";

  return (
    <article className="rounded-card bg-surface p-5">
      <h3 className="font-semibold">{item.action}</h3>
      <p className="mt-1 text-helper text-text-muted">
        {forText}{item.active ? tryingFor(item, today) : "Stopped"}
      </p>

      {r.total > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex gap-1" aria-hidden="true">
            {item.feedback.map((f) => <AnswerDot key={f.date} answer={f.answer} />)}
          </span>
          <span className="text-helper">Helped on {r.helpful} of {r.total} {r.total === 1 ? "day" : "days"} you answered</span>
        </div>
      )}
      <p className={`mt-2 font-semibold ${LABEL_STYLE[r.label]}`}>
        {r.label}{r.label === "Seems to help" && <span aria-hidden="true"> ✓</span>}
      </p>

      {r.label === "Not helping yet" && (
        <div className="mt-2">
          <p>That&apos;s okay. Not everything works for everyone. Want to find something else to try?</p>
          <button
            type="button"
            onClick={() => onTalk(item.for_symptom ? `What else can I try for ${symptomLower(item.for_symptom)}?` : "What else can I try?")}
            className="mt-2 rounded-card border-2 border-primary px-5 font-semibold text-primary"
          >
            Find another idea
          </button>
        </div>
      )}

      {item.active && !example && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {kept ? (
            <span className="font-medium text-primary" aria-live="polite">Great</span>
          ) : (
            <button type="button" onClick={() => setKept(true)} className="rounded-card-sm bg-background px-5 font-medium">
              Keep trying
            </button>
          )}
          <button type="button" onClick={() => onStop(item.id)} className="rounded-card-sm px-4 text-text-muted underline underline-offset-4">
            Stop
          </button>
        </div>
      )}
    </article>
  );
}

// ---------------- Section 5: gentle support card ----------------
function SupportCard({ onClose, onTalk }: { onClose: () => void; onTalk: () => void }) {
  return (
    <section className="relative mt-10 rounded-card border-l-4 border-gentle bg-background p-5 pr-14 shadow-[inset_0_0_0_1px_var(--color-surface)]" aria-labelledby="support-heading">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute top-1 right-1 flex h-tap w-tap items-center justify-center rounded-card-sm text-text-muted">
        <span aria-hidden="true" className="text-2xl leading-none">×</span>
      </button>
      <h2 id="support-heading" className="text-xl font-semibold">It&apos;s been a hard stretch.</h2>
      <p className="mt-2">
        You&apos;ve had many tough days lately. That&apos;s a lot to carry, and you don&apos;t have to carry it alone.
        It may really help to talk to a doctor, or to someone you trust at home.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <Link href="/doctor" className="flex min-h-tap items-center justify-center rounded-card bg-primary px-5 font-semibold text-white">
          Prepare for a doctor visit
        </Link>
        <button type="button" onClick={onTalk} className="rounded-card border-2 border-primary px-5 font-semibold text-primary">
          Talk about it
        </button>
      </div>
      <p className="mt-4">
        If you ever feel you can&apos;t cope, you can call <strong>Tele-MANAS</strong> for free at{" "}
        <a href="tel:14416" className="font-semibold text-primary underline underline-offset-4">14416</a>, any time.
      </p>
    </section>
  );
}

// ---------------- Empty state (fewer than 4 check-ins ever) ----------------
function EmptyState({ count, onExample }: { count: number; onExample: () => void }) {
  return (
    <section className="mt-8 rounded-card bg-surface p-5" aria-labelledby="grow-heading">
      <h2 id="grow-heading" className="text-xl font-semibold">Your patterns will grow here</h2>
      <p className="mt-2">
        Every time you check in on Home, LaterUp learns a little more about your days. After about a week,
        you&apos;ll start to see what&apos;s affecting you, and what&apos;s helping.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className={`block h-4 w-4 rounded-full ${i < count ? "bg-accent" : "border-2 border-accent/50"}`} />
          ))}
        </span>
        <span className="text-helper">{Math.min(count, 7)} of 7 check-ins to your first pattern</span>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <Link href="/home#checkin" className="flex min-h-tap items-center justify-center rounded-card bg-primary px-5 font-semibold text-white">
          Check in now
        </Link>
        <button type="button" onClick={onExample} className="rounded-card border-2 border-primary px-5 font-semibold text-primary">
          See an example
        </button>
      </div>
    </section>
  );
}
