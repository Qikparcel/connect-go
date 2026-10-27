import { describe, it, expect } from "vitest";
import { leadPriority, normalizePhone } from "../../supabase/functions/_shared/priority";

describe("lead priority", () => {
  it("sender with parcel ready now is HOT", () => expect(leadPriority("sender", "Now")).toBe("HOT"));
  it("sender within 30 days is WARM", () => expect(leadPriority("sender", "Within 30 days")).toBe("WARM"));
  it("exploring sender is FUTURE", () => expect(leadPriority("sender", "Just exploring")).toBe("FUTURE"));
  it("traveller within 7 days with spare space is HOT", () => expect(leadPriority("traveller", "Within 7 days", "1–5kg")).toBe("HOT"));
  it("traveller within 48h but unsure of space is WARM", () => expect(leadPriority("traveller", "Within 48 hours", "Unsure")).toBe("WARM"));
  it("traveller with no confirmed trip is FUTURE", () => expect(leadPriority("traveller", "No confirmed trip", "5–10kg")).toBe("FUTURE"));
  it("merchant needing service immediately is HOT", () => expect(leadPriority("merchant", "Immediately")).toBe("HOT"));
  it("exploring merchant is FUTURE", () => expect(leadPriority("merchant", "Exploring")).toBe("FUTURE"));
  it("same number in different formats matches one person", () =>
    expect(normalizePhone("+44 7443 191370")).toBe(normalizePhone("0044-7443191370")));
});
