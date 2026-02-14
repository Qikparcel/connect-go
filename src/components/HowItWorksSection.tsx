import { motion } from "framer-motion";
import { Send, Brain, Shield, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Send,
    num: "01",
    title: "Post a Delivery Request",
    desc: "Enter pickup, drop-off, parcel details.",
  },
  {
    icon: Brain,
    num: "02",
    title: "Smart Route Matching",
    desc: "AI matches your request with a verified courier or traveler.",
  },
  {
    icon: Shield,
    num: "03",
    title: "Secure Handover",
    desc: "Escrow holds payment. Identity verified.",
  },
  {
    icon: CheckCircle2,
    num: "04",
    title: "Delivery Confirmed",
    desc: "Recipient confirms. Payment released.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">Simple. Controlled. Transparent.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-lg p-6 relative group"
              >
                <span className="text-xs font-mono text-primary/50 mb-4 block">{step.num}</span>
                <step.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
