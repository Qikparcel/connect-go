# Project rules

- Lead forms submit only through the `submit-lead` edge function; lead tables have no anon access. Why: validation, priority and dedupe must run server-side.
- Lead priority logic lives in `supabase/functions/_shared/priority.ts` and is unit-tested from `src/test`. Why: one source of truth for the function and the tests.
- Admin access is via `user_roles` + `has_role`; the team email is auto-granted admin by a trigger on `auth.users`. Why: roles must never live in client storage or profile data.

- The website chatbot streams from the `chat` edge function, which alone writes `chat_conversations` (admin read-only). Why: AI key and visitor data stay server-side.
