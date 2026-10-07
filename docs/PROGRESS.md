# LaterUp: build progress

Last updated: **6 October 2026, end of Day 1**. Deadline: **8 October 2026**.
Read this with `CLAUDE.md` and `docs/BUILD-SPEC.md` before continuing.

## Where things are

| Item | Status | Where |
|---|---|---|
| Project setup, design tokens, fonts | Done | `app/globals.css`, `app/layout.tsx` |
| Supabase: tables, RLS, signup cap | Done, tested with 2 accounts | `supabase/schema.sql`, `supabase/002-checkin-sleep-energy.sql` (both run) |
| Sign up, Log in, Log out, login gate | Done | `app/signup`, `app/login`, `proxy.ts` |
| Brain connector (Ollama + Anthropic) | Done | `lib/brain.ts` |
| Page 1: Welcome and Intake | Done | `app/page.tsx`, `components/intake/` |
| Page 2: Home + Settings + delete account | Done | `app/home`, `app/settings`, `app/api/delete-account` |
| Page 3: Talk (safety, AI, 15 pre-written answers) | Done | `app/talk`, `app/api/understand`, `lib/safety.ts`, `lib/answers.ts`, `lib/prompt.ts` |
| Page 4: Patterns (with example mode) | Done | `app/patterns`, `lib/patterns.ts`, `lib/example.ts` |
| Richer check-in (sleep, energy, all symptoms) | Done (user request) | Home + Patterns + Talk |
| Page 5: Doctor Prep (with example mode) | Done, 56 browser checks passed | `app/doctor`, `lib/doctor.ts`, `components/doctor/`, `lib/example.ts` |
| Live site | Deployed, auto-deploys from `main` | https://laterup.vercel.app |

GitHub: `namratachawla2005-spec/laterup` (private). Last commit: "Richer daily check-in: sleep, energy and all symptoms".

## Day 2 plan (7 October)

1. **Page 5: Doctor Prep.** Reassurance line, "Please mention these first", summary with include/exclude toggles (About me, last 30 days incl. sleep and energy, own words, what I've tried, anything else), questions (3 general + up to 3 by symptom, max 8, add own), English / हिंदी conversation starter, which doctor to see, Show to doctor, Save as PDF / Print, WhatsApp + Copy with privacy reminder, after-visit notes, example mode (sharing disabled). Reuse `lib/example.ts` (Meena) and add example doctor notes there.
2. **Switch the live site to Claude Haiku:** user adds `ANTHROPIC_API_KEY` in Vercel, and changes `MAX_ANSWER_TOKENS` to `500` there (currently 300), then redeploy.
3. **Haiku quality pass:** run the 12 quality questions (script approach below) against Haiku and read every answer. Check especially: no stage naming, no "since you are seeing a doctor" style profile echo, follow-ups in her voice, cancer/HRT handling.
4. Optional: add 2 weeks of sample history so the user can see her own Patterns (user hasn't chosen: her account or a separate demo account; ask).
5. Phone test on the live link. Clear test accounts (Supabase → Authentication → Users) so reviewers have signup slots (cap is 5).
6. Submission note (BUILD-SPEC section 14). No new features after 6 pm.

## Things the user must do (Claude can't)

- [ ] Vercel → Settings → Environment Variables: `MAX_ANSWER_TOKENS` = `500`, add `ANTHROPIC_API_KEY`, then Redeploy.
- [ ] Anthropic console: set a monthly spend limit.
- [ ] Have a native Hindi speaker check the Doctor Prep Hindi text.
- [ ] Before submitting: delete test accounts in Supabase.

## Decisions made (and why)

| Decision | Why |
|---|---|
| Privacy copy changed from "stays on this device" to "saved securely to your private account. Only you can see it." (Promise 1, How we protect you, Q1 helper) | Login + Supabase made the brief's copy untrue. User approved. |
| "How we protect you" and "Delete my data" confirm open in place, not as pop-ups | CLAUDE.md: never pop-ups. |
| `MAX_ANSWER_TOKENS` 300 → **500** | Full JSON answers need 300 to 345 tokens; 300 cut them off. User chose 500 ("increase further if it adds value"). |
| Prompt additions in `lib/prompt.ts` (marked "MORE SAFETY RULES", "USING HER PROFILE NATURALLY", "FOLLOW-UP QUESTIONS") | Quality pass found: stage naming, "not a sign of cancer" reassurance, dose refusals being blocked, follow-ups written *to* her, profile facts echoed, "try this" = "see a doctor". Brief's prompt text kept unchanged; rules added. |
| Answer check (`answerProblems`) blocks amounts, pills, medicine names, stage naming, ruling illness in/out, promises; allows a plain "dose" in a refusal | Safety rules in CLAUDE.md. |
| Suggested questions go to the AI first; pre-written answer only if AI fails, is slow (15 s) or unsafe | BUILD-SPEC 3.2 / section 8. Pre-written answers never count against the 30/day cap. |
| Her name is added on the device after the AI answers | Name is never sent to the model. |
| Ollama `keep_alive: 60m` | Cold model load (~20 s) exceeded the 15 s limit. Dev only. |
| Patterns dots in rows of 7 (a week per row) | 48 px tap targets don't fit 10 to 15 dots across a phone. |
| Patterns insight 3 copy: "That's a real change worth noticing." (brief: "Whatever you're doing, it's working") | Patterns must never claim a cause. |
| Richer check-in: sleep (Well / On and off / Barely), energy (Low / Okay / Good), all 12 symptoms via "+ More" | User request. Wording is Claude's; the brief has none. One tap on Good/Okay/Tough still saves the day. |
| "What were you hoping for?" text (Talk, after "No") is not stored | No column for it; keeps her writing out of storage. Only helpful yes/no is saved. |
| `allowedDevOrigins: ["192.168.1.8"]` in `next.config.ts` | Lets a phone on home wifi open the dev server. Update if the laptop's IP changes. |

## How to run and test

- `npm run dev` → http://localhost:3000. The user reviews in VS Code's **Simple Browser** (right side): after each change, tell her which URL to open and what to look at.
- Local AI: `AI_PROVIDER=ollama` in `.env.local` (Qwen on the desktop at `192.168.1.6:11434`, home wifi only). Vercel uses `anthropic`.
- Phone: use the live site (https). The dev server over LAN shows "Not secure".
- Testing approach used today: headless Edge driven over the DevTools protocol from small Node scripts in the session scratchpad (throwaway accounts created with the service role key, deleted afterwards). Pure rules (`lib/patterns.ts`, `lib/answers.ts`, `lib/safety.ts`) were tested by copying `lib/*.ts` to a scratch folder with `.ts` import suffixes and running with Node's type stripping. No Python on this laptop.

## Known limitations

- First Talk question after a long break may show the fallback locally (Qwen waking up). Tap Try again. Not an issue on Haiku.
- Talk "Recent" shows the last 5 conversations only.
- Off-topic detection on the device is a short word list; the model handles the rest.

## Day 2 decisions

| Decision | Why |
|---|---|
| Doctor Prep saves to her `doctor_prep` row (Supabase), not the device | BUILD-SPEC: "saved on her device" means her own rows. No AI on the page. |
| Sleep and energy lines in the summary: "Sleep: well 6, on and off 4, barely 4 (14 nights noted)" | Brief has no copy for these; plain counts a doctor can read. |
| Meena's "mention first" example is a long, heavy period, not spotting after periods stopped | The brief's sample contradicts Meena's "irregular periods" story. |
| Print fits one A4 page by dropping the oldest "own words" notes first | Brief section 8; mention-first and questions always kept. |
| "Remove" on a doctor note deletes it (inline confirm); the toggle only hides it from the summary | Brief gives both a toggle and Remove. |
| WhatsApp uses a wa.me link (summary in WhatsApp's link, only after "Share anyway") | Brief behaviour. Alternative: phone share menu. User to choose. |
