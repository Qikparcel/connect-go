import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Plane, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Package, label: "Send a Parcel", variant: "heroOutline" as const },
  { icon: Plane, label: "Become a Traveler", variant: "heroOutline" as const },
  { icon: Store, label: "Grow Your Business", variant: "heroOutline" as const },
];

const FinalCTASection = () => {
  return (
    <section className="py-32 border-t border-border/40 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to <span className="text-gradient-primary">Get Started?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Whether you're sending, earning, or scaling your business — QikParcel connects people, parcels, and journeys safely.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8"
          >
            <Button variant="hero" size="lg" className="text-base px-10 py-7 rounded-lg w-full sm:w-auto" asChild>
              <Link to="/onboarding">
                Join the QikParcel Network <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">
              One quick form — takes about a minute.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {actions.map((action) => (
              <Button key={action.label} variant={action.variant} size="lg" className="text-base px-8 py-6 rounded-lg w-full sm:w-auto" asChild>
                <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </a>
              </Button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
