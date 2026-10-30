import { Link } from "react-router-dom";
import { MessageCircle, Package } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 py-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Qik<span className="text-primary">Parcel</span>
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a href="https://wa.me/447443191370" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">
            <MessageCircle className="h-4 w-4" /> WhatsApp +44 7443 191370
          </a>
          <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary">Terms</Link>
          <Link to="/prohibited-items" className="hover:text-primary">Prohibited Items</Link>
          <Link to="/cancellation" className="hover:text-primary">Cancellation</Link>
          <Link to="/send-parcel-uk-to-zimbabwe" className="hover:text-primary">UK to Zimbabwe</Link>
          <Link to="/send-parcel-harare-to-johannesburg" className="hover:text-primary">Harare to Johannesburg</Link>
          <Link to="/send-parcel-london-to-harare" className="hover:text-primary">London to Harare</Link>
          <Link to="/faq" className="hover:text-primary">FAQ</Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} QikParcel. Send. Deliver. Earn. Sustainably.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
