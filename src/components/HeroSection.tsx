import { motion } from "framer-motion";
import { Package, Plane, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const segments = [
  {
    icon: Package,
    label: "Send a Parcel",
    href: "https://app.qikparcel.com/",
    sectionId: "#senders",
  },
  {
    icon: Plane,
    label: "Earn as a Traveler",
    href: "https://app.qikparcel.com/",
    sectionId: "#travelers",
  },
  {
    icon: Store,
    label: "Deliver for My Business",
    href: "https://app.qikparcel.com/",
    sectionId: "#business",
  },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm font-medium text-primary">Now live for testing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            Turn Everyday Travel Into{" "}
            <span className="text-gradient-primary">Trusted Delivery</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
          >
            Affordable, secure, community-powered parcel delivery.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base text-foreground/70 font-medium mb-12"
          >
            I want to:
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            {segments.map((seg, i) => (
              <Button
                key={seg.label}
                variant={i === 0 ? "hero" : "heroOutline"}
                size="lg"
                className="text-base px-8 py-6 rounded-lg w-full sm:w-auto"
                asChild
              >
                <a href={seg.sectionId}>
                  <seg.icon className="mr-2 h-5 w-5" />
                  {seg.label}
                </a>
              </Button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
