import { describe, it, expect } from "vitest";
import {
  buildSteps,
  defaultOnboardingValues,
  onboardingSchema,
  type OnboardingValues,
} from "@/components/onboarding/schema";
import { toOnboardingRow } from "@/components/onboarding/submission";

const validContact = {
  fullName: "Tanaka Moyo",
  phone: "+44 7700 900123",
};

const complete = (overrides: Partial<OnboardingValues>): OnboardingValues => ({
  ...defaultOnboardingValues,
  heardAbout: "Zimfest",
  ...validContact,
  ...overrides,
});

const errorPaths = (values: OnboardingValues) => {
  const result = onboardingSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
};

describe("buildSteps", () => {
  it("always opens with attribution then role selection", () => {
    expect(buildSteps(["Sender"]).slice(0, 2)).toEqual(["heardAbout", "roles"]);
  });

  it("always ends with contact capture", () => {
    expect(buildSteps(["Business"]).at(-1)).toBe("contact");
  });

  it("includes only the branches that were ticked", () => {
    expect(buildSteps(["Business"])).toEqual(["heardAbout", "roles", "business", "contact"]);
  });

  it("walks a multi-role person through every relevant branch", () => {
    // The vendor who also flies home monthly — the reason this is one form.
    expect(buildSteps(["Business", "Traveller"])).toEqual([
      "heardAbout",
      "roles",
      "traveller",
      "business",
      "contact",
    ]);
  });

  it("orders branches consistently regardless of tick order", () => {
    expect(buildSteps(["Courier", "Sender", "Traveller"])).toEqual(
      buildSteps(["Traveller", "Sender", "Courier"]),
    );
  });

  it("handles all four roles", () => {
    expect(buildSteps(["Traveller", "Sender", "Business", "Courier"])).toHaveLength(7);
  });
});

describe("onboardingSchema", () => {
  it("requires at least one role", () => {
    expect(errorPaths(complete({ roles: [] }))).toContain("roles");
  });

  it("requires a name and phone number", () => {
    const paths = errorPaths(complete({ roles: ["Sender"], fullName: "", phone: "" }));
    expect(paths).toContain("fullName");
    expect(paths).toContain("phone");
  });

  it("treats email as optional but validates it when present", () => {
    const base = {
      roles: ["Sender"] as const,
      senderItems: "Clothes",
      senderFrequency: "Monthly" as const,
      senderFrom: "London",
      senderTo: "Harare",
    };
    expect(errorPaths(complete({ ...base, email: "" }))).toEqual([]);
    expect(errorPaths(complete({ ...base, email: "not-an-email" }))).toContain("email");
  });

  it("does not demand business fields from someone who only ticked Traveller", () => {
    const paths = errorPaths(
      complete({
        roles: ["Traveller"],
        travellerFrom: "Manchester",
        travellerTo: "Harare",
        travellerFrequency: "Monthly",
      }),
    );
    expect(paths).toEqual([]);
  });

  it("demands business fields once Business is ticked", () => {
    const paths = errorPaths(complete({ roles: ["Business"] }));
    expect(paths).toEqual(
      expect.arrayContaining([
        "businessName",
        "businessSells",
        "businessFrequency",
        "businessShipsTo",
        "businessChallenges",
      ]),
    );
  });

  it("asks what they sell when the Other category is picked", () => {
    const paths = errorPaths(
      complete({
        roles: ["Business"],
        businessName: "Moyo Cosmetics",
        businessSells: ["Other"],
        businessFrequency: "Weekly",
        businessShipsTo: "UK and Zimbabwe",
        businessChallenges: ["Cost"],
      }),
    );
    expect(paths).toEqual(["businessSellsOther"]);
  });

  it("asks where they heard about us when Other is picked", () => {
    const paths = errorPaths(
      complete({
        heardAbout: "Other",
        roles: ["Traveller"],
        travellerFrom: "Leeds",
        travellerTo: "Bulawayo",
        travellerFrequency: "Occasionally",
      }),
    );
    expect(paths).toEqual(["heardAboutOther"]);
  });

  it("rejects a filled honeypot", () => {
    expect(errorPaths(complete({ roles: ["Sender"], website: "http://spam.example" }))).toContain(
      "website",
    );
  });
});

describe("toOnboardingRow", () => {
  it("nulls out branches the user did not tick", () => {
    const row = toOnboardingRow(
      complete({
        roles: ["Traveller"],
        travellerFrom: "Manchester",
        travellerTo: "Harare",
        travellerFrequency: "Monthly",
        // Stale values from a branch they un-ticked partway through.
        businessName: "Should not be saved",
        businessSells: ["Clothing"],
      }),
      null,
    );

    expect(row.traveller_route_from).toBe("Manchester");
    expect(row.business_name).toBeNull();
    expect(row.business_sells).toBeNull();
  });

  it("keeps every branch for a multi-role submission", () => {
    const row = toOnboardingRow(
      complete({
        roles: ["Business", "Traveller"],
        travellerFrom: "London",
        travellerTo: "Harare",
        travellerFrequency: "Monthly",
        businessName: "Moyo Cosmetics",
        businessSells: ["Cosmetics"],
        businessFrequency: "Weekly",
        businessShipsTo: "UK, SA",
        businessChallenges: ["Cost", "Customs"],
      }),
      "zimfest",
    );

    expect(row.roles).toEqual(["Business", "Traveller"]);
    expect(row.traveller_route_to).toBe("Harare");
    expect(row.business_name).toBe("Moyo Cosmetics");
    expect(row.business_challenges).toEqual(["Cost", "Customs"]);
    expect(row.source).toBe("zimfest");
  });

  it("records the campaign source separately from the self-reported channel", () => {
    const row = toOnboardingRow(
      complete({ roles: ["Sender"], heardAbout: "Referral" }),
      "zimfest",
    );
    expect(row.heard_about).toBe("Referral");
    expect(row.source).toBe("zimfest");
  });

  it("stores blank optional fields as null rather than empty strings", () => {
    const row = toOnboardingRow(complete({ roles: ["Sender"], email: "", city: "" }), null);
    expect(row.email).toBeNull();
    expect(row.city).toBeNull();
    expect(row.source).toBeNull();
  });
});
