import { z } from "zod";

export const HEARD_ABOUT_OPTIONS = [
  "Zimfest",
  "Airport",
  "WhatsApp",
  "Facebook",
  "Instagram",
  "Referral",
  "Other",
] as const;

export const ROLES = ["Traveller", "Sender", "Business", "Courier"] as const;

export const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Occasionally"] as const;

export const BUSINESS_CATEGORIES = [
  "Clothing",
  "Cosmetics",
  "Food",
  "Electronics",
  "Documents",
  "Other",
] as const;

export const BUSINESS_CHALLENGES = [
  "Cost",
  "Speed",
  "Reliability",
  "Customs",
  "Finding trusted couriers",
] as const;

export const VEHICLE_TYPES = [
  "Car",
  "Van",
  "Motorbike",
  "Bicycle",
  "On foot",
  "Public transport",
] as const;

export type Role = (typeof ROLES)[number];

const text = z.string().trim().max(200);
const longText = z.string().trim().max(1000);

export const onboardingSchema = z
  .object({
    // Attribution
    heardAbout: z.enum(HEARD_ABOUT_OPTIONS, {
      errorMap: () => ({ message: "Please pick one so we know where you found us" }),
    }),
    heardAboutOther: text,

    // Roles
    roles: z.array(z.enum(ROLES)).min(1, "Tick at least one — you can pick more than one"),

    // Traveller branch
    travellerFrom: text,
    travellerTo: text,
    travellerFrequency: z.enum(FREQUENCIES).optional(),
    travellerNextTrip: text,

    // Sender branch
    senderItems: longText,
    senderFrequency: z.enum(FREQUENCIES).optional(),
    senderFrom: text,
    senderTo: text,

    // Business branch
    businessName: text,
    businessSells: z.array(z.enum(BUSINESS_CATEGORIES)),
    businessSellsOther: text,
    businessFrequency: z.enum(FREQUENCIES).optional(),
    businessShipsTo: longText,
    businessChallenges: z.array(z.enum(BUSINESS_CHALLENGES)),

    // Courier branch
    courierVehicle: z.enum(VEHICLE_TYPES).optional(),
    courierAreas: longText,
    courierAvailability: z.enum(FREQUENCIES).optional(),
    courierCapacity: text,

    // Contact
    fullName: z.string().trim().min(2, "Please tell us your name").max(120),
    phone: z
      .string()
      .trim()
      .min(7, "Please enter a reachable number")
      .max(30)
      .regex(/^[+\d][\d\s()-]*$/, "Digits only, with an optional leading +"),
    email: z.union([z.literal(""), z.string().trim().email("That doesn't look like a valid email")]),
    city: text,
    country: text,
    consentMarketing: z.boolean(),

    // Honeypot — humans never see this, so anything in it means a bot.
    website: z.string().max(0),
  })
  .superRefine((values, ctx) => {
    const require = (field: keyof typeof values, message: string) => {
      const value = values[field];
      const empty = value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
      if (empty) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
    };

    if (values.heardAbout === "Other") {
      require("heardAboutOther", "Let us know where you heard about us");
    }

    if (values.roles.includes("Traveller")) {
      require("travellerFrom", "Where do you travel from?");
      require("travellerTo", "Where do you travel to?");
      require("travellerFrequency", "How often do you travel?");
    }

    if (values.roles.includes("Sender")) {
      require("senderItems", "Tell us what you usually send");
      require("senderFrequency", "How often do you send?");
      require("senderFrom", "Where do you send from?");
      require("senderTo", "Where do you send to?");
    }

    if (values.roles.includes("Business")) {
      require("businessName", "What's your business called?");
      require("businessSells", "Pick at least one");
      require("businessFrequency", "How often do you send products?");
      require("businessShipsTo", "Where do you currently ship to?");
      require("businessChallenges", "Pick at least one");
      if (values.businessSells.includes("Other")) {
        require("businessSellsOther", "Tell us what you sell");
      }
    }

    if (values.roles.includes("Courier")) {
      require("courierVehicle", "How do you get around?");
      require("courierAreas", "Which areas do you cover?");
      require("courierAvailability", "How often are you available?");
    }
  });

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const defaultOnboardingValues: OnboardingValues = {
  heardAbout: undefined as unknown as OnboardingValues["heardAbout"],
  heardAboutOther: "",
  roles: [],
  travellerFrom: "",
  travellerTo: "",
  travellerFrequency: undefined,
  travellerNextTrip: "",
  senderItems: "",
  senderFrequency: undefined,
  senderFrom: "",
  senderTo: "",
  businessName: "",
  businessSells: [],
  businessSellsOther: "",
  businessFrequency: undefined,
  businessShipsTo: "",
  businessChallenges: [],
  courierVehicle: undefined,
  courierAreas: "",
  courierAvailability: undefined,
  courierCapacity: "",
  fullName: "",
  phone: "",
  email: "",
  city: "",
  country: "",
  consentMarketing: false,
  website: "",
};

export type StepId = "heardAbout" | "roles" | "traveller" | "sender" | "business" | "courier" | "contact";

/**
 * Branch steps always appear in this order regardless of the order the user
 * ticked them, so the flow feels the same for everyone.
 */
const ROLE_STEPS: { role: Role; step: StepId }[] = [
  { role: "Traveller", step: "traveller" },
  { role: "Sender", step: "sender" },
  { role: "Business", step: "business" },
  { role: "Courier", step: "courier" },
];

export const STEP_FIELDS: Record<StepId, (keyof OnboardingValues)[]> = {
  heardAbout: ["heardAbout", "heardAboutOther"],
  roles: ["roles"],
  traveller: ["travellerFrom", "travellerTo", "travellerFrequency", "travellerNextTrip"],
  sender: ["senderItems", "senderFrequency", "senderFrom", "senderTo"],
  business: [
    "businessName",
    "businessSells",
    "businessSellsOther",
    "businessFrequency",
    "businessShipsTo",
    "businessChallenges",
  ],
  courier: ["courierVehicle", "courierAreas", "courierAvailability", "courierCapacity"],
  contact: ["fullName", "phone", "email", "city", "country", "consentMarketing"],
};

export const STEP_TITLES: Record<StepId, string> = {
  heardAbout: "How did you hear about QikParcel?",
  roles: "Which best describes you?",
  traveller: "About your travel",
  sender: "About what you send",
  business: "About your business",
  courier: "About your deliveries",
  contact: "Your details",
};

/** The step list is dynamic — only the branches a person ticked are included. */
export function buildSteps(roles: Role[]): StepId[] {
  const branches = ROLE_STEPS.filter(({ role }) => roles.includes(role)).map(({ step }) => step);
  return ["heardAbout", "roles", ...branches, "contact"];
}
