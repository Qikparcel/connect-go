import { describe, expect, it } from "vitest";
import { screenEnquiry, needsHuman, containsSensitiveData } from "../../supabase/functions/_shared/chat-safety";
describe("critical chatbot safety controls", () => {
  it("rejects prohibited goods even on a documents corridor", () => expect(screenEnquiry("London", "Harare", "Documents and cash").status).toBe("prohibited"));
  it("requires review for international clothing", () => expect(screenEnquiry("London", "Harare", "Clothing").status).toBe("review_required"));
  it("never authorises a booking for documents", () => expect(screenEnquiry("London", "Harare", "Documents").bookingAllowed).toBe(false));
  it("recognises the Estonia documents pilot", () => expect(screenEnquiry("Tallinn", "London", "Documents").status).toBe("documents_pilot"));
  it("fails closed for unknown routes", () => expect(screenEnquiry("Other", "Harare", "Documents").status).toBe("review_required"));
  it.each(["lost parcel", "damaged parcel", "customs hold", "confiscation", "fraud", "refund request", "payment dispute", "safety incident", "complaint", "verification failed", "unknown tracking", "still not working", "undeclared goods"])("offers human support for %s", (text) => expect(needsHuman(text)).toBe(true));
  it("blocks card numbers from model and chat persistence", () => expect(containsSensitiveData("4111 1111 1111 1111")).toBe(true));
  it("blocks disclosed passwords", () => expect(containsSensitiveData("password: not-a-real-password")).toBe(true));
  it("does not mistake a UK contact phone for a card", () => expect(containsSensitiveData("+44 7443 191370")).toBe(false));
  it("treats Harare to Johannesburg documents as a pilot enquiry", () => expect(screenEnquiry("Harare", "Johannesburg", "Documents").status).toBe("documents_pilot"));
  it("treats Johannesburg to Harare documents as a pilot enquiry", () => expect(screenEnquiry("Johannesburg", "Harare", "Documents").status).toBe("documents_pilot"));
  it("still requires review for clothing on Harare to Johannesburg", () => expect(screenEnquiry("Harare", "Johannesburg", "Clothing").status).toBe("review_required"));
});
