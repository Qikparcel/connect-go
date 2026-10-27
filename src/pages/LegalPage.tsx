import { Link } from "react-router-dom";

type Section = { h: string; p?: string[]; list?: string[] };
type Doc = { title: string; intro: string; sections: Section[] };

const CONTACT = "info@qikparcel.com";
const UPDATED = "27 October 2026";

const DOCS: Record<"privacy" | "terms" | "prohibited-items", Doc> = {
  privacy: {
    title: "Privacy Policy",
    intro:
      "This policy explains what personal information QikParcel collects through this website, why we collect it, and the choices you have. QikParcel is currently in a pilot (beta) phase.",
    sections: [
      {
        h: "Information we collect",
        list: [
          "Contact details you give us in our enquiry forms or chat assistant: your name, phone number, email address and, for businesses, your business name.",
          "Delivery or travel details you share, such as pickup and drop-off locations, travel dates, parcel type, weight and urgency.",
          "Messages you send to our website chat assistant, saved so our team can follow up.",
          "Your WhatsApp and marketing communication preferences.",
          "Basic usage information, such as pages visited, buttons clicked and the link or campaign that brought you to the site.",
        ],
      },
      {
        h: "How we use your information",
        list: [
          "To respond to your enquiry and match you with a suitable sender, traveller or courier during the pilot.",
          "To contact you by phone, email or WhatsApp about your enquiry, and with updates only if you opted in.",
          "To understand how visitors use the site so we can improve it.",
          "To keep the service safe and prevent misuse.",
        ],
      },
      {
        h: "Legal basis",
        p: [
          "We process your information to take steps at your request before providing a service, for our legitimate interest in running and improving QikParcel, and with your consent where we ask for it (for example, marketing and WhatsApp updates). You can withdraw consent at any time.",
        ],
      },
      {
        h: "Sharing your information",
        p: [
          "We do not sell your personal information. We share it only with trusted service providers that help us run the website, store data, send emails and power the chat assistant, and with a matched sender or traveller where needed to arrange a delivery. We may disclose information where required by law.",
        ],
      },
      {
        h: "How long we keep it",
        p: [
          "We keep enquiry and chat records for as long as needed to handle your request and run the pilot, and then delete or anonymise them unless we must keep them longer by law.",
        ],
      },
      {
        h: "Your rights",
        p: [
          `You can ask to access, correct or delete your information, object to or restrict how we use it, or ask for a copy. Email ${CONTACT}. If you are in the UK, you can also complain to the Information Commissioner's Office (ico.org.uk).`,
        ],
      },
      {
        h: "Contact",
        p: [`Questions about this policy: ${CONTACT}. Last updated ${UPDATED}.`],
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    intro:
      "These terms apply to your use of the QikParcel website and enquiry services during our pilot (beta) phase. By using the site, you agree to them.",
    sections: [
      {
        h: "About the pilot",
        p: [
          "QikParcel is testing a community-powered delivery network that connects senders with travellers and couriers. During the pilot, routes, services and availability are limited and may change without notice. Global routes are restricted to the corridors and item types we confirm with you.",
        ],
      },
      {
        h: "Enquiries are not bookings",
        p: [
          "Submitting a form or chatting with our assistant sends us an enquiry. It does not create a confirmed booking or guarantee a delivery, price or match. A delivery is only arranged once our team confirms it with you.",
        ],
      },
      {
        h: "Your responsibilities",
        list: [
          "Give accurate, up-to-date information about yourself, your parcel and your journey.",
          "Only send or carry items that are legal and allowed under our Prohibited Items list.",
          "Package items securely and declare their contents honestly.",
          "Treat other members of the community respectfully and keep agreed arrangements.",
        ],
      },
      {
        h: "Travellers and couriers",
        p: [
          "If you carry parcels, you choose which deliveries to accept. You must not accept an item you have not been able to check, or that you believe breaks the law, customs rules or our Prohibited Items list. You remain responsible for complying with the rules of any transport provider and border you cross.",
        ],
      },
      {
        h: "Our right to refuse",
        p: [
          "We may decline or cancel any enquiry or delivery, or restrict access, where we suspect misuse, unsafe items or false information.",
        ],
      },
      {
        h: "Liability",
        p: [
          "We work to run the pilot carefully, but the website and services are provided as they are during testing. Nothing in these terms limits liability that cannot be limited by law.",
        ],
      },
      {
        h: "Changes and contact",
        p: [`We may update these terms as the pilot develops. Questions: ${CONTACT}. Last updated ${UPDATED}.`],
      },
    ],
  },
  "prohibited-items": {
    title: "Prohibited Items",
    intro:
      "To keep our community, travellers and couriers safe, the following items must never be sent or carried through QikParcel. This list is not exhaustive: anything illegal at the origin, destination or along the route is also prohibited.",
    sections: [
      {
        h: "Never allowed",
        list: [
          "Illegal drugs, controlled substances and drug paraphernalia",
          "Weapons, firearms, ammunition, replicas and parts",
          "Explosives, fireworks, flammable liquids or gases and other hazardous materials",
          "Cash, bank cards, precious metals and loose gemstones",
          "Counterfeit, stolen or pirated goods",
          "Live animals and animal products restricted by law",
          "Human remains, bodily fluids and biological samples",
          "Prescription medicines without proper documentation",
          "Tobacco and alcohol beyond legal personal limits",
          "Sealed or unidentified packages whose contents cannot be checked",
        ],
      },
      {
        h: "Pilot restrictions on global routes",
        p: [
          "During the pilot, cross-border routes are limited to the item types we confirm with you, such as documents. Please tell us exactly what you want to send before arranging a delivery.",
        ],
      },
      {
        h: "Checks and refusals",
        p: [
          "Travellers and couriers may inspect an item before accepting it and can refuse anything they are unsure about. We may cancel any delivery that appears to break these rules and report illegal items to the authorities.",
        ],
      },
      {
        h: "Not sure?",
        p: [`Ask before you send: email ${CONTACT}. Last updated ${UPDATED}.`],
      },
    ],
  },
};

const LegalPage = ({ page }: { page: keyof typeof DOCS }) => {
  const doc = DOCS[page];
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-20">
        <Link to="/" className="text-sm text-primary hover:underline">← Back to home</Link>
        <h1 className="mt-6 text-4xl font-black text-foreground">{doc.title}</h1>
        <p className="mt-6 text-muted-foreground">{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="text-xl font-bold text-foreground">{s.h}</h2>
            {s.p?.map((t) => <p key={t} className="mt-3 text-muted-foreground">{t}</p>)}
            {s.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                {s.list.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
};

export default LegalPage;
