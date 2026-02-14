import { motion } from "framer-motion";
import { FlaskConical, Globe, MapPin } from "lucide-react";

const PilotSection = () => {
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
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 mb-6">
              <FlaskConical className="h-3.5 w-3.5 text-accent" />
              <span className="text-sm font-medium text-accent">Live Pilot Update</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Transparent. Controlled.</h2>
            <p className="text-muted-foreground text-lg mb-8">To ensure quality and security:</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-lg p-6"
            >
              <Globe className="h-5 w-5 text-accent mb-3" />
              <h3 className="font-semibold mb-2 text-foreground">Global Routes</h3>
              <p className="text-sm text-muted-foreground">
                UK ↔ Zimbabwe currently limited to <span className="text-foreground font-medium">secure document relay</span> during pilot testing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-lg p-6"
            >
              <MapPin className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-semibold mb-2 text-foreground">Local Deliveries</h3>
              <p className="text-sm text-muted-foreground">
                Open for <span className="text-foreground font-medium">standard parcel testing</span> across UK cities.
              </p>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm text-muted-foreground mt-6 text-center"
          >
            This phased approach validates infrastructure while maintaining compliance and trust.{" "}
            <span className="text-foreground font-medium">That's discipline, not limitation.</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default PilotSection;
