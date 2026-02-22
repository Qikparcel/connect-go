import { motion } from "framer-motion";
import { UserCheck, Route, Shield, FileCheck, Star } from "lucide-react";

const features = [
  { icon: UserCheck, label: "Identity-verified travelers" },
  { icon: Shield, label: "Secure escrow-style payments" },
  { icon: Route, label: "In-app communication" },
  { icon: FileCheck, label: "Rating & review system" },
  { icon: Star, label: "Delivery confirmation before payout" },
];

const TrustSection = () => {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Trust & Safety</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Built on Security & Accountability</h2>
            <p className="text-muted-foreground">We prioritise safe, transparent delivery.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card rounded-lg p-5 flex items-center gap-4"
              >
                <item.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-foreground font-medium mt-8"
          >
            Your parcel. Your money. <span className="text-gradient-primary">Protected.</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
