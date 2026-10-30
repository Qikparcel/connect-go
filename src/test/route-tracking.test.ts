import { describe, expect, it } from "vitest";
import { routeLabel, summariseRouteClicks } from "@/lib/routeTracking";

describe("route click summary", () => {
  it("counts each button per route direction and ranks the busiest first", () => {
    const rows = summariseRouteClicks([
      routeLabel("London-Harare", "London→Harare", "enquiry"),
      routeLabel("Harare-Johannesburg", "Harare→Johannesburg", "whatsapp"),
      routeLabel("Harare-Johannesburg", "Harare→Johannesburg", "enquiry"),
      "whatsapp_optin:QP-1",
      null,
    ]);
    expect(rows[0]).toEqual({ route: "Harare-Johannesburg", direction: "Harare→Johannesburg", enquiry: 1, whatsapp: 1, traveller: 0, total: 2 });
    expect(rows).toHaveLength(2);
  });
  it("keeps labels within the 100 character database limit", () => {
    expect(routeLabel("Harare-Johannesburg", "Johannesburg→Harare", "traveller").length).toBeLessThanOrEqual(100);
  });
});
