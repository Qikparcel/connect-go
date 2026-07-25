# QikParcel Master Onboarding Form

One form for every channel — Zimfest, airports, golf days, churches, universities, Facebook ads,
WhatsApp QR codes and future expos. Everyone enters through the same door; the questions branch
based on who they say they are.

Live at **`/onboarding`**.

---

## Setup

Locally this is done — the table is live on **Qikparcel's Project** (`zleorpeqpbyttemxgedi`,
eu-west-1) and `.env` holds the URL and anon key.

`public.onboarding_submissions` has row level security enabled with a single policy: **anyone may
insert, nobody may read.** That split matters — the anon key ships inside the browser bundle, so
without it the entire lead list would be public. Read your leads through the Supabase dashboard or
a service-role key, never the anon key.

### Still to do: the deployed site

`.env` is gitignored, so production has no credentials yet. Set both variables in the hosting
environment (Lovable → Project Settings → Environment Variables):

```
VITE_SUPABASE_URL=https://zleorpeqpbyttemxgedi.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase → Project Settings → API>
```

Vite inlines these at build time, so **a rebuild is required after changing them** — setting the
variable alone will not update an already-built site. Until this is done the deployed form runs
normally but shows an error toast on submit.

### Re-running the migration elsewhere

The SQL in
[`supabase/migrations/20260725000000_onboarding_submissions.sql`](../supabase/migrations/20260725000000_onboarding_submissions.sql)
is idempotent (`if not exists` throughout), so it is safe to paste into the SQL Editor of any
other project — a staging environment, for example.

---

## QR codes and attribution

Point each printed QR code at a URL with a `src` parameter:

| Channel | URL |
|---|---|
| Zimfest stall | `https://qikparcel.com/onboarding?src=zimfest` |
| Airport flyer | `https://qikparcel.com/onboarding?src=airport` |
| WhatsApp broadcast | `https://qikparcel.com/onboarding?src=whatsapp` |
| Facebook ad | `https://qikparcel.com/onboarding?src=fb-launch` |

`src` is stored in its own column, separate from the "How did you hear about us?" answer. That
redundancy is deliberate: people misremember where they found you, and someone who scanned the code
at your Zimfest stall may still tick "Referral" because a friend walked them over. The `src` column
tells you which piece of print actually produced the scan; `heard_about` tells you what they
believe. Compare the two and you learn something either way.

---

## Flow

```
Step 1   How did you hear about QikParcel?     required, single choice
Step 2   Which best describes you?             required, tick all that apply
Step 3+  Branch sections, only those ticked, always in this order:
           Traveller → Sender → Business → Courier
Final    Your details + consent → Submit
```

Step count is dynamic. Tick Business only and it is 4 steps; tick Business + Traveller and it is 5;
tick all four and it is 7. The progress bar reflects the real total.

**Why contact details come last.** Someone who has already answered four screens is far more likely
to hand over a phone number than someone hit with it cold. Answers are written to `localStorage`
after every keystroke, so a dropped signal in a noisy hall does not lose the session.

**Why one form and not four.** A vendor who says *"I own a business and I also travel to Zimbabwe
every month"* ticks both boxes and walks through both sections once. With separate forms they would
fill in two, and most would fill in neither.

---

## Branch questions

| Branch | Fields |
|---|---|
| Traveller | Route (from → to), frequency, next trip *(optional)* |
| Sender | What you send, how often, route (from → to) |
| Business | Business name, what you sell (+ Other), send frequency, where you ship to, biggest challenge |
| Courier | Vehicle type, areas covered, availability, max capacity *(optional)* |

Courier was not in the original brief; it mirrors the shape of the other three so every branch feels
the same length.

---

## Reading the results

In the Supabase dashboard, `onboarding_submissions` sorts and exports to CSV directly. The columns
are flat rather than a JSON blob specifically so this works without unwrapping anything.

Useful queries:

```sql
-- Which channel is actually producing leads?
select heard_about, count(*) from onboarding_submissions group by 1 order by 2 desc;

-- Which printed QR code produced the most scans?
select source, count(*) from onboarding_submissions where source is not null group by 1 order by 2 desc;

-- Businesses, and what hurts most about their current delivery
select business_name, business_challenges, business_ships_to
from onboarding_submissions where 'Business' = any(roles);

-- People who are both a business and a traveller — your highest-value leads
select full_name, phone, business_name from onboarding_submissions
where roles @> array['Business','Traveller'];
```

---

## Structure

```
src/pages/Onboarding.tsx                       page shell
src/components/onboarding/OnboardingForm.tsx   step orchestration, persistence, submit
src/components/onboarding/schema.ts            options, zod validation, step registry
src/components/onboarding/fields.tsx           shared field primitives
src/components/onboarding/steps/*.tsx          one file per step
src/components/onboarding/submission.ts        form values → database row
src/integrations/supabase/client.ts            Supabase client
supabase/migrations/*.sql                      table + RLS policies
src/test/onboarding.test.ts                    branching + validation (18 tests)
src/test/onboarding-form.test.tsx              full walkthrough (6 tests)
```

**To add a question**, edit the relevant file in `steps/`, add the field to `schema.ts` (including
`STEP_FIELDS` so per-step validation picks it up), add the column in a new migration, and map it in
`submission.ts`.

---

## Known limits

- **Spam protection is a honeypot only.** It stops naive bots, not a determined human. If you start
  seeing junk, add Cloudflare Turnstile or move the insert behind an edge function. Not worth doing
  before you see abuse.
- **No duplicate detection.** The same person scanning twice creates two rows. Deduplicate on
  `phone` when exporting.
- **`traveller_next_trip` is free text**, not a date — people at a stall answer "not booked yet" or
  "sometime in August" more often than they pick a calendar date.
