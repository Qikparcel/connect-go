const ZW_PLACES = ["zimbabwe", "harare", "bulawayo", "mutare", "gweru", "masvingo", "victoria falls"];

export const isZimbabweRoute = (origin?: string | null, destination?: string | null) => {
  const text = `${origin ?? ""} ${destination ?? ""}`.toLowerCase();
  return ZW_PLACES.some((p) => text.includes(p));
};
