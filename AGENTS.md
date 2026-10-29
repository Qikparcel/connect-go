# Project rules

- Lead forms submit only through the `submit-lead` edge function; lead tables have no anon access. Why: validation, priority and dedupe must run server-side.
- Lead priority logic lives in `supabase/functions/_shared/priority.ts` and is unit-tested from `src/test`. Why: one source of truth for the function and the tests.
- Admin access is via `user_roles` + `has_role`; the team email is auto-granted admin by a trigger on `auth.users`. Why: roles must never live in client storage or profile data.

- The website chatbot streams from the `chat` edge function, which alone writes `chat_conversations` (admin read-only). Why: AI key and visitor data stay server-side.
- Search Console verification lives in the root HTML head and the sitemap is served from public/sitemap.xml. Why: Google must fetch both directly from the published origin without client-side rendering.
- Authentication emails use the scaffolded managed auth-email-hook and shared templates; redeploy the hook after template edits. Why: managed delivery requires this handler contract and serves deployed templates.
- Enquiry notifications send through the managed template helper only after submit-lead saves the lead, with its ID as the idempotency key and a server-owned recipient; email failures must not reject saved enquiries. Why: visitor submissions remain safe while email delivery is unavailable.
- Team authentication is shared by the dedicated sign-in page and protected admin dashboard; validate users with getUser and roles with has_role. Why: navigation must not grant permissions.
- Website enquiry bookings are separate records with admin-checked RPCs and atomic pending-only decisions; database triggers currently block creation, approval and new Booked transitions until approved server-verified identity and operational eligibility workflows are connected. Why: admin access alone does not establish safe booking eligibility.
- Profiles store user-facing team names only and never roles. Why: self-edited profile data must not grant privileges.
- Website policies and chatbot policy facts share supabase/functions/_shared/policies.ts; redeploy chat after edits. Why: visitors and the assistant must receive the same approved statements.
- Chat safety is fail-closed in _shared/chat-safety.ts and submit-lead; chat trusts only server-saved history, has no financial/booking/identity tools, and uses forms for consented lead capture. Why: model text and browser tool results cannot authorise actions.
- Costly public requests use shared durable, atomic service-only traffic counters before model calls, lead writes or email rendering; global caps always apply and unverified IP/session/contact hints are supplemental only. Why: browser identifiers and forwarding headers can change, and per-instance memory counters race or reset.
- Registration submissions use submit-onboarding with server validation and the same lead/contact budgets; direct visitor inserts are revoked. Why: a direct database write path must not bypass endpoint throttling.
- Traffic ceilings are owner-editable from the admin dashboard through the manage-limits function; the limiter reads saved overrides from public.traffic_limit_settings (service-role only, RLS with no policies) before environment values and code defaults. Why: retuning a ceiling must not need a redeploy, while the browser must never widen a limit itself.
- Enquiry approve/reject decisions are dashboard actions that set status and write a lead_events audit row; they never create bookings. Why: booking safety stays database-blocked while ordinary triage remains usable by the team.
