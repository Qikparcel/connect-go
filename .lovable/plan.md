# Ask QikParcel — guided chat assistant

Upgrade the existing Qik chat (no rebuild, no new booking engine, homepage and forms untouched).

## What visitors will see
- Floating green **Ask QikParcel** button (bottom-right, clear of the back-to-top button). Opens full-screen on phones, a panel on desktop.
- Welcome message with quick replies: Send a Parcel, I'm Travelling, Business Deliveries, How does QikParcel work?, Talk to our team.
- One question at a time, with quick-reply buttons, a progress bar, Back and Restart. Free text only for name, phone, business name and "Other".
- **Sender**: from → to → when → what → weight → name → WhatsApp → contact consent.
- **Traveller**: from → to → when (date picker if booked) → spare space → capacity → interested in earning → name → WhatsApp → consent.
- **Business**: business name → based in → delivery area → monthly volume → start time → name + WhatsApp → consent.
- Confirmation with first name, route and reference number, then next steps: Request a Quote / full form, Traveller Registration (app.qikparcel.com), WhatsApp QikParcel, Back to homepage. "Continue to Booking" links to app.qikparcel.com.
- Short privacy note; never asks for ID, bank details or parcel contents detail. No promises on prices, dates, matching, insurance or 24/7 support.
- Visitors can still type a question at any point; the AI answers FAQs, then brings them back to the step they were on.

## Saving leads
- Finished chats are saved through the existing lead pipeline as a normal lead with source "website_chat", so they appear in the admin dashboard with HOT / WARM / FUTURE priority and a WhatsApp follow-up button.
- Nothing is saved as a lead if the visitor leaves early.
- Priority follows the brief (e.g. sender ready now or within 3 days = HOT; traveller within 7 days with space = HOT; merchant starting immediately = HOT).

## Analytics
Track chat opened, role selected, qualification started, lead submitted, hot lead, booking click, traveller registration click and WhatsApp click.

## Not included
Automatic matching, escrow, payments, auto-approval or automated WhatsApp messages — the brief requires those to stay off until operational.

## Technical details
- Rewrite `ChatWidget.tsx` as a scripted step machine (config per role) with the existing AI chat as free-text fallback.
- Submit via `submit-lead` edge function (add `source: website_chat`, chat-specific fields into `details`, capacity/monthly volume/start-time mapped). Extend `_shared/priority.ts` for the chat answer values plus tests in `src/test/lead-priority.test.ts`.
- Add new event names to the `lead_events` insert policy allow-list (migration).
- Tests: three journeys, failed submission keeps answers, abandonment saves nothing, mobile layout check via Playwright.
