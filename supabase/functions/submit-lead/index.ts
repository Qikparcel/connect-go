import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { leadPriority, normalizePhone } from "../_shared/priority.ts";

const CITIES = ["London", "Harare", "Johannesburg", "Other"] as const;
const WEIGHTS = ["Under 1kg", "1–5kg", "5–10kg", "Over 10kg"] as const;
const str = (max: number) => z.string().trim().max(max);
const optEmail = z.union([z.literal(""), z.string().trim().email().max(255)]).optional();
const date = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).optional();

const common = {
  phone: str(30).min(6),
  consent: z.literal(true),
  website: z.string().max(0).optional(), // honeypot: must stay empty
  source: str(100).optional(),
  utm: z.record(str(200)).optional(),
};

const Body = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("sender"), ...common,
    fullName: str(100).min(2), email: optEmail,
    origin: z.enum(CITIES), destination: z.enum(CITIES),
    readiness: z.enum(["Now", "Within 7 days", "Within 30 days", "Just exploring"]),
    sendDate: date, parcelType: z.enum(["Documents", "Clothing", "Gifts", "Other"]),
    weight: z.enum(WEIGHTS), wantsQuote: z.enum(["Yes", "No"]),
  }),
  z.object({
    type: z.literal("traveller"), ...common,
    fullName: str(100).min(2), email: optEmail,
    origin: z.enum(CITIES), destination: z.enum(CITIES), departureDate: date,
    travelling: z.enum(["Within 48 hours", "Within 7 days", "Within 30 days", "No confirmed trip"]),
    capacity: z.enum([...WEIGHTS, "Unsure"]), interested: z.enum(["Yes", "Maybe"]),
  }),
  z.object({
    type: z.literal("merchant"), ...common,
    businessName: str(120).min(2), fullName: str(100).min(2), email: z.string().trim().email().max(255),
    location: str(120).min(2), category: str(120).min(2), destinations: str(300).min(2),
    volume: z.enum(["1–10", "11–50", "51–200", "200+"]),
    needs: z.enum(["Local", "International", "Both"]),
    when: z.enum(["Immediately", "Within 30 days", "Exploring"]),
  }),
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const makeRef = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "QP-" + Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Please check the form and try again.", fields: parsed.error.flatten().fieldErrors }, 400);
    const d = parsed.data;
    if (d.website) return json({ reference: makeRef() }); // silently drop bots
    const phone = normalizePhone(d.phone);
    if (!phone) return json({ error: "Please enter a valid WhatsApp number with country code." }, 400);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Create the contact only if new; never overwrite an existing contact's stored details
    // from an unauthenticated submission. Submitted details are kept on the lead itself.
    const { error: insErr } = await db.from("lead_contacts").upsert(
      { phone, full_name: d.fullName, email: d.email || null, business_name: d.type === "merchant" ? d.businessName : null },
      { onConflict: "phone", ignoreDuplicates: true },
    );
    if (insErr) throw insErr;
    const { data: contact, error: cErr } = await db.from("lead_contacts").select("id").eq("phone", phone).single();
    if (cErr) throw cErr;
    const submitted = { submittedName: d.fullName, submittedEmail: d.email || null, submittedBusiness: d.type === "merchant" ? d.businessName : null };

    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from("leads").select("id", { count: "exact", head: true })
      .eq("contact_id", contact.id).gte("created_at", since);
    if ((count ?? 0) >= 5) return json({ error: "You've sent several requests in the last hour. Please try again later or message us on WhatsApp." }, 429);

    let row: Record<string, unknown>;
    if (d.type === "sender") {
      row = { origin: d.origin, destination: d.destination, travel_date: d.sendDate || null, urgency: d.readiness, weight: d.weight,
        priority: leadPriority("sender", d.readiness), details: { parcelType: d.parcelType, wantsQuote: d.wantsQuote } };
    } else if (d.type === "traveller") {
      row = { origin: d.origin, destination: d.destination, travel_date: d.departureDate || null, urgency: d.travelling, weight: d.capacity,
        priority: leadPriority("traveller", d.travelling, d.capacity), details: { interested: d.interested } };
    } else {
      row = { origin: d.location, destination: d.destinations, urgency: d.when, weight: d.volume,
        priority: leadPriority("merchant", d.when), details: { category: d.category, needs: d.needs, contactPerson: d.fullName } };
    }

    for (let i = 0; i < 3; i++) {
      const reference = makeRef();
      const { error } = await db.from("leads").insert({
        ...row, reference, contact_id: contact.id, lead_type: d.type, consent: true,
        source: d.source || null, utm: d.utm ?? {},
      });
      if (!error) return json({ reference, priority: row.priority });
      if (error.code !== "23505") throw error;
    }
    throw new Error("Could not create reference");
  } catch (e) {
    console.error("submit-lead failed", e);
    return json({ error: "Something went wrong saving your details. Please try again." }, 500);
  }
});
