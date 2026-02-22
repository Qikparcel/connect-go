import { motion } from "framer-motion";
import { DollarSign, Zap, Lock, MapPin, Star, Send, Brain, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: DollarSign, title: "Lower Costs", desc: "Pay competitive rates set by real travelers." },
  { icon: Zap, title: "Faster Delivery", desc: "Match with trips already happening locally & intercity." },
  { icon: Lock, title: "Secure Payments", desc: "Funds are held safely until delivery is confirmed." },
  { icon: MapPin, title: "Real-Time Tracking", desc: "Know exactly where your parcel is." },
  { icon: Star, title: "Verified Travelers", desc: "Rated, reviewed, and identity-checked." },
];

const steps = [
  { icon: Send, num: "01", title: "Post your parcel details" },
  { icon: Brain, num: "02", title: "Match with a verified traveler" },
  { icon: Shield, num: "03", title: "Payment is securely held" },
  { icon: CheckCircle2, num: "04", title: "Confirm delivery → traveler gets paid" },
];

const ForSendersSection = () => {
  return (
    <section id="senders" className="py-24 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-mono text-primary uppercase tracking-widest mb-4">For Senders</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Send Smarter. Pay Less. <span className="text-gradient-primary">Stay in Control.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
              Stop overpaying for traditional courier fees. QikParcel connects you with verified travelers already heading your parcel's way.
            </p>
          </motion.div>

          {/* Benefits */}
          <div className="mb-16">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-lg font-semibold text-foreground mb-6"
            >
              Why Send with QikParcel?
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

          {/* How It Works */}
          <div className="mb-10">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-lg font-semibold text-foreground mb-6"
            >
              How It Works
            </motion.h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass-card rounded-lg p-5"
                >
                  <span className="text-xs font-mono text-primary/50 block mb-3">{step.num}</span>
                  <step.icon className="h-5 w-5 text-primary mb-3" />
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button variant="hero" size="lg" className="text-base px-8 py-6 rounded-lg" asChild>
              <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">
                Send a Parcel Now <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForSendersSection;
