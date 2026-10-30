import { describe, it, expect } from "vitest";
import { isZimbabweRoute } from "@/lib/zimbabweEnquiries";

describe("isZimbabweRoute", () => {
  it("includes enquiries to or from Zimbabwe places", () => {
    expect(isZimbabweRoute("London", "Harare")).toBe(true);
    expect(isZimbabweRoute("Bulawayo, Zimbabwe", "Johannesburg")).toBe(true);
  });
  it("excludes routes without Zimbabwe", () => {
    expect(isZimbabweRoute("London", "Tallinn")).toBe(false);
    expect(isZimbabweRoute(null, null)).toBe(false);
  });
});
