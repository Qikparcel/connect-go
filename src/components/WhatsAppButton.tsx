import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/447443191370"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with QikParcel on WhatsApp"
    className="fixed bottom-48 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:bottom-28"
  >
    <MessageCircle className="h-7 w-7" />
  </a>
);

export default WhatsAppButton;
