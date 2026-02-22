import { motion } from "framer-motion";
import { DollarSign, Shield, Smartphone, Star, Globe, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: DollarSign, title: "Earn on Trips You're Already Taking", desc: "No detours needed." },
  { icon: Shield, title: "Guaranteed Payment", desc: "Funds are secured before you accept." },
  { icon: Smartphone, title: "Simple In-App Matching", desc: "Route optimization built in." },
  { icon: Star, title: "Build Your Reputation", desc: "Higher ratings unlock more deliveries." },
  { icon: Globe, title: "Sustainable Movement", desc: "Be part of a greener delivery network." },
];

const controls = [
  "Choose which parcels to carry",
  "Set your own availability",
  "Accept only what fits your journey",
];

const ForTravelersSection = () => {
  return (
    <section id="travelers" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">For Travelers</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Turn Your Trips Into <span className="text-gradient-primary">Extra Income</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-2 max-w-3xl">
              Already traveling? Earn money by delivering parcels along your route.
            </p>
            <p className="text-base font-medium text-foreground/70 mb-12">
              No detours. No fleet. No fixed hours.
            </p>
          </motion.div>

          {/* Benefits */}
          <div className="mb-12">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-lg font-semibold text-foreground mb-6"
            >
              Why Deliver with QikParcel?
            </motion.h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="glass-card rounded-lg p-5"
                >
                  <item.icon className="h-5 w-5 text-primary mb-3" />
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-lg p-6 mb-10"
          >
            <h3 className="font-semibold text-foreground mb-4">You're Always in Control</h3>
            <ul className="space-y-3">
              {controls.map((item) => (
                <li key={item} className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button variant="hero" size="lg" className="text-base px-8 py-6 rounded-lg" asChild>
              <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">
                Start Earning Today <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForTravelersSection;
