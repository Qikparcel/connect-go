export type LeadType = "sender" | "traveller" | "merchant";

export type Field = {
  name: string;
  label: string;
  kind: "text" | "tel" | "email" | "date" | "select";
  options?: string[];
  optional?: boolean;
  placeholder?: string;
};

export const WHATSAPP = "447443191370";
const CITIES = ["London", "Harare", "Johannesburg", "Other"];
const WEIGHTS = ["Under 1kg", "1–5kg", "5–10kg", "Over 10kg"];

const contact: Field[] = [
  { name: "fullName", label: "Full name", kind: "text" },
  { name: "phone", label: "WhatsApp number (with country code)", kind: "tel", placeholder: "+44 7…" },
  { name: "email", label: "Email", kind: "email", optional: true },
];

export const FORMS: Record<LeadType, { title: string; steps: [Field[], Field[]]; thanks: string }> = {
  sender: {
    title: "Send a parcel",
    thanks: "Thank you! Your parcel request has been received.",
    steps: [
      contact,
      [
        { name: "origin", label: "From", kind: "select", options: CITIES },
        { name: "destination", label: "To", kind: "select", options: CITIES },
        { name: "readiness", label: "Do you have a parcel ready?", kind: "select", options: ["Now", "Within 7 days", "Within 30 days", "Just exploring"] },
        { name: "sendDate", label: "Preferred sending date", kind: "date", optional: true },
        { name: "parcelType", label: "Parcel type", kind: "select", options: ["Documents", "Clothing", "Gifts", "Other"] },
        { name: "weight", label: "Approximate weight", kind: "select", options: WEIGHTS },
        { name: "wantsQuote", label: "Would you like a quote now?", kind: "select", options: ["Yes", "No"] },
      ],
    ],
  },
  traveller: {
    title: "I'm travelling",
    thanks: "Thank you! Your travel details have been received.",
    steps: [
      contact,
      [
        { name: "origin", label: "From", kind: "select", options: CITIES },
        { name: "destination", label: "To", kind: "select", options: CITIES },
        { name: "departureDate", label: "Departure date", kind: "date", optional: true },
        { name: "travelling", label: "When are you travelling?", kind: "select", options: ["Within 48 hours", "Within 7 days", "Within 30 days", "No confirmed trip"] },
        { name: "capacity", label: "Available luggage space", kind: "select", options: [...WEIGHTS, "Unsure"] },
        { name: "interested", label: "Interested in earning from eligible parcels?", kind: "select", options: ["Yes", "Maybe"] },
      ],
    ],
  },
  merchant: {
    title: "I'm a merchant",
    thanks: "Thank you! Our business team will contact you.",
    steps: [
      [
        { name: "businessName", label: "Business name", kind: "text" },
        { name: "fullName", label: "Contact person", kind: "text" },
        { name: "phone", label: "WhatsApp number (with country code)", kind: "tel", placeholder: "+44 7…" },
        { name: "email", label: "Email", kind: "email" },
      ],
      [
        { name: "location", label: "Business location", kind: "text" },
        { name: "category", label: "Business category", kind: "text", placeholder: "e.g. Fashion, food, electronics" },
        { name: "destinations", label: "Delivery destinations", kind: "text" },
        { name: "volume", label: "Monthly parcel volume", kind: "select", options: ["1–10", "11–50", "51–200", "200+"] },
        { name: "needs", label: "Delivery needs", kind: "select", options: ["Local", "International", "Both"] },
        { name: "when", label: "When do you need service?", kind: "select", options: ["Immediately", "Within 30 days", "Exploring"] },
      ],
    ],
  },
};

/** Returns an error message for a field, or null if valid. */
export function validateField(f: Field, value: string): string | null {
  const v = value.trim();
  if (!v) return f.optional ? null : f.kind === "select" ? `Please choose ${f.label.toLowerCase()}` : `Please enter ${f.label.toLowerCase()}`;
  if (v.length > 300) return "Please keep this under 300 characters";
  if (f.kind === "tel") {
    const digits = v.replace(/\D/g, "").replace(/^00/, "");
    if (!v.startsWith("+") && !v.startsWith("00")) return "Start with your country code, e.g. +44 7700 900123";
    if (digits.length < 8 || digits.length > 15) return "That number looks too short or too long. Check the digits and country code";
  }
  if (f.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter an email like name@example.com";
  if (f.kind === "date" && v < new Date().toISOString().slice(0, 10)) return "Please choose today or a future date";
  if (f.kind === "text" && v.length < 2) return "Please enter at least 2 characters";
  return null;
}

/** Prefilled WhatsApp message: reference and route only, no personal details. */
export function whatsappLink(type: LeadType, reference: string, values: Record<string, string>) {
  const route = type === "merchant" ? "" : ` (${values.origin} → ${values.destination})`;
  const text = {
    sender: `Hi QikParcel, I'd like a quote for my parcel request ${reference}${route}.`,
    traveller: `Hi QikParcel, I've shared my travel details, reference ${reference}${route}.`,
    merchant: `Hi QikParcel, business enquiry ${reference}. I'd like to discuss delivery options.`,
  }[type];
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
