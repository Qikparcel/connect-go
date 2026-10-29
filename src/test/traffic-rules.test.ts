import { describe, expect, it } from "vitest";
import { configuredLimit, retryMessage, TRAFFIC_DEFAULTS } from "../../supabase/functions/_shared/traffic-rules";
describe("server traffic rules", () => {
  it("chat session permits 12 messages per 60 seconds", () => expect(TRAFFIC_DEFAULTS.chat.session).toEqual([12, 60]));
  it("leads and quotes share five requests per contact per hour", () => expect(TRAFFIC_DEFAULTS.lead.contact).toEqual([5, 3600]));
  it("shared network ceiling is above a single chat session", () => expect(TRAFFIC_DEFAULTS.chat.network[0]).toBeGreaterThan(TRAFFIC_DEFAULTS.chat.session[0]));
  it("accepts server configured positive limits", () => expect(configuredLimit("25", 12)).toBe(25));
  it.each(["0", "-1", "NaN", "Infinity", "100001", "1.5"])("rejects unsafe setting %s", (v) => expect(configuredLimit(v, 12)).toBe(12));
  it("provides a positive retry delay", () => expect(retryMessage(0)).toContain("1 seconds"));
});