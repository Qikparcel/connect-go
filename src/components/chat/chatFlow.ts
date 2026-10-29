export type Role = "sender" | "traveller" | "merchant";

export type Step = {
  key: string;
  ask: string | ((a: Answers) => string);
  options?: string[];
  /** Free-text input type when there are no options, or when "Other" is chosen. */
  input?: "text" | "tel" | "date";
  /** Skip this step when it returns true. */
  skip?: (a: Answers) => boolean;
};

export type Answers = Record<string, string>;

const CITIES = ["London", "Harare", "Johannesburg", "Other"];
const WEIGHTS = ["Under 1kg", "1–5kg", "5–10kg", "Over 10kg"];
const first = (a: Answers) => (a.fullName || "").trim().split(/\s+/)[0] || "there";

export const FLOWS: Record<Role, Step[]> = {
  sender: [
    { key: "origin", ask: "Great! Where are you sending your parcel from?", options: CITIES },
    { key: "destination", ask: "Where is it going?", options: CITIES },
    { key: "readiness", ask: "When do you want to send it?", options: ["Ready now", "Within 3 days", "Within 7 days", "Within 30 days", "Later"] },
    { key: "parcelType", ask: "What are you sending?", options: ["Documents", "Clothing", "Gifts", "Other"] },
    { key: "weight", ask: "Approximately how much does it weigh?", options: [...WEIGHTS, "Not sure"] },
    { key: "fullName", ask: "Perfect. What's your name?", input: "text" },
    { key: "phone", ask: (a) => `Thanks, ${first(a)}. What's your WhatsApp number, including country code?`, input: "tel" },
    { key: "consent", ask: "Would you like us to contact you about delivery options?", options: ["Yes, contact me", "No, just save my enquiry"] },
  ],
  traveller: [
    { key: "origin", ask: "Great! Where are you travelling from?", options: CITIES },
    { key: "destination", ask: "Where are you travelling to?", options: CITIES },
    { key: "travelling", ask: "When are you travelling?", options: ["Within 48 hours", "Within 7 days", "Within 30 days", "Not booked yet"] },
    { key: "departureDate", ask: "What's your departure date?", input: "date", skip: (a) => a.travelling === "Not booked yet" },
    { key: "spareSpace", ask: "Do you have spare luggage space?", options: ["Yes", "Maybe", "No"] },
    { key: "capacity", ask: "Approximately how much space?", options: WEIGHTS, skip: (a) => a.spareSpace !== "Yes" },
    { key: "interested", ask: "Would you like to earn by carrying eligible parcels?", options: ["Yes", "Tell me more", "Not now"] },
    { key: "fullName", ask: "What's your name?", input: "text" },
    { key: "phone", ask: (a) => `Thanks, ${first(a)}. What's your WhatsApp number, including country code?`, input: "tel" },
    { key: "consent", ask: "May we contact you about suitable delivery opportunities?", options: ["Yes", "No"] },
  ],
  merchant: [
    { key: "businessName", ask: "Welcome! Let's find out what your business needs. What's your business name?", input: "text" },
    { key: "location", ask: "Where is your business based?", options: ["UK", "Zimbabwe", "South Africa", "Other"] },
    { key: "deliverTo", ask: "Where do you need to deliver?", options: ["Local", "National", "International", "Multiple destinations"] },
    { key: "volume", ask: "How many parcels do you expect to send monthly?", options: ["1–10", "11–50", "51–200", "Over 200", "Not sure"] },
    { key: "when", ask: "When would you like to start?", options: ["Immediately", "This month", "Just exploring"] },
    { key: "fullName", ask: "What's your name?", input: "text" },
    { key: "phone", ask: "And your business WhatsApp number, including country code?", input: "tel" },
    { key: "consent", ask: "May our team contact you to discuss delivery options?", options: ["Yes", "No"] },
  ],
};

export const activeSteps = (role: Role, a: Answers) => FLOWS[role].filter((s) => !s.skip?.(a));

export const askText = (s: Step, a: Answers) => (typeof s.ask === "function" ? s.ask(a) : s.ask);

/** Returns an error message, or null when the free-text answer is acceptable. */
export function validate(s: Step, value: string): string | null {
  const v = value.trim();
  if (s.input === "tel") {
    const digits = v.replace(/[^\d]/g, "").replace(/^00/, "");
    if (digits.length < 8 || digits.length > 15) return "Please enter a WhatsApp number with country code, e.g. +44 7…";
    return null;
  }
  if (s.input === "date") return /^\d{4}-\d{2}-\d{2}$/.test(v) ? null : "Please pick a date.";
  if (v.length < 2) return "Please type a little more.";
  if (v.length > (s.key === "businessName" ? 120 : 60) && s.key !== "fullName") return "That's a bit long — please shorten it.";
  if (s.key === "fullName" && v.length > 100) return "That's a bit long — please shorten it.";
  return null;
}

const CONSENT_YES = ["Yes", "Yes, contact me"];

/** Builds the submit-lead request body for a completed chat. */
export function toPayload(role: Role, a: Answers, utm: Record<string, string>) {
  const base = { phone: a.phone, fullName: a.fullName, consent: CONSENT_YES.includes(a.consent), utm, source: "website_chat" };
  if (role === "sender")
    return { ...base, type: "chat_sender", origin: a.origin, destination: a.destination, readiness: a.readiness, parcelType: a.parcelType, weight: a.weight };
  if (role === "traveller")
    return {
      ...base, type: "chat_traveller", origin: a.origin, destination: a.destination, departureDate: a.departureDate || "",
      travelling: a.travelling, spareSpace: a.spareSpace,
      capacity: a.spareSpace === "Yes" ? a.capacity : a.spareSpace === "Maybe" ? "Unsure" : "None", interested: a.interested,
    };
  return { ...base, type: "chat_merchant", businessName: a.businessName, location: a.location, deliverTo: a.deliverTo, volume: a.volume, when: a.when };
}

export const confirmation = (role: Role, a: Answers, ref: string) => {
  const name = first(a);
  if (role === "sender") return `Thanks, ${name}! We've received your parcel enquiry from ${a.origin} to ${a.destination}. Your reference is ${ref}.`;
  if (role === "traveller") return `Thanks, ${name}! We've received your travel details for ${a.origin} to ${a.destination}. We'll review potential opportunities. Your reference is ${ref}.`;
  return `Thanks! We've received your business enquiry for ${a.businessName}. Our team can discuss suitable delivery solutions with you. Your reference is ${ref}.`;
};
