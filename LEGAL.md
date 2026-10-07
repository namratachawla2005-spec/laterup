# Copyright and Legal Notice: LaterUp

**Developer:** Namrata Chawla
**Application:** LaterUp, a private wellness companion for women in the years before, during and after menopause
**Live site:** https://laterup.vercel.app
**Repository:** private GitHub repository, shared on request
**Status:** Original work, shared confidentially for evaluation
**Last updated:** 7 October 2026

---

## Copyright

© 2026 Namrata Chawla. All rights reserved.

LaterUp, including its source code, design, illustrations, written content and the LaterUp name and sunrise logo, is the original work of Namrata Chawla. It was built for a campus placement assignment (Mosaic Wellness) and as a portfolio piece.

## No open-source licence

No open-source licence (such as MIT or Apache 2.0) is granted. Viewing the code or the live site does not give anyone the right to copy, modify, distribute or use it, except as described below.

### Permitted use

- Review and evaluation by the people it was shared with
- Assessment for placement or educational purposes
- Feedback and constructive critique

### Not permitted without written permission

- Copying, reproducing or redistributing the code, design or content
- Commercial use
- Removing or changing this notice
- Any use beyond evaluation

## What LaterUp is and is not

LaterUp is a wellness guide. It is not a doctor and not a medical device. It does not diagnose, does not recommend or name medicines, supplements or doses, and does not replace professional care. Every page says: "LaterUp is a wellness guide, not medical advice." In an emergency, users are directed to 112, and for mental health to Tele-MANAS (14416).

## How AI is used

- **Model in the live app:** Claude Haiku 4.5 (Anthropic API). It writes the answers on the Talk page only. No other page uses AI; Patterns and Doctor Prep are built from the user's own data with fixed rules.
- **Model in development:** a local open model (Qwen, via Ollama), used only on the developer's computer for free testing.
- **Why one connector:** all AI calls go through a single server file, so safety checks, limits and usage records stay the same whichever model answers.
- AI services are used within their providers' terms of service.

## AI safety guardrails (as built)

- **Emergency check first:** messages are checked for emergency or self-harm words on the phone and again on the server, before any AI call. Emergency messages are never sent to the AI and never saved; the user is shown 112 and Tele-MANAS 14416 instead.
- **Topic limits:** clearly off-topic requests get a gentle redirect without calling the AI.
- **Length limits:** questions up to 1,000 characters; answers have a hard length ceiling.
- **Answer checking:** every AI answer is checked before it is shown, for medicine names, doses and pill words, diagnosis or stage labels, ruling an illness in or out, and promises or cure claims. Answers that fail are not shown; a safe fallback is shown instead.
- **Written rules for the AI:** no diagnosis, no medicines or doses, hedged language ("may be linked"), a "Talk to a doctor if" section on every answer, and named helplines for very low mood.
- **Fallbacks:** if the AI is slow, unavailable or unsafe, the user sees a pre-written answer or a gentle fallback, never an error.
- **Usage and cost limits:** a cap on signups, a daily question cap per user (both changeable in the database), and a monthly spend limit on the AI account.

These safeguards reduce risk but cannot remove it. AI answers can still be imperfect, which is why every answer points to a doctor for anything that worries the user.

## Data privacy

- **Minimal data:** sign-up needs only an email and password. Intake questions are optional and skippable.
- **Private by default:** data is stored in Supabase (PostgreSQL) with Row Level Security on every table, so each user can read and write only her own rows.
- **Her name never goes to the AI.** Only minimal profile fields (such as age group and main concerns) are sent with a question.
- **No message text in usage logs:** the server records only token counts per question, never what the user typed.
- **Nothing health-related in web addresses or tab titles.**
- **Sharing only on her tap:** WhatsApp share and Copy on Doctor Prep show a privacy reminder first.
- **Delete my data:** Settings lets the user delete her account and every row she owns.
- **Consent:** users tick that LaterUp is a wellness guide, not medical advice, before intake.
- India's Digital Personal Data Protection Act, 2023, was considered in the design (minimal collection, consent, deletion). This demo has not been formally audited for compliance.

## Security

- All secrets (AI key, database service key) are stored as environment variables in the hosting platform and on the developer's computer only.
- No secrets are written in the code, and environment files are excluded from version control.
- Secret keys are used only in two server routes, never in the browser.

## Third-party services and assets

LaterUp is built with Next.js, React and Tailwind CSS, uses Supabase (authentication and database), Vercel (hosting) and the Anthropic API, and uses the DM Sans and Noto Sans Devanagari fonts from Google Fonts. Each is used under its own licence or terms. Helpline numbers and government websites listed in the app (SOS page) belong to their respective government services; LaterUp is not connected to them.

## Contact

For questions about usage rights or the project, contact Namrata Chawla at namrata.chawla.2005@gmail.com.
