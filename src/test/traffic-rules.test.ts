import { describe, expect, it } from "vitest";
import { configuredLimit, retryMessage, resolveLimit, TRAFFIC_DEFAULTS, validLimit } from "../../supabase/functions/_shared/traffic-rules";
describe("server traffic rules", () => {
  it("chat session permits 12 messages per 60 seconds", () => expect(TRAFFIC_DEFAULTS.chat.session).toEqual([12, 60]));
  it("leads and quotes share five requests per contact per hour", () => expect(TRAFFIC_DEFAULTS.lead.contact).toEqual([5, 3600]));
  it("shared network ceiling is above a single chat session", () => expect(TRAFFIC_DEFAULTS.chat.network[0]).toBeGreaterThan(TRAFFIC_DEFAULTS.chat.session[0]));
  it("accepts server configured positive limits", () => expect(configuredLimit("25", 12)).toBe(25));
  it.each(["0", "-1", "NaN", "Infinity", "100001", "1.5"])("rejects unsafe setting %s", (v) => expect(configuredLimit(v, 12)).toBe(12));
  it("provides a positive retry delay", () => expect(retryMessage(0)).toContain("1 seconds"));
});

describe("owner-saved ceilings", () => {
  const defaults = TRAFFIC_DEFAULTS.chat.session;
  it("uses a saved value over the built-in default", () =>
    expect(resolveLimit(defaults, {}, { max_count: 40, window_seconds: 120 })).toEqual([40, 120]));
  it("a saved value wins over the environment override", () =>
    expect(resolveLimit(defaults, { count: "20", seconds: "90" }, { max_count: 7, window_seconds: 30 })).toEqual([7, 30]));
  it("the environment override wins when nothing is saved", () =>
    expect(resolveLimit(defaults, { count: "20", seconds: "90" })).toEqual([20, 90]));
  it("keeps the previous ceiling when a saved row is not a whole number in range", () => {
    expect(resolveLimit(defaults, {}, { max_count: 0, window_seconds: 60 })).toEqual([12, 60]);
    expect(resolveLimit(defaults, {}, { max_count: 100001, window_seconds: 60 })).toEqual([12, 60]);
    expect(resolveLimit(defaults, {}, { max_count: 1.5, window_seconds: 60 })).toEqual([12, 60]);
    // A broken count must not silently widen the window either.
    expect(resolveLimit(defaults, {}, { max_count: 25, window_seconds: 90001 })).toEqual([25, 60]);
  });
  it("accepts the largest window the dashboard allows", () =>
    expect(resolveLimit(defaults, {}, { max_count: 5, window_seconds: 86400 })).toEqual([5, 86400]));
  it("validLimit only accepts whole numbers between 1 and 100000", () => {
    expect(validLimit(1, 12)).toBe(1);
    expect(validLimit(100000, 12)).toBe(100000);
    expect(validLimit("25", 12)).toBe(12);
    expect(validLimit(null, 12)).toBe(12);
    expect(validLimit(Number.NaN, 12)).toBe(12);
    expect(validLimit(-3, 12)).toBe(12);
  });
});
