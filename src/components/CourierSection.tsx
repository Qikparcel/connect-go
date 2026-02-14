import { motion } from "framer-motion";
import { Wallet, Clock, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: Wallet, label: "Transparent earnings" },
  { icon: Clock, label: "Flexible participation" },
  { icon: Eye, label: "Choose deliveries" },
  { icon: Users, label: "Verified network" },
];

const CourierSection = () => {
  return (
    <section id="couriers" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Earn</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">Already on the move?</h2>
            <p className="text-xl text-gradient-primary font-semibold mb-8">Monetize your route.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {perks.map((item, i) => (
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
            className="text-sm text-muted-foreground space-y-1"
          >
            <p>No fixed shifts. No warehouse.</p>
            <p className="text-foreground font-medium">Just intelligent route matching.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Button variant="heroOutline" size="lg" className="rounded-lg" asChild>
              <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">
                Join as Courier / Traveler
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CourierSection;
