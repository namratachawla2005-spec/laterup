/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
"use client";

// One LaterUp answer: the same 4 parts, in the same order, every time.
// (docs/pages/03-talk.md, Sections 6, 10 and 11)
import { useState } from "react";
import Link from "next/link";
import type { Answer } from "@/lib/answers";
import WellnessNote from "@/components/WellnessNote";

export type TryResult = "added" | "limit" | "error";

type Props = {
  answer: Answer;
  seeDoctorSoon: boolean;
  byAI: boolean; // false for LaterUp's pre-written answers
  animate: boolean; // only new answers fade in; reopened ones show at once
  onTry: (action: string) => Promise<TryResult>;
  onSaveNote: () => Promise<boolean>;
  onHelpful: (helpful: boolean) => void;
  onFollowUp: (question: string) => void;
};

const cardClass = "rounded-card bg-surface p-5";
const titleClass = "text-[1.0625rem] font-semibold text-accent";

export default function AnswerView({ answer, seeDoctorSoon, byAI, animate, onTry, onSaveNote, onHelpful, onFollowUp }: Props) {
  const [showMore, setShowMore] = useState(false);
  const [tried, setTried] = useState<Record<string, TryResult>>({});
  const [noteState, setNoteState] = useState<"idle" | "saved" | "error">("idle");
  const [helpful, setHelpful] = useState<"ask" | "thanks" | "hoping" | "done">("ask");
  const [hoping, setHoping] = useState("");

  // Cards appear one after another, 150 ms apart (off with "reduce motion")
  const fade = (position: number) =>
    animate ? { className: "soft-in", style: { animationDelay: `${position * 150}ms` } } : { className: "", style: {} };

  async function tryIt(action: string) {
    const result = await onTry(action);
    setTried((t) => ({ ...t, [action]: result }));
  }

  const doctorFade = fade(seeDoctorSoon ? 1 : 4);
  const doctorCard = (
    <section
      style={doctorFade.style}
      className={`${cardClass} ${doctorFade.className} ${seeDoctorSoon ? "border-l-4 border-gentle" : ""}`}
    >
      <h3 className={titleClass}>{seeDoctorSoon ? "Please see a doctor soon" : "Talk to a doctor if"}</h3>
      <ul className="mt-2 space-y-2">
        {answer.seeDoctorIf.map((sign) => (
          <li key={sign} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-text" />
            <span>{sign}</span>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="space-y-4">
      {/* 1. I hear you: plain text, no card */}
      <p style={fade(0).style} className={`text-[1.25rem] leading-relaxed ${fade(0).className}`}>{answer.hearYou}</p>

      {seeDoctorSoon && doctorCard}

      {/* 2. What's likely happening */}
      {answer.whatsHappening && (
        <section style={fade(2).style} className={`${cardClass} ${fade(2).className}`}>
          <h3 className={titleClass}>What&apos;s likely happening</h3>
          <p className="mt-2">{answer.whatsHappening}</p>
        </section>
      )}

      {/* 3. One small thing to try */}
      {answer.tryThis.main && (
        <section style={fade(3).style} className={`${cardClass} ${fade(3).className}`}>
          <h3 className={titleClass}>One small thing to try</h3>
          <p className="mt-2">{answer.tryThis.main}</p>
          <TryButton result={tried[answer.tryThis.main]} onClick={() => tryIt(answer.tryThis.main)} />

          {answer.tryThis.more.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                aria-expanded={showMore}
                onClick={() => setShowMore(!showMore)}
                className="-ml-2 rounded-card-sm px-2 font-medium text-primary underline underline-offset-4"
              >
                More ideas
              </button>
              {showMore && (
                <ul className="mt-2 space-y-4">
                  {answer.tryThis.more.map((idea) => (
                    <li key={idea} className="border-t border-text/10 pt-4">
                      <p>{idea}</p>
                      <TryButton result={tried[idea]} onClick={() => tryIt(idea)} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {/* 4. Talk to a doctor if (at the top instead, when it's a warning sign) */}
      {!seeDoctorSoon && answer.seeDoctorIf.length > 0 && doctorCard}

      {answer.closingLine && <p style={fade(5).style} className={fade(5).className}>{answer.closingLine}</p>}

      {/* Actions */}
      {answer.whatsHappening && (
        <div className="flex flex-col gap-4 pt-1">
          {noteState === "saved" ? (
            <p className="font-medium text-primary" aria-live="polite">✓ Saved for your doctor</p>
          ) : (
            <button
              type="button"
              onClick={async () => setNoteState((await onSaveNote()) ? "saved" : "error")}
              className="self-start rounded-card border-2 border-primary px-5 font-semibold text-primary"
            >
              Add to my doctor notes
            </button>
          )}
          {noteState === "error" && <p className="text-helper">That didn&apos;t save just now. Please try again.</p>}

          <div aria-live="polite">
            {helpful === "ask" && (
              <div className="flex flex-wrap items-center gap-2">
                <span>Was this helpful?</span>
                <button type="button" onClick={() => { onHelpful(true); setHelpful("thanks"); }} className="rounded-card-sm bg-surface px-5 font-medium">Yes</button>
                <button type="button" onClick={() => { onHelpful(false); setHelpful("hoping"); }} className="rounded-card-sm bg-surface px-5 font-medium">No</button>
              </div>
            )}
            {helpful === "thanks" && <p className="text-text-muted">Thank you.</p>}
            {helpful === "hoping" && (
              <div>
                <label htmlFor="hoping" className="block">What were you hoping for?</label>
                <textarea
                  id="hoping"
                  rows={2}
                  maxLength={300}
                  value={hoping}
                  onChange={(e) => setHoping(e.target.value)}
                  className="mt-2 block w-full resize-none rounded-card-sm bg-surface px-4 py-3 focus:outline-none focus-visible:outline-3 focus-visible:outline-primary"
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setHelpful("done")} className="rounded-card-sm border-2 border-primary px-5 font-semibold text-primary">Send</button>
                  <button type="button" onClick={() => setHelpful("done")} className="rounded-card-sm px-4 text-text-muted underline underline-offset-4">Skip</button>
                </div>
              </div>
            )}
            {helpful === "done" && <p className="text-text-muted">Thank you for telling us.</p>}
          </div>
        </div>
      )}

      {/* Follow-up chips */}
      {answer.followUps.length > 0 && (
        <div className="pt-2">
          <p className="font-semibold">You could also ask:</p>
          <ul className="mt-2 space-y-2">
            {answer.followUps.slice(0, 3).map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onFollowUp(q)}
                  className="w-full rounded-card-sm border-2 border-surface px-4 py-2 text-left"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.whatsHappening &&
        (byAI ? (
          <p className="text-helper text-text-muted">
            Written by AI and checked for safety. LaterUp is a wellness guide, not medical advice.
          </p>
        ) : (
          <WellnessNote copyright={false} />
        ))}
    </div>
  );
}

function TryButton({ result, onClick }: { result?: TryResult; onClick: () => void }) {
  if (result === "added") {
    return <p className="mt-3 font-medium text-primary" aria-live="polite">✓ Added. We&apos;ll ask how it&apos;s going.</p>;
  }
  if (result === "limit") {
    return (
      <p className="mt-3" aria-live="polite">
        You&apos;re already trying 5 things. Want to stop one first?{" "}
        <Link href="/patterns" className="font-medium text-primary underline underline-offset-4">See them in Patterns</Link>
      </p>
    );
  }
  return (
    <>
      <button type="button" onClick={onClick} className="mt-3 rounded-card bg-primary px-5 font-semibold text-white">
        I&apos;ll try this
      </button>
      {result === "error" && <p className="mt-2 text-helper">That didn&apos;t save just now. Please try again.</p>}
    </>
  );
}
