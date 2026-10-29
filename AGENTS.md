# Project rules

- Lead forms submit only through the `submit-lead` edge function; lead tables have no anon access. Why: validation, priority and dedupe must run server-side.
- Lead priority logic lives in `supabase/functions/_shared/priority.ts` and is unit-tested from `src/test`. Why: one source of truth for the function and the tests.
- Admin access is via `user_roles` + `has_role`; the team email is auto-granted admin by a trigger on `auth.users`. Why: roles must never live in client storage or profile data.

- The website chatbot streams from the `chat` edge function, which alone writes `chat_conversations` (admin read-only). Why: AI key and visitor data stay server-side.
- Search Console verification lives in the root HTML head and the sitemap is served from public/sitemap.xml. Why: Google must fetch both directly from the published origin without client-side rendering.
- Authentication emails use the scaffolded managed auth-email-hook and shared templates; redeploy the hook after template edits. Why: managed delivery requires this handler contract and serves deployed templates.
- Enquiry notifications send through the managed template helper only after submit-lead saves the lead, with its ID as the idempotency key and a server-owned recipient; email failures must not reject saved enquiries. Why: visitor submissions remain safe while email delivery is unavailable.
- Team authentication is shared by the dedicated sign-in page and protected admin dashboard; validate users with getUser and roles with has_role. Why: navigation must not grant permissions.
- Website enquiry bookings are separate records, created and decided only through admin-checked database RPCs with atomic pending-only decisions; approval also marks the lead Booked. Why: decisions are auditable and cannot be overwritten by concurrent clients.
- Profiles store user-facing team names only and never roles. Why: self-edited profile data must not grant privileges.
- Website policies and chatbot policy facts share supabase/functions/_shared/policies.ts; redeploy chat after edits. Why: visitors and the assistant must receive the same approved statements.
- Chat safety is fail-closed in _shared/chat-safety.ts and submit-lead; chat trusts only server-saved history, has no financial/booking/identity tools, and uses forms for consented lead capture. Why: model text and browser tool results cannot authorise actions.
