import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WA = `https://wa.me/447443191370?text=${encodeURIComponent("Hi QikParcel, I'd like to send documents to or from Zimbabwe.")}`;

const routes = [
  { to: "/send-parcel-london-to-harare", title: "London ↔ Harare", text: "Send documents between the UK and Zimbabwe, in both directions." },
  { to: "/send-parcel-harare-to-johannesburg", title: "Harare ↔ Johannesburg", text: "Send documents between Zimbabwe and South Africa, in both directions." },
];

const SendToZimbabwe = () => {
  useEffect(() => {
    document.title = "Send Documents to Zimbabwe — London, Harare & Johannesburg | QikParcel";
  }, []);
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-20">
        <Link to="/" className="text-sm text-primary hover:underline">← Back to home</Link>
        <h1 className="mt-6 text-4xl font-black text-foreground">Send documents to and from Zimbabwe</h1>
        <p className="mt-6 text-muted-foreground">
          QikParcel connects people sending items with travellers already making the journey. Our Zimbabwe pilot links London, Harare and Johannesburg. Choose your route for details.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Zimbabwe pilot routes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {routes.map((r) => (
              <Link key={r.to} to={r.to} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary">
                <h3 className="font-bold text-card-foreground">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                <span className="mt-3 inline-block text-sm font-medium text-primary">View route →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">What you can send during the pilot</h2>
          <p className="mt-3 text-muted-foreground">During the pilot, cross-border routes are limited to documents. Prohibited or dangerous items cannot be sent — see our <Link to="/prohibited-items" className="text-primary hover:underline">Prohibited Items policy</Link>.</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Prices and timings</h2>
          <p className="mt-3 text-muted-foreground">We don't publish fixed prices or delivery times yet. An enquiry is not a confirmed booking — our team checks eligibility first.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild><Link to="/onboarding">Send an enquiry</Link></Button>
            <Button asChild variant="outline"><a href={WA} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a></Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">More answers in our <Link to="/faq" className="text-primary hover:underline">FAQ</Link> and <Link to="/terms" className="text-primary hover:underline">Terms</Link>.</p>
        </section>
      </div>
    </main>
  );
};

export default SendToZimbabwe;
