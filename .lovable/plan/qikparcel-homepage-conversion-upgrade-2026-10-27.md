# QikParcel homepage conversion upgrade

## Audit: what the site has today
- Homepage: Navbar (new logo), Hero ("Delivery, Reimagined"), Senders / Travellers / Business / Trust / Mission sections, Final CTA, Footer, bottom pilot banner, back-to-top button, dark mode.
- An existing `/onboarding` sign-up form already saves to your own connected database (one `onboarding` table, public insert only). It is kept and reused for its validation and saving pattern.
- No WhatsApp link, admin area, Privacy/Terms/Prohibited Items pages, analytics or booking flow exist on this site. Booking and registration live in app.qikparcel.com.
- The copy now claims "Escrow Protected", "ID Checked", "AI Verified", "verified travellers". Your brief says to remove these unless they work today. They will be softened.

## Current to proposed
1. **Hero**: headline "SEND PARCELS. EARN WHEN YOU TRAVEL.", the new supporting text, and three large buttons: SEND A PARCEL / I'M TRAVELLING / I'M A MERCHANT. Logo and brand stay. Unverified trust badges come out.
2. **Three short forms in a pop-up**, opened by each button. Each form has 2 steps (about you → trip/parcel details), uses the exact fields in your brief, has consent unticked, and needs no account.
3. **Thank-you screen** with a reference number (e.g. QP-7K3D9A):
   - Sender: "Request a Quote on WhatsApp" (no booking flow on this site is confirmed to work).
   - Traveller: "Continue registration" → app.qikparcel.com.
   - Merchant: "WhatsApp Business Enquiry".
   WhatsApp messages include only the reference and the route, never contact details.
4. **How it works**: rewritten to your 3 steps, featured London ↔ Harare and London ↔ Johannesburg, with other routes kept and no promises of guaranteed delivery.
5. **Footer**: WhatsApp contact, links to Privacy Policy, Terms and Prohibited Items (simple placeholder pages until you send the legal text), and the bottom-banner overlap fixed.
6. **Lead dashboard** at `/admin`, sign-in required, admins only: lists of senders, upcoming traveller departures, luggage space, merchants, HOT/WARM/FUTURE badges, route filter, status and owner changes, a WhatsApp follow-up button, and simple counts (leads → booked).
7. **Analytics**: records page visits, button clicks, form starts and submissions, and saves the campaign source/UTM tags with each lead.

## Database changes (added to your existing database, nothing deleted)
- `lead_contacts`: one row per person, matched by WhatsApp number, so there are no duplicate people.
- `leads`: one row per request or trip, linked to a contact: type, route, dates, urgency, weight/space, consent, UTM, priority, status (New/Contacted/Qualified/Matched/Booked/Lost), owner, reference, timestamps.
- `lead_events`: anonymous analytics events.
- `user_roles` + an admin check, so only admins can read leads.
- Priority is set on the server: HOT = parcel ready now, traveller leaving within 48h/7 days with stated space, or merchant needing service immediately. WARM = within 30 days. FUTURE = exploring/no trip.
- Visitors can only submit, never read. Submissions go through a secure server function that checks every field, uses a hidden spam trap, and limits each phone number/IP to 5 submissions per hour. The private service key stays on the server.

## Needs from you
- Running server functions and admin sign-in on your own connected database requires deploying them there. The alternative is moving lead capture to Lovable Cloud. I'll confirm which applies before building.
- Admin email(s) to give dashboard access.
- Real Privacy, Terms and Prohibited Items text (placeholders until then).

## Testing
Tests for priority rules and form validation. Then all three forms checked on phone and desktop, including bad input, duplicates and a failed connection, and a check that the database save happens before the thank-you screen and that WhatsApp/app links open.

## Technical details
- Forms: react-hook-form + zod, shared schema with the server function.
- Edge function `submit-lead`: zod validation, honeypot, rate limit table, upsert contact on normalized E.164 phone, insert lead, return reference.
- RLS: no anon access to tables; admin select/update via `has_role(auth.uid(),'admin')`.
- UTM captured from URL on first visit into sessionStorage.
