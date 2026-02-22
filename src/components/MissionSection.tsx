import { motion } from "framer-motion";
import { Leaf, TrendingDown, Route } from "lucide-react";

const impacts = [
  { icon: Route, label: "Fewer empty vehicle trips" },
  { icon: TrendingDown, label: "Lower carbon footprint" },
  { icon: Leaf, label: "More efficient logistics" },
];

const MissionSection = () => {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Our Mission</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Smarter Delivery. <span className="text-gradient-primary">Lower Emissions.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              By using existing travel routes, we reduce unnecessary transport and lower environmental impact.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {impacts.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-card rounded-lg p-6 flex items-center gap-4 sm:flex-col sm:text-center"
              >
                <item.icon className="h-6 w-6 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
