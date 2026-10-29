import { describe, expect, it } from "vitest";
import { changedRows, limitRowError, rowsHaveErrors, windowLabel, type LimitRow } from "../components/admin/limitForm";

const row = (over: Partial<LimitRow> = {}): LimitRow => ({
  endpoint: "chat", scope: "session", max_count: 12, window_seconds: 60, saved: false, updated_at: null, ...over,
});

describe("admin limit form", () => {
  it("accepts the built-in chat session ceiling", () =>
    expect(limitRowError({ max_count: 12, window_seconds: 60 })).toBeNull());
  it("rejects a ceiling below one request", () =>
    expect(limitRowError({ max_count: 0, window_seconds: 60 })).toContain("at least 1"));
  it("rejects a fractional ceiling", () =>
    expect(limitRowError({ max_count: 1.5, window_seconds: 60 })).toContain("whole number"));
  it("rejects a ceiling above the database maximum", () =>
    expect(limitRowError({ max_count: 100001, window_seconds: 60 })).toContain("100000"));
  it("rejects a window longer than a day", () =>
    expect(limitRowError({ max_count: 12, window_seconds: 86401 })).toContain("86400"));
  it("rejects a cleared field instead of saving zero", () =>
    expect(limitRowError({ max_count: Number(""), window_seconds: 60 })).toContain("at least 1"));
  it("flags the form when any row is invalid", () => {
    expect(rowsHaveErrors([{ max_count: 12, window_seconds: 60 }, { max_count: 0, window_seconds: 60 }])).toBe(true);
    expect(rowsHaveErrors([{ max_count: 12, window_seconds: 60 }])).toBe(false);
  });
  it("sends only the rows that were changed", () => {
    const before = [row(), row({ scope: "global", max_count: 120 })];
    const after = [row({ max_count: 40 }), row({ scope: "global", max_count: 120 })];
    expect(changedRows(before, after).map((r) => r.scope)).toEqual(["session"]);
  });
  it("sends a row whose window alone changed", () => {
    const before = [row()];
    expect(changedRows(before, [row({ window_seconds: 300 })]).length).toBe(1);
  });
  it("sends nothing when the form is untouched", () =>
    expect(changedRows([row()], [row()])).toEqual([]));
  it("labels windows for the table", () => {
    expect(windowLabel(30)).toBe("30 sec");
    expect(windowLabel(3600)).toBe("1 hr");
    expect(windowLabel(7200)).toBe("2 hr");
  });
});
