import { Package } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Qik<span className="text-primary">Parcel</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} QikParcel. Community Powered Delivery.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
