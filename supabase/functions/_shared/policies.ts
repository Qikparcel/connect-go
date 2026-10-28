// Single source of truth for QikParcel's published policies and FAQ.
// Rendered on the website (src/pages/LegalPage.tsx) and given verbatim to the chat assistant,
// so the assistant can only repeat what visitors can read on the site.

export type Section = { h: string; p?: string[]; list?: string[] };
export type Doc = { title: string; intro: string; updated: string; sections: Section[] };
export type DocKey = "privacy" | "terms" | "cancellation" | "faq" | "prohibited-items";

export const SUPPORT_EMAIL = "support@qikparcel.com";
const UPDATED = "1 March 2026";

export const DOCS: Record<DocKey, Doc> = {
  faq: {
    title: "Frequently Asked Questions",
    updated: UPDATED,
    intro:
      "Answers about how QikParcel works for senders and travellers. QikParcel is currently running a pilot, so some features described here are being introduced in stages; our team confirms what applies to your delivery.",
    sections: [
      { h: "What is QikParcel?", p: ["QikParcel connects people who need to send parcels with trusted travellers already heading in the same direction. Instead of running empty vehicles, we use real journeys."] },
      { h: "How does sending a parcel work?", list: ["You create a parcel request with pickup and delivery details.", "QikParcel matches your parcel with a verified traveller.", "Once picked up, you can track the parcel until it is delivered."] },
      { h: "What can I send?", p: ["Everyday, non-restricted items such as documents, gifts, clothing, non-hazardous electronics and personal items. You cannot send prohibited or dangerous items, which are listed in our Prohibited Items policy. During the pilot, global routes are limited to documents."] },
      { h: "How do I know my parcel is safe?", list: ["Verified travellers only", "Identity and route checks", "In-app tracking", "Escrow-based payment protection", "Delivery confirmation required"] },
      { h: "Can I track my parcel?", p: ["Yes. Status updates follow these steps: Pending, Matched, Picked Up, In Transit, Delivered. Every step is logged."] },
      { h: "What happens if something goes wrong?", list: ["The delivery is paused.", "Our support team investigates.", "Funds remain protected until resolution."] },
      { h: "Can I cancel a delivery?", p: ["Yes. Before pickup you receive a full refund. After pickup, refunds depend on the delivery stage and costs already incurred. See our Cancellation Policy."] },
      { h: "Who can become a traveller?", list: ["Anyone aged 18 or over", "With valid ID", "Who passes verification checks", "Who is already travelling (walking, driving, cycling or flying)"], p: ["Travellers are not employees; they are independent individuals using the platform."] },
      { h: "How do travellers earn money?", p: ["By carrying parcels along routes they are already taking. No shifts, quotas or fixed hours. After delivery is completed and confirmation is logged, payment is released weekly."] },
      { h: "Do travellers need special insurance?", p: ["No additional insurance is required to join. Travellers must act responsibly and comply with platform rules and local laws."] },
      { h: "What if a sender gives a traveller a prohibited item?", p: ["The traveller must refuse pickup and report it immediately. Travellers are not penalised for refusing unsafe or illegal items."] },
      { h: "How much does QikParcel cost?", p: ["Pricing is based on distance, parcel size, route demand and delivery urgency. You see the full price before confirming."] },
      { h: "How are payments handled?", p: ["Sender payments are held in escrow and only released once delivery is confirmed. After successful delivery and confirmation, payment is released to the traveller's account."] },
      { h: "How are users verified?", p: ["We use identity checks, activity monitoring and behavioural safeguards so that only trusted users operate on the platform."] },
      { h: "Is my data safe?", p: ["QikParcel follows the UK and EU GDPR. We collect only what is necessary and never sell personal data. See our Privacy Policy."] },
      { h: "Does QikParcel inspect parcels?", p: ["Travellers are not required to open parcels. Senders are legally responsible for the contents they declare. Random checks may occur to maintain platform safety."] },
      { h: "How do I contact support?", p: [`Through the website chat, WhatsApp, or email at ${SUPPORT_EMAIL}.`] },
      { h: "Where can I find the terms and policies?", p: ["Our Terms and Conditions, Privacy Policy, Prohibited Items policy and Cancellation Policy are all linked at the bottom of every page."] },
    ],
  },
  cancellation: {
    title: "Cancellation Policy",
    updated: UPDATED,
    intro:
      "This policy explains when and how deliveries on QikParcel may be cancelled, and how refunds (if any) are handled. QikParcel is a technology platform connecting senders with independent travellers, and this policy applies to all users.",
    sections: [
      { h: "Who can cancel a delivery", p: ["The sender, the traveller (courier), or QikParcel in limited circumstances. Cancellations depend on the delivery stage at the time."] },
      { h: "Pending (not yet matched)", p: ["The sender can cancel at any time before a traveller is matched, with no penalty, and receives a full refund."] },
      { h: "Matched (before pickup)", p: ["The sender or traveller can cancel. The sender receives a full refund and no payment is released to the traveller."] },
      { h: "Picked up or in transit", p: ["The sender, traveller or QikParcel can cancel. Because the traveller has already committed time and travel and costs may have been incurred, refunds are assessed case by case and may be partial, reduced or withheld."] },
      { h: "Delivered", p: ["Once a parcel is marked as delivered and confirmed, the delivery is complete and cannot be cancelled."] },
      { h: "Traveller-initiated cancellations", list: ["The parcel appears unsafe or prohibited", "The sender provided inaccurate or misleading information", "Circumstances beyond the traveller's control prevent completion"], p: ["The sender may then receive a partial or full refund depending on the situation. QikParcel may remove or restrict travellers who repeatedly cancel without valid reasons."] },
      { h: "Platform-initiated cancellations", list: ["Platform rules or laws are violated", "Fraud, misuse or prohibited items are suspected", "Safety or compliance concerns arise"], p: ["Refunds, if any, are decided based on the delivery stage and circumstances."] },
      { h: "How refunds are processed", p: ["Approved refunds go to the original payment method. Timelines depend on payment providers and banks, and QikParcel does not control their processing delays."] },
      { h: "No circumvention", p: ["Users must not complete deliveries outside the platform, exchange payment directly, or bypass escrow protections. Doing so may lead to account suspension or termination."] },
      { h: "Disputes", p: ["If a cancellation leads to a dispute, funds remain held while QikParcel investigates based on platform data and records. Decisions are final and binding under this policy."] },
      { h: "Policy updates", p: [`QikParcel may update this policy from time to time. Continued use of the platform means acceptance of the updated policy. Questions: ${SUPPORT_EMAIL}.`] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: UPDATED,
    intro: "This policy explains how QikParcel OÜ handles personal data under the UK and EU General Data Protection Regulation (GDPR).",
    sections: [
      { h: "Data controller", p: ["QikParcel OÜ is the data controller and decides the purposes and means of processing personal data."] },
      { h: "Information collected through this website", list: [
        "Contact details you give in our enquiry forms or chat assistant: name, phone number, email address and, for businesses, business name.",
        "Delivery or travel details you share, such as pickup and drop-off locations, travel dates, parcel type, weight and urgency.",
        "Messages you send to the website chat assistant, saved so our team can follow up.",
        "Your WhatsApp and marketing preferences.",
        "Basic usage information, such as pages visited and the link or campaign that brought you to the site.",
      ] },
      { h: "Lawful basis for processing", p: ["Performance of a contract with you (including steps you ask us to take before one), compliance with legal obligations, and our legitimate interests where these are not overridden by your rights and freedoms. Where we ask for consent, such as for marketing, you can withdraw it at any time."] },
      { h: "Sharing", p: ["We never sell personal data. We share it only with service providers that help us run the platform, with a matched sender or traveller where needed for a delivery, and where required by law."] },
      { h: "Your rights", p: [`You can access your data, correct inaccurate or incomplete data, request erasure, request data portability, and object to certain processing. Email ${SUPPORT_EMAIL}. In the UK you can also complain to the Information Commissioner's Office (ico.org.uk).`] },
      { h: "Retention and security", p: ["Personal data is kept only as long as necessary for the purposes it was collected for. QikParcel OÜ uses appropriate security measures to protect it against unauthorised access, alteration, disclosure or destruction."] },
    ],
  },
  terms: {
    title: "Terms and Conditions",
    updated: UPDATED,
    intro: "These Terms and Conditions of QikParcel OÜ govern your access to and use of the QikParcel website, apps and related services. By using the platform you agree to them; if you do not agree, please do not use it.",
    sections: [
      { h: "Platform role", list: [
        "QikParcel is a technology platform that connects Senders and Couriers. QikParcel does not take possession of, store, package, transport or deliver parcels.",
        "Couriers act as independent individuals; nothing creates employment, agency or partnership with QikParcel.",
        "Each Booking is a direct agreement between the Sender and the Courier. QikParcel facilitates it but is not a party to it.",
      ] },
      { h: "Eligibility and accounts", list: [
        "You must be at least 18 and able to enter into contracts.",
        "You must give accurate, complete information and keep it up to date.",
        "We may require identity verification (phone, government ID, selfie, travel documents or other checks) for certain features.",
        "You are responsible for keeping your account credentials confidential and for all activity on your account.",
      ] },
      { h: "Prohibited items and compliance", p: ["You must not send, request, carry or deliver Prohibited Items (see our Prohibited Items policy). You must comply with all laws, customs requirements, airline rules and border controls at origin, transit and destination. We may cooperate with and report suspected illegal activity to law enforcement."] },
      { h: "Bookings, fees and payments", list: [
        "Senders request delivery and Couriers accept or decline. A Booking is confirmed only when the platform shows confirmation. A website enquiry or chat is not a Booking.",
        "Platform fees and any taxes are shown before confirmation.",
        "Payments may be held in escrow until delivery confirmation, completion checks or dispute resolution.",
        "Refund eligibility depends on the circumstances, applicable law and the dispute process. See our Cancellation Policy.",
      ] },
      { h: "Disputes, cancellations and enforcement", p: ["If a dispute arises, you agree to use the platform's dispute process and provide reasonable evidence on request (such as photos, receipts, messages, tracking or delivery confirmation). Cancellations follow the rules shown for the Booking, and fees may apply for late cancellations or no-shows. We may suspend, restrict or terminate accounts or withhold payouts to prevent fraud or ensure compliance."] },
      { h: "Sender responsibilities", list: [
        "You must be the lawful owner or authorised sender, and describe the contents and value accurately.",
        "Package parcels safely; a Courier may refuse collection if packaging looks unsafe or does not match the declared contents.",
        "You are solely responsible for customs declarations, duties, taxes and destination rules. Seizure or destruction by authorities is at your risk.",
        "Sending prohibited items or misrepresenting contents makes you liable and may lead to permanent removal.",
      ] },
      { h: "Courier responsibilities", list: [
        "You decide if, when and how you accept Bookings.",
        "You may refuse or cancel if a parcel seems suspicious, unsafe, badly packaged or misrepresented, or if legal risk arises.",
        "Handle parcels with reasonable care, follow platform instructions, do not tamper with parcels, and deliver within agreed timelines.",
        "Authorities may inspect parcels and question couriers; you must comply with lawful requests.",
      ] },
      { h: "Liability", p: ["Peer-to-peer delivery involves risks such as loss, delay, damage, seizure or inspection by authorities, which users assume. To the maximum extent permitted by law, the platform is provided 'as is' and 'as available', QikParcel is not liable for indirect or consequential losses, and its total liability for any Booking will not exceed the platform fees paid for that Booking, unless the law requires otherwise."] },
      { h: "Acceptable use and content", p: ["You must not misuse the platform, attempt unauthorised access, scrape data, interfere with security, transmit malware, or engage in harassment or fraud. You keep ownership of content you upload but grant QikParcel a worldwide, non-exclusive, royalty-free licence to use it to operate and improve the platform. The QikParcel platform, trademarks and software belong to QikParcel or its licensors."] },
      { h: "Privacy", p: ["We process personal data under our Privacy Policy. By using the platform you consent to identity verification and fraud-prevention checks where permitted by law."] },
      { h: "Changes, governing law and contact", p: [`We may update these Terms; changes apply from the stated effective date. Unless mandatory consumer law says otherwise, these Terms are governed by the laws of Estonia and the Estonian courts have exclusive jurisdiction. Contact: ${SUPPORT_EMAIL}.`] },
    ],
  },
  "prohibited-items": {
    title: "Prohibited Items",
    updated: UPDATED,
    intro: "These items must never be sent, requested, carried or delivered through QikParcel. The list is not exhaustive: anything prohibited by airline rules, border agencies, customs or local laws at origin, transit or destination is also prohibited.",
    sections: [
      { h: "Never allowed", list: [
        "Illegal drugs and controlled substances",
        "Weapons",
        "Explosives",
        "Flammables",
        "Hazardous chemicals",
        "Counterfeit goods",
        "Stolen goods",
        "Cash",
        "Precious metals",
        "Bearer instruments",
        "Live animals",
        "Human remains",
      ] },
      { h: "Pilot restriction on global routes", p: ["During the pilot, cross-border routes are limited to documents."] },
      { h: "Refusals and reporting", p: ["Couriers may refuse collection if a parcel seems suspicious, unsafe, badly packaged or misrepresented, and are not penalised for refusing unsafe or illegal items. Senders who attempt to send prohibited items bear all liability and may be permanently removed. QikParcel may report suspected illegal activity to the authorities."] },
      { h: "Not sure?", p: [`Ask before you send: ${SUPPORT_EMAIL}.`] },
    ],
  },
};

export const policiesAsText = () =>
  (Object.entries(DOCS) as [DocKey, Doc][])
    .map(([key, d]) =>
      [`## ${d.title} (https://www.qikparcel.com/${key})`, d.intro,
        ...d.sections.map((s) => [`### ${s.h}`, ...(s.p ?? []), ...(s.list ?? []).map((l) => `- ${l}`)].join("\n"))].join("\n"))
    .join("\n\n");
