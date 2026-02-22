import { motion } from "framer-motion";
import { Package, DollarSign, RefreshCw, BarChart3, Leaf, ShoppingBag, Store, Globe, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const idealFor = [
  { icon: ShoppingBag, label: "E-commerce sellers" },
  { icon: Store, label: "Social media stores" },
  { icon: Globe, label: "Marketplace vendors" },
  { icon: Truck, label: "Local retailers" },
];

const benefits = [
  { icon: Package, title: "Scalable On-Demand Delivery", desc: "No fleet required." },
  { icon: DollarSign, title: "Lower Operational Costs", desc: "Community rates beat traditional couriers." },
  { icon: RefreshCw, title: "Flexible Volume", desc: "No contracts required." },
  { icon: BarChart3, title: "Delivery Visibility", desc: "Full tracking and analytics." },
  { icon: Leaf, title: "Eco-Friendly Fulfillment", desc: "Lower carbon impact by design." },
];

const useCases = [
  "Expand into new cities",
  "Offer same-day or intercity options",
  "Reduce dependency on expensive courier contracts",
];

const ForBusinessSection = () => {
  return (
    <section id="business" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">For Small Businesses</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Flexible Delivery <span className="text-gradient-primary">Without Fleet Costs</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
              Reduce last-mile expenses and improve customer experience with a community-powered delivery network.
            </p>
          </motion.div>

          {/* Perfect for */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {idealFor.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card rounded-lg p-5 text-center"
              >
                <item.icon className="h-5 w-5 text-accent mx-auto mb-3" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Benefits */}
          <div className="mb-12">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-lg font-semibold text-foreground mb-6"
            >
              Why Businesses Choose QikParcel
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
                  <item.icon className="h-5 w-5 text-accent mb-3" />
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Built for Growing Brands */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-lg p-6 mb-10"
          >
            <h3 className="font-semibold text-foreground mb-4">Built for Growing Brands</h3>
            <p className="text-sm text-muted-foreground mb-4">Use QikParcel to:</p>
            <ul className="space-y-3">
              {useCases.map((item) => (
                <li key={item} className="flex items-center gap-3 text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
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
            <Button variant="accent" size="lg" className="text-base px-8 py-6 rounded-lg" asChild>
              <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">
                Partner With Us <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForBusinessSection;
