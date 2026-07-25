import { describe, it, expect } from "vitest";

/**
 * Mirrors the sanitiser in src/integrations/supabase/client.ts. A trailing
 * table-border character copied out of a terminal produced a 401 "Invalid API
 * key" in production that gave no hint it was a copy-paste problem.
 */
const clean = (value: string | undefined) => value?.trim().replace(/[|│]$/, "").trim() || undefined;

const KEY = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.signature";

describe("credential sanitiser", () => {
  it("leaves a clean value untouched", () => {
    expect(clean(KEY)).toBe(KEY);
  });

  it("strips a trailing markdown table border", () => {
    expect(clean(`${KEY} │`)).toBe(KEY);
    expect(clean(`${KEY} |`)).toBe(KEY);
  });

  it("strips stray whitespace and newlines", () => {
    expect(clean(`  ${KEY}\n`)).toBe(KEY);
    expect(clean(`${KEY}\r\n`)).toBe(KEY);
  });

  it("treats blank and missing values as unconfigured", () => {
    expect(clean("   ")).toBeUndefined();
    expect(clean("")).toBeUndefined();
    expect(clean(undefined)).toBeUndefined();
  });
});
