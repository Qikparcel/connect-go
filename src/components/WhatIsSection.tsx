import { motion } from "framer-motion";
import { MapPin, Plane, Truck } from "lucide-react";

const matches = [
  { icon: Truck, label: "Local couriers" },
  { icon: MapPin, label: "Intercity travelers" },
  { icon: Plane, label: "International route travelers" },
];

const WhatIsSection = () => {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">The Platform</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              QikParcel is a peer-to-peer delivery platform.
            </h2>
            <p className="text-muted-foreground text-lg mb-8">We match senders with:</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {matches.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-lg p-6 flex items-center gap-4"
              >
                <item.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border-l-2 border-primary/40 pl-6 space-y-1 text-muted-foreground"
          >
            <p>Instead of creating new delivery routes, we unlock the routes already happening.</p>
            <p className="text-foreground font-medium pt-2">That's more efficient. That's more sustainable. That's smarter logistics.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;
