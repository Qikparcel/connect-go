import { motion } from "framer-motion";

const traditional = ["Fixed routes", "Expensive overhead", "Centralized infrastructure"];
const qikparcel = [
  "Dynamic route matching",
  "Escrow-based trust",
  "AI verification",
  "Community rating system",
  "Lower carbon impact",
];

const WhyDifferentSection = () => {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Advantage</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Why QikParcel Is Different</h2>
            <p className="text-muted-foreground">This is decentralized logistics.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-border/60 bg-secondary/30 p-6"
            >
              <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">Traditional Couriers</h3>
              <ul className="space-y-3">
                {traditional.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-lg p-6 glow-ring"
            >
              <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4">QikParcel</h3>
              <ul className="space-y-3">
                {qikparcel.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
