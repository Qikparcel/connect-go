// Lead priority rules. Imported by the submit-lead function and by unit tests.
export type LeadType = "sender" | "traveller" | "merchant";
export type Priority = "HOT" | "WARM" | "FUTURE";

export function leadPriority(type: LeadType, urgency: string, capacity?: string): Priority {
  if (type === "sender") {
    if (urgency === "Now" || urgency === "Ready now" || urgency === "Within 3 days") return "HOT";
    if (urgency === "Within 7 days" || urgency === "Within 30 days") return "WARM";
    return "FUTURE";
  }
  if (type === "traveller") {
    const soon = urgency === "Within 48 hours" || urgency === "Within 7 days";
    const hasSpace = !!capacity && capacity !== "Unsure" && capacity !== "None";
    if (soon && hasSpace) return "HOT";
    if (soon || urgency === "Within 30 days") return "WARM";
    return "FUTURE";
  }
  if (urgency === "Immediately") return "HOT";
  if (urgency === "Within 30 days" || urgency === "This month") return "WARM";
  return "FUTURE";
}

/** Keeps digits only, with a leading +. Returns null when it can't be a real number. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "").replace(/^00/, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}
