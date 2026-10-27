import { motion } from "framer-motion";
import { Package, Plane, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import { useOpenLead } from "@/components/leads/LeadDialog";

const HeroSection = () => {
  const openLead = useOpenLead();
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm font-medium text-primary">Send. Deliver. Earn. Sustainably.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 uppercase"
          >
            Delivery Reimagined.{" "}
            <span className="text-gradient-primary">Local or Global.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            QikParcel connects senders and businesses with travellers and delivery partners using available
            delivery capacity. Send parcels, earn from your journeys and discover convenient delivery options.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto"
          >
            <Button variant="hero" size="lg" className="text-base py-6 uppercase" onClick={() => openLead("sender")}>
              <Package className="mr-2 h-5 w-5" /> Send a parcel
            </Button>
            <Button variant="heroOutline" size="lg" className="text-base py-6 uppercase" onClick={() => openLead("traveller")}>
              <Plane className="mr-2 h-5 w-5" /> I'm travelling
            </Button>
            <Button variant="heroOutline" size="lg" className="text-base py-6 uppercase" onClick={() => openLead("merchant")}>
              <Store className="mr-2 h-5 w-5" /> I'm a merchant
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
