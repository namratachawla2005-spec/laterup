# LaterUp: build progress

Last updated: **7 October 2026, Day 2 (afternoon)**. Deadline: **8 October 2026**.
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
| About LaterUp (public) | Done (user request) | `app/about/page.tsx` |
| Plans (public, pricing only, no payments) | Done (user request) | `app/plans/page.tsx` |
| Logo, motifs, illustrations | Done (user request) | `components/Logo.tsx`, `app/icon.svg`, `components/MotifBackground.tsx`, `components/HomeWoman.tsx` |
| Live site | Deployed, auto-deploys from `main` | https://laterup.vercel.app |

GitHub: `namratachawla2005-spec/laterup` (private).

## Still to do (Day 2 evening / 8 Oct)

1. **Switch the live site to Claude Haiku** (user, in Vercel): add `ANTHROPIC_API_KEY`, set `MAX_ANSWER_TOKENS` = `500`, Redeploy. Set a monthly spend limit in the Anthropic console.
2. **Haiku quality pass:** run the quality questions against the live site and read every answer. Check especially: no stage naming, no profile echo, follow-ups in her voice, cancer/HRT handling, emergency path.
3. **Phone test on the live link**, every page.
4. **Submission note** (BUILD-SPEC section 14), including About, Plans, pricing, illustrations.
5. Native Hindi speaker checks the Doctor Prep Hindi starter.
6. No new features after 6 pm.

Open small decisions: WhatsApp share (wa.me link vs phone share menu); About page is 157 words (user's limit was 150).

## Things the user must do (Claude can't)

- [ ] Vercel → Settings → Environment Variables: `MAX_ANSWER_TOKENS` = `500`, add `ANTHROPIC_API_KEY`, then Redeploy.
- [ ] Anthropic console: set a monthly spend limit.
- [ ] Have a native Hindi speaker check the Doctor Prep Hindi text.
- [x] Signup slots for reviewers: `max_signups` raised from 5 to **7** in `app_config` (7 Oct). Only the user's own account exists, so 6 slots are free. Delete any new test accounts before submitting.

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
| `allowedDevOrigins: ["192.168.1.5"]` in `next.config.ts` | Lets a phone on home wifi open the dev server. Update if the laptop's IP changes (was .8 on Day 1). |

## Day 2 decisions

| Decision | Why |
|---|---|
| Doctor Prep saves to her `doctor_prep` row (Supabase), not the device | BUILD-SPEC: "saved on her device" means her own rows. No AI on the page. |
| Sleep and energy lines in the summary: "Sleep: well 6, on and off 4, barely 4 (14 nights noted)" | Brief has no copy for these; plain counts a doctor can read. |
| Meena's "mention first" example is a long, heavy period, not spotting after periods stopped | The brief's sample contradicts Meena's "irregular periods" story. |
| Print fits one A4 page by dropping the oldest "own words" notes first | Brief section 8; mention-first and questions always kept. |
| "Remove" on a doctor note deletes it (inline confirm); the toggle only hides it from the summary | Brief gives both a toggle and Remove. |
| WhatsApp uses a wa.me link (summary in WhatsApp's link, only after "Share anyway") | Brief behaviour. Alternative: phone share menu. User to choose. |
| **No emojis anywhere** in the app (removed 👀, 📅, 🌿; check-in thanks is "Thanks for checking in!") | User request. |
| Logo: thin-line sunrise (terracotta sun, teal horizon) beside the wordmark; bolder version as the tab icon (`app/icon.svg`) | User chose sunrise from 4 options. |
| Welcome sub line adds "For women in the years before, during and after menopause." | User request; brief updated to match. |
| Page motifs (`MotifBackground`): rangoli corners on Welcome; teal leaves on Sign up, Log in, About, Plans; teal waves on Home, Talk, Patterns, Doctor Prep, Settings, Help, SOS (beside a heading on phones, side margins on wide screens) | User request. Decorations must never come near text: leaves only in the top-right corner on phones, other sprigs only where margins are empty; measured at 5 widths. |
| One illustrated woman (`HomeWoman`): sari, bindi, bun, teal pallu. Home scene follows the time of day (chai, reading, music, asleep); Talk: thinking with a "?" bubble; Patterns: teal butterflies; Doctor Prep: talking with a doctor | User request. Yoga and garland tried and rejected. Not in print view. |
| More teal: Help me understand / Send buttons show a teal outline when empty; suggested-question cards have teal borders and arrows; lock icon teal | User felt the page lacked teal. |
| About page: sunrise over title, two jaali dividers, faint leaves; founder line "by a 20-year-old who has watched her mother and countless other women live with pain, and wishes to see them more energetic and happy" | User wording. 157 words vs the user's 150 target; user to decide. |
| Plans: Free (Patterns, Doctor Prep, try-and-track, Hindi starter); Plus **₹299/month or ₹2,499/year** ("A higher daily limit for questions on Talk", 4-week programmes, yoga/breathing/sleep, gynaecologist Q&A, coach chat, partner gynaecologist visits); workplaces and clinics. No payments; "Coming soon" / "Contact us" labels | User request. "Seems to help" wording kept (patterns are observations). Pricing from cost analysis: Haiku ≈ ₹0.40 per question; ₹149 ran at a loss once GST, fees and coaching were counted. |

## How to run and test

- `npm run dev` → http://localhost:3000. The user reviews in VS Code's **Simple Browser** (right side): after each change, tell her which URL to open and what to look at.
- Local AI: `AI_PROVIDER=ollama` in `.env.local` (Qwen on the desktop at `192.168.1.4:11434`, home wifi only; was .6 on Day 1). Vercel uses `anthropic`.
- Phone: use the live site (https). The dev server over LAN shows "Not secure".
- Testing approach: headless Edge driven over the DevTools protocol from small Node scripts in the session scratchpad (throwaway accounts created with the service role key, deleted afterwards). Pure rules (`lib/patterns.ts`, `lib/answers.ts`, `lib/safety.ts`) were tested by copying `lib/*.ts` to a scratch folder with `.ts` import suffixes and running with Node's type stripping. No Python on this laptop.

## Known limitations

- First Talk question after a long break may show the fallback locally (Qwen waking up). Tap Try again. Not an issue on Haiku.
- Talk "Recent" shows the last 5 conversations only.
- Off-topic detection on the device is a short word list; the model handles the rest.
