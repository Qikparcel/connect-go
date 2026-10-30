import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackRouteClick } from "@/lib/routeTracking";

const WA = `https://wa.me/447443191370?text=${encodeURIComponent("Hi QikParcel, I have a question about the Harare–Johannesburg pilot.")}`;

const faqs: { q: string; a: string }[] = [
  { q: "Does the pilot run in both directions?", a: "Yes. You can enquire about sending documents from Harare to Johannesburg or from Johannesburg to Harare." },
  { q: "What can I send on this route?", a: "During the pilot, cross-border routes are limited to documents. Other items, such as clothing or electronics, are not accepted on this route for now." },
  { q: "What can never be sent?", a: "Prohibited or dangerous items cannot be sent, including cash, weapons, drugs and counterfeit goods. The full list is in our Prohibited Items policy. Never hide or leave out items when you declare what you are sending." },
  { q: "Is my enquiry a confirmed booking?", a: "No. An enquiry is not a confirmed booking. Our team reviews it and checks eligibility first. If a suitable traveller is available, we contact you about next steps." },
  { q: "Do you guarantee a traveller or a delivery date?", a: "No. We don't guarantee matching, delivery or collection times." },
  { q: "How much does it cost and how long does it take?", a: "We don't publish fixed prices or delivery times yet. Ask us on WhatsApp and our team will reply with what is currently available." },
  { q: "Can you help with customs?", a: "We don't give customs clearance advice. Senders are legally responsible for the contents they declare." },
  { q: "Will I need to verify my identity?", a: "Identity verification may be required for certain features. Never share passport photos, passwords or card details in chat — our team will use a secure process if checks are needed." },
  { q: "Who can carry documents on this route?", a: "Travellers must be 18 or over, have valid ID and pass verification checks. They are independent individuals, not QikParcel employees. Earnings and matches are not guaranteed." },
  { q: "How do I get help?", a: "Message us on WhatsApp. We can't promise an immediate reply or 24/7 cover." },
];

const HarareJohannesburgFaq = () => {
  useEffect(() => {
    document.title = "Harare–Johannesburg Pilot FAQ | QikParcel";
  }, []);
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-20">
        <Link to="/send-parcel-uk-to-zimbabwe" className="text-sm text-primary hover:underline">← Zimbabwe routes</Link>
        <h1 className="mt-6 text-4xl font-black text-foreground">Harare–Johannesburg pilot FAQ</h1>
        <p className="mt-6 text-muted-foreground">Rules and eligibility for sending documents between Harare and Johannesburg during the QikParcel pilot.</p>
        {faqs.map((f) => (
          <section key={f.q} className="mt-8">
            <h2 className="text-lg font-bold text-foreground">{f.q}</h2>
            <p className="mt-2 text-muted-foreground">{f.a}</p>
          </section>
        ))}
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild><Link to="/send-parcel-harare-to-johannesburg">View the route</Link></Button>
          <Button asChild variant="outline"><a href={WA} onClick={() => trackRouteClick("Harare-Johannesburg", "FAQ", "whatsapp")} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a></Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">See also our <Link to="/prohibited-items" className="text-primary hover:underline">Prohibited Items policy</Link>, <Link to="/faq" className="text-primary hover:underline">general FAQ</Link> and <Link to="/terms" className="text-primary hover:underline">Terms</Link>.</p>
      </div>
    </main>
  );
};

export default HarareJohannesburgFaq;
