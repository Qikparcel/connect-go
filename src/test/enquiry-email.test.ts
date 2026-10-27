import { describe, it, expect } from "vitest";
import { ENQUIRY_RECIPIENT, NOTIFICATION_SENDER_LOCAL_PART } from "../../supabase/functions/_shared/enquiry-email-config";

describe("enquiry notification routing", () => {
  it("routes team enquiry notifications to admin@qikparcel.com", () => {
    expect(ENQUIRY_RECIPIENT).toBe("admin@qikparcel.com");
  });
  it("uses admin as the notification sender on the configured display domain", () => {
    expect(`${NOTIFICATION_SENDER_LOCAL_PART}@qikparcel.com`).toBe("admin@qikparcel.com");
  });
});