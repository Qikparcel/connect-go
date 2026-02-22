import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Qik<span className="text-primary">Parcel</span>
          </span>
        </div>
        <div className="flex items-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground">
          <a href="#senders" className="hover:text-foreground transition-colors">Senders</a>
          <a href="#travelers" className="hover:text-foreground transition-colors">Travelers</a>
          <a href="#business" className="hover:text-foreground transition-colors">Business</a>
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <Button variant="hero" size="sm" asChild>
            <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">
              Access Platform
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
