-- =====================================================================
-- LaterUp: richer daily check-in (sleep + energy)
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once. Adds two optional columns; no data is changed.
-- Row Level Security on check_ins already covers the new columns.
-- =====================================================================

alter table public.check_ins
  add column if not exists sleep text check (sleep in ('well', 'on_off', 'barely'));

alter table public.check_ins
  add column if not exists energy text check (energy in ('low', 'okay', 'good'));

-- Done. You should see "Success. No rows returned".
