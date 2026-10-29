# QikParcel traffic protection — 29 October 2026

## Why it was deferred

Lovable Cloud has no standard application rate-limiting primitive. The owner initially declined a custom implementation, then explicitly authorised it in the next request. A custom durable implementation is now deployed; it is not a provider-wide firewall or proof that a visitor is human.

## Configurable defaults

| Endpoint group | Server-wide ceiling | Supplemental identifier budget |
| --- | --- | --- |
| AI chatbot messages | 120 requests / 60 seconds | 12 / 60 seconds per chat-token hash; 20 / 60 seconds per validated account; 120 / 60 seconds per network hint |
| Leads, quote requests, guided-chat submissions and onboarding registrations | Shared 60 requests / 60 seconds | Shared 5 / hour per normalised phone hash; 10 / hour per validated account; 60 / minute per network hint |
| Authenticated email-template previews | Shared 10 renders / 60 seconds | Valid server credential required before rendering |

Settings come from three places, in this order: a ceiling saved by the owner in the admin dashboard, then a server environment variable (e.g. `QP_LIMIT_CHAT_GLOBAL_COUNT`, `QP_LIMIT_CHAT_GLOBAL_SECONDS`, `QP_LIMIT_LEAD_CONTACT_COUNT`, `QP_LIMIT_LEAD_CONTACT_SECONDS`; other scope names follow the same pattern), then the built-in default above. Positive integers 1–100000 only, windows 1–86400 seconds; anything else falls back rather than widening a limit. No request/body value controls a ceiling.

## Owner-managed limits

The admin dashboard's **Limits** tab lists every ceiling the server would actually enforce and lets a team member with admin access retune it without a redeploy.

- Saved values live in `public.traffic_limit_settings`; daily throttle counts live in `public.traffic_limit_blocks`. Both tables have row-level security enabled with no policies and their `anon`/`authenticated` grants revoked, so only the service role can read or write them.
- Reads and writes go through the `manage-limits` function, which requires a validated team session plus `has_role(uid,'admin')`; a visitor cannot read, widen or remove a ceiling from the browser.
- The limiter caches saved values for at most 15 seconds, so a saved change takes effect within about 15 seconds. If the saved-value read fails, the limiter keeps the last known values and still enforces them; it never drops a limit.
- Each throttled request increments one row per endpoint, scope and day (`record_traffic_block`, service-role execute only), which the dashboard shows as "Throttled (7 days)" so the owner can see whether a ceiling is turning visitors away.
- A ceiling for a scope the endpoint never checks (e.g. a contact limit on email previews) is rejected rather than stored, so a saved row can never silently do nothing.
- Unit-tested in `src/test/traffic-rules.test.ts` (precedence and rejection of unsafe saved rows) and `src/test/admin-limits.test.ts` (dashboard form validation and sending only edited rows).


## Enforcement

- Atomic database transactions and row locks enforce counters across function instances and concurrent requests. Counters store peppered hashes, not raw phones, account IDs or network hints. Direct public counter access and execution are revoked; row-level security is enabled.
- Global checks precede parsing/model calls. Contact checks precede contact/lead/registration writes and email delivery. Lead/quote/registration form variants share budgets.
- Account IDs come only from server `getUser` validation. Chat tokens/contact numbers can be changed by a visitor and are **supplemental**, not authoritative person identities.
- Forwarding headers have no verified authenticity guarantee on every deployed path. Network limits are advisory defense in depth; the global budget remains enforced even when session, phone or headers change. This protects the configured endpoint ceiling, not individual identity uniqueness.
- HTTP 429 includes Retry-After, a retry delay and WhatsApp support; counter-service failure returns 503 and does not proceed with costly work. Denied requests do not consume other successful-request budgets.
- Existing honeypots reject nonempty bot fields server-side. These are basic spam filters, not CAPTCHA. Direct onboarding insert permission is revoked and the form now uses server validation/limiting.
- The managed signed auth-email hook retains the SDK signature/replay/retry contract; it is not arbitrarily globally throttled, to avoid breaking legitimate recovery/confirmation delivery. Its credential-protected preview is throttled. Auth endpoint limits are provider-managed and separate.

## Verified versus not verified

**Tested:** custom live counters and 429 responses; anonymous counter/RPC and direct onboarding-write denial; email preview unauthorised requests rejected; existing private lead/chat/bookings reads denied; chat-session ownership checks; server schema validation.

**Not established:** a project-specific hosting/CDN rate-limit configuration; WAF/bot challenge/Turnstile; authentic client-IP provenance; provider quotas as application abuse protection; live account-specific limit behaviour (requester sign-in unavailable); authorised email-preview burst behaviour (server credential not available to browser tests); hosted Auth CAPTCHA/rate settings. No AI-provider 429 was deliberately provoked—its error handling is not a substitute for our controls.

Supabase documentation describes Auth-specific limits and offers custom Edge Function rate-limit/Turnstile examples; none establishes a verified provider-wide limiter for these custom endpoints:
- https://supabase.com/docs/guides/auth/rate-limits
- https://supabase.com/docs/guides/functions/examples/rate-limiting
- https://supabase.com/docs/guides/functions/examples/cloudflare-turnstile

## Live test results

- Concurrent chat session burst: 16 calls, exactly 12 passed the limiter (then returned validation 400), 4 returned 429 with Retry-After 60. No paid model calls.
- Two independent sessions sharing the same forwarding hint both passed the limiter. This checks sharing behaviour, not header authenticity or a guarantee under aggregate overload.
- 125 calls rotating chat tokens and forwarding values still reached 429; 52 reached validation and 73 were throttled in the observed run. Existing shared/network traffic consumed part of the window; no counters were cleared to manufacture a result.
- Six repeated valid lead submissions: 5 saved, sixth 429. Readback confirmed exactly five temporary leads; no sixth reference or save. Valid quote request for the same contact also returned 429. The first quote test used an invalid consent field and was corrected/retested.
- Anonymous attempt to supply a larger limiter budget through the limiter RPC: 401. Direct counter writes and direct registration inserts: 401.
- Unauthorised email-preview endpoints: 401 before rendering.
- Live browser: exhausted chat session displayed “Too many requests” with a 60-second retry and WhatsApp contact. Normal requests passed again after the burst window.
- Protected registration endpoint saved a real test entry, read back with marketing consent false; same-contact registration after exhausting the lead budget returned 429. Temporary lead/contact/registration test rows removed by ID, traffic counters not cleared.
- Full unit/regression suite: 79 tests passed across 9 files. Initial live limiter tests failed closed (503) due to a SQL clock-name type conflict; corrected migration and all foregoing live checks rerun.

## Cost and services

- No new paid external service or subscription was introduced. Uses the existing Lovable Cloud database/functions; no additional user API key is required.
- Each chat attempt uses one limiter RPC; a validated lead/registration uses two (global then contact). Account validation adds an Auth lookup only for a non-public bearer token. RPCs perform bounded row-lock/upsert work; model/email costs are avoided for rejected requests.
- Fixed additional third-party subscription cost: **none introduced**. Cloud execution/database usage and allowed AI/email requests still consume the existing plan/balance. Exact pounds/month and this conversation’s implementation-credit charge cannot be verified from these tests; they depend on traffic, compute plan and credit billing. No fabricated development invoice or savings estimate.
- Ongoing maintenance: monitor blocked/error counts, tune server limits and review contention/storage as traffic grows. Expired counters are cleaned in batches on successful requests after a day; cleanup is opportunistic, not a guaranteed retention schedule.

## Remaining boundaries before launch

The limiter bounds admitted work; it does not stop volumetric DDoS or distributed bots from exhausting the global quota and affecting legitimate users. A trusted proxy/WAF plus server-verified CAPTCHA would strengthen per-person/network protection but needs separately configured services. Account-specific and authorised-preview live acceptance remain unverified. Secure booking verification, external app/payment/tracking checks and owner-email delivery remain separate launch blockers. Website presentation changes still require publication.