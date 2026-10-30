import { ArrowLeftRight } from "lucide-react";

const steps = [
  "Tell us what you're sending or where you're travelling.",
  "QikParcel helps identify suitable delivery options.",
  "Confirm your booking and receive updates.",
];

const featured = [["London", "Harare"], ["London", "Johannesburg"], ["Harare", "Johannesburg"]];
const others = ["UK ↔ Estonia", "UK ↔ South Africa", "Local & intercity UK deliveries"];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 border-t border-border/40">
    <div className="container mx-auto px-4 max-w-5xl">
      <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">How it works</h2>
      <ol className="grid md:grid-cols-3 gap-6 mb-16">
        {steps.map((s, i) => (
          <li key={s} className="rounded-xl border border-border bg-card p-6">
            <span className="font-mono text-sm text-primary font-bold">0{i + 1}</span>
            <p className="mt-2 text-lg font-semibold text-foreground">{s}</p>
          </li>
        ))}
      </ol>
      <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Featured corridors</h3>
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        {featured.map(([a, b]) => (
          <div key={b} className="flex items-center justify-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-6 py-3 font-bold text-foreground">
            {a} <ArrowLeftRight className="h-4 w-4 text-primary" /> {b}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Also supporting: {others.join(" · ")}. Availability depends on matching travellers and delivery partners.
      </p>
    </div>
  </section>
);

export default HowItWorksSection;
