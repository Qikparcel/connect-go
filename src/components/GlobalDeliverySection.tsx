import { motion } from "framer-motion";
import { Globe, ArrowRightLeft } from "lucide-react";

const GlobalDeliverySection = () => {
  return (
    <section id="global" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono text-accent uppercase tracking-widest mb-4">Global — Pilot Phase</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Cross-Border Corridors</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-lg p-8 mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <ArrowRightLeft className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Currently Active</p>
                <p className="text-sm text-muted-foreground">UK ↔ Zimbabwe (documents only)</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Expansion corridors under review.</p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground text-sm"
          >
            We are expanding carefully — <span className="text-foreground font-medium">infrastructure first, scale second.</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default GlobalDeliverySection;
