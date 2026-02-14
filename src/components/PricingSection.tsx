import { motion } from "framer-motion";
import { MapPin, Globe } from "lucide-react";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Pilot Transparent Model</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-lg p-6"
            >
              <MapPin className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Local Deliveries</h3>
              <p className="text-sm text-muted-foreground">Dynamic pricing based on distance.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-lg p-6"
            >
              <Globe className="h-5 w-5 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Global Document Relay</h3>
              <p className="text-sm text-muted-foreground">UK ↔ Zimbabwe pilot: Flat secure relay rate.</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2"
          >
            <span className="text-sm text-primary font-medium">Early testers receive reduced platform fees.</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-muted-foreground mt-4"
          >
            We are validating the system — not inflating margins.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
