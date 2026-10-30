import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WA = `https://wa.me/447443191370?text=${encodeURIComponent("Hi QikParcel, I'd like to send documents from the UK to Zimbabwe.")}`;

const SendToZimbabwe = () => {
  useEffect(() => {
    document.title = "Send Documents from the UK to Zimbabwe | QikParcel";
  }, []);
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-20">
        <Link to="/" className="text-sm text-primary hover:underline">← Back to home</Link>
        <h1 className="mt-6 text-4xl font-black text-foreground">Send documents from the UK to Zimbabwe</h1>
        <p className="mt-6 text-muted-foreground">
          QikParcel connects people sending items with travellers already making the journey. We are currently running a pilot on the London ↔ Harare corridor.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">What you can send during the pilot</h2>
          <p className="mt-3 text-muted-foreground">During the pilot, cross-border routes are limited to documents. Prohibited or dangerous items cannot be sent — see our <Link to="/prohibited-items" className="text-primary hover:underline">Prohibited Items policy</Link>.</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">How it works</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Tell us what you need to send and when.</li>
            <li>Our team reviews your enquiry and checks eligibility.</li>
            <li>If a suitable traveller is available, we contact you about next steps. An enquiry is not a confirmed booking.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">Identity verification may be required for certain features.</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Prices and timings</h2>
          <p className="mt-3 text-muted-foreground">We don't publish fixed prices or delivery times yet. Ask us on WhatsApp and our team will reply with what is currently available.</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Get started</h2>
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
