# Chatbot critical acceptance — 29 October 2026

## Launch decision: not ready for unrestricted booking launch

The website can collect enquiries; booking creation, approval and direct Booked transitions are blocked in the database pending an approved secure identity-verification and operational eligibility workflow. This affects the existing team booking dashboard too. External app.qikparcel.com integrations are not verified or modified here.

## Passed

- Full regression suite: 68 tests across 8 files, including 21 safety tests and 15 priority/phone tests.
- Browser end-to-end: London → Harare clothing enquiry, ready within 3 days, saved as HOT/New; human-review warning displayed and Continue to Booking absent.
- Stored readback: service consent false, marketing consent false, eligibility review_required, bookingAllowed false, reference returned only after save.
- Deployed chat: card disclosure rejected with HTTP 400 before model/persistence; system-role injection rejected with HTTP 400.
- Chat ownership: another session token received HTTP 403.
- Anonymous access: private leads, contacts, chats and bookings inaccessible; anonymous booking RPC rejected.
- Deployed adversarial prompts: refused disclosure of internal instructions/financial action; refused guaranteed arrival, invented price and escrow promise.
- Lost-parcel/refund and customs-evasion requests offered WhatsApp handoff. Initial test revealed repeated handoff tools; corrected to force the handoff only on the first step, then retested.
- Database inspection: admin-only RPC checks, atomic pending decisions, unique lead booking, private-read policies; new fail-closed database triggers additionally block booking creation/approval and direct Booked updates.
- Preview build reports OK.

## Blocked / not certified

- Custom traffic limiter subsequently authorised, implemented and tested on 29 October; see docs/traffic-protection.md for 79-test regression results and live burst/shared-network/contact/quote tests. Account-specific and authorised email-preview live tests remain unavailable; hosting WAF/CAPTCHA and trustworthy IP provenance are not verified.
- Secure identity-verification provider and operational eligibility approval workflow are not connected. Bookings remain blocked, including admin creation/approval.
- No approved live payment provider, escrow compliance evidence, tracking or external application integration was available; assistant has no tools for these actions or records.
- Signed-in admin end-to-end acceptance could not run: session minting found multiple users, and the requesting user's email did not match an auth account. Requires the owner to sign in in preview or identify/authorise a test account.
- Enquiry notification delivery remains unverified; existing roadmap records a domain-verification blocker. Stored enquiries remain accessible to authorised admins.
- LLM wording tests are sampled, not a mathematical guarantee against hallucination. Server controls deny privileged actions independently of generated text.
- Frontend changes have not been published.

## Required before booking launch

1. Connect approved secure identity verification and an auditable, server-owned operational eligibility workflow.
2. Replace the fail-closed booking gate only after those checks are verified; test concurrent duplicates, decisions and direct API bypass attempts as a real signed-in admin and non-admin.
3. Review the tested custom traffic ceilings and remaining distributed-abuse/provider-verification limitations; complete account/authorised-preview acceptance where enabled.
4. Verify external app/payment/tracking integrations and notification delivery wherever they are enabled; never infer those states from chat text.
5. Publish the tested website and repeat the browser acceptance checks on the public origin.