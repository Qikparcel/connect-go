import { motion } from "framer-motion";
import { FileText, Package, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const useCases = [
  { icon: FileText, label: "Documents" },
  { icon: Package, label: "Small parcels" },
  { icon: Zap, label: "Same-day city deliveries" },
  { icon: MapPin, label: "Intercity drops" },
];

const LocalDeliverySection = () => {
  return (
    <section id="local" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Local</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Need something delivered across town?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              QikParcel connects you with verified couriers already operating in your area.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {useCases.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card rounded-lg p-5 text-center"
              >
                <item.icon className="h-5 w-5 text-primary mx-auto mb-3" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground"
          >
            <span className="text-foreground">Fast.</span>
            <span className="text-foreground">Direct.</span>
            <span className="text-foreground">Community-rated.</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LocalDeliverySection;
