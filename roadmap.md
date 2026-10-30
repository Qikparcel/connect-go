# Roadmap

- [x] Deploy fail-closed chatbot and enquiry safeguards, service-consent audit, documents-only screening, server-trusted history and financial/booking tool restrictions; 68 tests passed and public chat/enquiry flows verified. Frontend awaits publication.
- [x] Run critical pre-launch acceptance tests; report in docs/chatbot-acceptance.md. Live privacy, customs, payment claims, ownership, anonymous access, saved enquiry readback and human handoff verified; temporary records removed.
- [ ] Enable safe booking handoff/approval: blocked until approved secure verification and operational eligibility workflow are connected; booking creation, approval and direct Booked updates are currently database-blocked.
- [x] Complete signed-in admin acceptance: signed in as an approved admin account; dashboard tabs render, enquiry approve/reject write audit rows, chat history search filters, and a dashboard-saved ceiling was enforced by the limiter (second request in one visitor session returned 429). Temporary records removed.
- [x] Deploy configurable durable limits for chat, leads/quotes, registrations and authorised email previews; 79 tests passed, burst/rotated-ID/shared-network/repeated-contact/quote/registration/readback/retry-UI tests verified. Costs and provider limitations in docs/traffic-protection.md. No new service introduced; presentation awaits publication.
- [ ] Finish account-specific and authorised email-preview live limit tests: blocked by unavailable authorised test session/server credential; provider WAF/CAPTCHA/IP provenance remain unverified.

- [x] Add uploaded sender/recipient and courier/traveller agreement statements to the Terms page and chatbot facts; align FAQ insurance guidance; Terms preview and deployed chatbot answer verified. Website changes await publication.

- [x] Dedicated team sign-in page, stored team profiles, and separate admin dashboard with booking approval from website enquiries — signed-in creation/approval/Booked readback verified; temporary test records removed; 47 tests passed. Frontend not yet published.

- [x] Submit a live Ask QikParcel sender test and verify its details in the signed-in admin dashboard; remove test enquiry afterward.
- [x] Wire and deploy enquiry notifications from admin@qikparcel.com to admin@qikparcel.com for all enquiry forms and guided chat; live sender test saved successfully and was removed afterward.
- [ ] Confirm enquiry email delivery after notify.qikparcel.com DNS verification (test send currently blocked with domain_not_verified).

- [x] Clear validation + submission errors on enquiry forms
- [x] Fix contact-overwrite security issue, then publish
- [ ] AI lead review in admin dashboard: classify each enquiry + recommend next step
- [ ] Footer social links (waiting on real handles)
- [ ] Slack alert on each new lead (type + dashboard link)
- [x] Conversational chat assistant upgrade (spec: QIKPARCEL_-_IMPLEMENT_A_CONVERSATIONAL_LEAD): one-question-at-a-time sender/traveller/merchant qualification with quick replies, reference confirmation, WhatsApp handoff, chat analytics; extend existing Qik chat + submit-lead path rather than rebuilding. Needs plan approval first.
- [x] Publish latest changes (live verification tag and sitemap confirmed).
- [x] Finish Google Search Console verification and submit the published site's sitemap (owner access confirmed; Google downloaded sitemap with zero errors/warnings).
- [x] Admin dashboard: approve/reject enquiries with audit events, searchable chat history tab, and owner-managed chatbot/enquiry traffic limits through manage-limits (saved overrides, throttle stats, service-role-only tables); 28 limit tests passed. Signed-in approve/reject, chat search, limit save and saved-ceiling enforcement verified in preview; publication pending.
- [x] Track enquiry/WhatsApp/traveller clicks per Zimbabwe corridor page; Route interest admin tab verified signed in
- [x] Harare–Johannesburg FAQ page linked from Zimbabwe and route pages (publish pending)
- [ ] Zimbabwe pricing page: blocked until owner supplies approved prices (show pricing first)
