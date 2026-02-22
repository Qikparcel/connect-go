import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const BetaBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-16 left-0 right-0 z-40 border-b border-primary/20 bg-primary/10 backdrop-blur-md"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 px-4 py-3 text-center">
        <p className="text-sm text-foreground/90">
          <span className="mr-1">🚧</span>
          <span className="font-semibold">QikParcel is currently in BETA testing.</span>{" "}
          <span className="text-muted-foreground">
            We are operating pilot delivery corridors between the UK and Southern Africa.
            Join early. Help shape the future of community-powered logistics.
          </span>
        </p>
        <Button variant="hero" size="sm" className="shrink-0 text-xs" asChild>
          <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">
            Join the Beta <ArrowRight className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
};

export default BetaBanner;
