import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import { LeadForm } from "@/components/leads/LeadDialog";
import type { LeadType } from "@/components/leads/leadForms";
import { track } from "@/lib/tracking";

const OPTIONS: { type: LeadType; label: string }[] = [
  { type: "sender", label: "Send a Parcel" },
  { type: "traveller", label: "Earn as a Traveller" },
  { type: "merchant", label: "Deliver for My Business" },
];

const Onboarding = () => {
  const [type, setType] = useState<LeadType>("sender");
  useEffect(() => track("page_view", "onboarding"), []);
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Qik<span className="text-primary">Parcel</span>
            </span>
          </Link>
          <DarkModeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-8 max-w-2xl text-center"
        >
          <p className="mb-3 font-mono text-sm uppercase tracking-widest text-primary">Join the network</p>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
            Tell us how you <span className="text-gradient-primary">move things</span>
          </h1>
          <p className="text-muted-foreground">Takes about a minute. No account needed.</p>
        </motion.div>

        <div className="mx-auto max-w-lg">
          <p className="mb-3 text-center text-sm font-medium text-foreground">I want to:</p>
          <div className="mb-6 grid gap-2 sm:grid-cols-3">
            {OPTIONS.map((o) => (
              <button
                key={o.type}
                type="button"
                onClick={() => setType(o.type)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  type === o.type
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <LeadForm key={type} type={type} inline />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
