// The finished summary a doctor sees: in "Show to doctor" (large) and on paper (print).
// White background, charcoal text, one thin terracotta line under the title.
import type { Summary } from "@/lib/doctor";

export default function HealthSummary({ summary, print = false }: { summary: Summary; print?: boolean }) {
  const h2 = print ? "mt-3 text-[13pt] font-semibold" : "mt-8 text-[1.5rem] font-semibold";
  const list = print ? "mt-0.5" : "mt-1 space-y-1";
  const body = print ? "text-[11pt] leading-snug" : "text-[1.3rem] leading-relaxed";

  return (
    <article className={`text-text ${body}`}>
      {print && <p className="text-[11pt] font-semibold text-text">LaterUp</p>}
      <h1 className={`border-b-2 border-accent pb-2 font-semibold ${print ? "mt-1 text-[18pt]" : "text-[2rem]"}`}>
        Health summary
      </h1>
      <p className={`mt-2 text-text-muted ${print ? "text-[10pt]" : "text-[1.1rem]"}`}>Prepared {summary.prepared}</p>

      {summary.mentionFirst.length > 0 && (
        <section className={`${print ? "mt-4 border-2 p-3" : "mt-6 border-l-4 p-4"} border-text`}>
          <h2 className={`${h2} !mt-0`}>Please mention these first</h2>
          <ul className={list}>
            {summary.mentionFirst.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </section>
      )}

      {summary.sections.map((sec) => (
        <section key={sec.title}>
          <h2 className={h2}>{sec.title}</h2>
          {sec.intro && <p className="mt-1">{sec.intro}</p>}
          <ul className={list}>
            {sec.lines.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </section>
      ))}

      {summary.questions.length > 0 && (
        <section>
          <h2 className={h2}>Questions I&apos;d like to ask</h2>
          <ol className={`${list} list-decimal pl-6`}>
            {summary.questions.map((q) => <li key={q}>{q}</li>)}
          </ol>
        </section>
      )}

      <p className={`border-t border-text/30 pt-3 text-text-muted ${print ? "mt-5 text-[9.5pt]" : "mt-10 text-[1.05rem]"}`}>
        {summary.footer}
      </p>
    </article>
  );
}
