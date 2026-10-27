# Project rules

- Lead forms submit only through the `submit-lead` edge function; lead tables have no anon access. Why: validation, priority and dedupe must run server-side.
- Lead priority logic lives in `supabase/functions/_shared/priority.ts` and is unit-tested from `src/test`. Why: one source of truth for the function and the tests.
- Admin access is via `user_roles` + `has_role`; the team email is auto-granted admin by a trigger on `auth.users`. Why: roles must never live in client storage or profile data.

- The website chatbot streams from the `chat` edge function, which alone writes `chat_conversations` (admin read-only). Why: AI key and visitor data stay server-side.
- Search Console verification lives in the root HTML head and the sitemap is served from public/sitemap.xml. Why: Google must fetch both directly from the published origin without client-side rendering.
- Authentication emails use the scaffolded managed auth-email-hook and shared templates; redeploy the hook after template edits. Why: managed delivery requires this handler contract and serves deployed templates.
- Enquiry notifications send through the managed template helper only after submit-lead saves the lead, with its ID as the idempotency key and a server-owned recipient; email failures must not reject saved enquiries. Why: visitor submissions remain safe while email delivery is unavailable.
