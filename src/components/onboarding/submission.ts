import type { OnboardingValues } from "./schema";

export type OnboardingRow = {
  heard_about: string;
  heard_about_other: string | null;
  source: string | null;
  roles: string[];
  traveller_route_from: string | null;
  traveller_route_to: string | null;
  traveller_frequency: string | null;
  traveller_next_trip: string | null;
  sender_items: string | null;
  sender_frequency: string | null;
  sender_route_from: string | null;
  sender_route_to: string | null;
  business_name: string | null;
  business_sells: string[] | null;
  business_sells_other: string | null;
  business_send_frequency: string | null;
  business_ships_to: string | null;
  business_challenges: string[] | null;
  courier_vehicle: string | null;
  courier_areas: string | null;
  courier_availability: string | null;
  courier_capacity: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  country: string | null;
  consent_marketing: boolean;
};

const nullify = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const nullifyList = (value: readonly string[] | undefined): string[] | null =>
  value && value.length > 0 ? [...value] : null;

/**
 * Flattens the form into a database row. Branches the user did not tick are
 * written as NULL rather than empty strings, so exports stay readable.
 */
export function toOnboardingRow(values: OnboardingValues, source: string | null): OnboardingRow {
  const has = (role: string) => values.roles.includes(role as OnboardingValues["roles"][number]);
  const traveller = has("Traveller");
  const sender = has("Sender");
  const business = has("Business");
  const courier = has("Courier");

  return {
    heard_about: values.heardAbout,
    heard_about_other: values.heardAbout === "Other" ? nullify(values.heardAboutOther) : null,
    source: nullify(source ?? undefined),
    roles: [...values.roles],

    traveller_route_from: traveller ? nullify(values.travellerFrom) : null,
    traveller_route_to: traveller ? nullify(values.travellerTo) : null,
    traveller_frequency: traveller ? (values.travellerFrequency ?? null) : null,
    traveller_next_trip: traveller ? nullify(values.travellerNextTrip) : null,

    sender_items: sender ? nullify(values.senderItems) : null,
    sender_frequency: sender ? (values.senderFrequency ?? null) : null,
    sender_route_from: sender ? nullify(values.senderFrom) : null,
    sender_route_to: sender ? nullify(values.senderTo) : null,

    business_name: business ? nullify(values.businessName) : null,
    business_sells: business ? nullifyList(values.businessSells) : null,
    business_sells_other:
      business && values.businessSells.includes("Other") ? nullify(values.businessSellsOther) : null,
    business_send_frequency: business ? (values.businessFrequency ?? null) : null,
    business_ships_to: business ? nullify(values.businessShipsTo) : null,
    business_challenges: business ? nullifyList(values.businessChallenges) : null,

    courier_vehicle: courier ? (values.courierVehicle ?? null) : null,
    courier_areas: courier ? nullify(values.courierAreas) : null,
    courier_availability: courier ? (values.courierAvailability ?? null) : null,
    courier_capacity: courier ? nullify(values.courierCapacity) : null,

    full_name: values.fullName.trim(),
    phone: values.phone.trim(),
    email: nullify(values.email),
    city: nullify(values.city),
    country: nullify(values.country),
    consent_marketing: values.consentMarketing,
  };
}
