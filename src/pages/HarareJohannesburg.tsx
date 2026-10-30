import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackRouteClick } from "@/lib/routeTracking";

const ROUTE = "Harare-Johannesburg";

const wa = (text: string) => `https://wa.me/447443191370?text=${encodeURIComponent(text)}`;

const directions = [
  { title: "Harare → Johannesburg", msg: "Hi QikParcel, I'd like to send documents from Harare to Johannesburg." },
  { title: "Johannesburg → Harare", msg: "Hi QikParcel, I'd like to send documents from Johannesburg to Harare." },
];

const HarareJohannesburg = () => {
  useEffect(() => {
    document.title = "Send Documents Between Harare and Johannesburg | QikParcel";
  }, []);
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-20">
        <Link to="/" className="text-sm text-primary hover:underline">← Back to home</Link>
        <h1 className="mt-6 text-4xl font-black text-foreground">Send documents between Harare and Johannesburg</h1>
        <p className="mt-6 text-muted-foreground">
          QikParcel connects people sending items with travellers already making the journey. Harare ↔ Johannesburg is one of our featured pilot corridors, in both directions.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Choose your direction</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {directions.map((d) => (
              <div key={d.title} className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-bold text-card-foreground">{d.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Documents only during the pilot.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild size="sm"><Link to="/onboarding" onClick={() => trackRouteClick(ROUTE, d.title.replace(/ /g, ""), "enquiry")}>Send an enquiry</Link></Button>
                  <Button asChild size="sm" variant="outline"><a href={wa(d.msg)} onClick={() => trackRouteClick(ROUTE, d.title.replace(/ /g, ""), "whatsapp")} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a></Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">What you can send during the pilot</h2>
          <p className="mt-3 text-muted-foreground">During the pilot, cross-border routes are limited to documents. Prohibited or dangerous items cannot be sent — see our <Link to="/prohibited-items" className="text-primary hover:underline">Prohibited Items policy</Link>. We don't give customs clearance advice.</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">How it works</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Tell us what you need to send, which direction and when.</li>
            <li>Our team reviews your enquiry and checks eligibility.</li>
            <li>If a suitable traveller is available, we contact you about next steps. An enquiry is not a confirmed booking.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">Identity verification may be required for certain features.</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Prices and timings</h2>
          <p className="mt-3 text-muted-foreground">We don't publish fixed prices or delivery times yet. Ask us on WhatsApp and our team will reply with what is currently available.</p>
        </section>

        <section className="mt-10 rounded-lg border border-border bg-muted p-6">
          <h2 className="text-xl font-bold text-foreground">Travel this route often?</h2>
          <p className="mt-3 text-muted-foreground">If you regularly fly, take the coach or drive between Harare and Johannesburg, register your upcoming trips. We'll contact you if a suitable documents request comes up. Earnings and matches are not guaranteed.</p>
          <Button asChild className="mt-4" variant="secondary"><Link to="/onboarding" onClick={() => trackRouteClick(ROUTE, "Both", "traveller")}>Register as a traveller</Link></Button>
        </section>

        <p className="mt-10 text-sm text-muted-foreground">Pilot questions? See the <Link to="/harare-johannesburg-faq" className="text-primary hover:underline">Harare–Johannesburg FAQ</Link>. More answers in our <Link to="/faq" className="text-primary hover:underline">FAQ</Link> and <Link to="/terms" className="text-primary hover:underline">Terms</Link>.</p>
      </div>
    </main>
  );
};

export default HarareJohannesburg;
