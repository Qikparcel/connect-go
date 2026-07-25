import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

const Onboarding = () => (
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
        className="mx-auto mb-10 max-w-2xl text-center"
      >
        <p className="mb-3 font-mono text-sm uppercase tracking-widest text-primary">
          Join the network
        </p>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
          Tell us how you <span className="text-gradient-primary">move things</span>
        </h1>
        <p className="text-muted-foreground">
          Takes about a minute. Whether you travel, send, run a business, or deliver — we'll match
          you with the right people on your route.
        </p>
      </motion.div>

      <OnboardingForm />
    </main>
  </div>
);

export default Onboarding;
