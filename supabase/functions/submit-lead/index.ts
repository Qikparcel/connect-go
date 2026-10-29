import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { leadPriority, normalizePhone } from "../_shared/priority.ts";
import { sendTemplateEmail } from "../_shared/transactional-email-templates/send-email.ts";
import { ENQUIRY_RECIPIENT } from "../_shared/enquiry-email-config.ts";
import { screenEnquiry } from "../_shared/chat-safety.ts";

const CITIES = ["London", "Harare", "Johannesburg", "Other"] as const;
const WEIGHTS = ["Under 1kg", "1–5kg", "5–10kg", "Over 10kg"] as const;
const str = (max: number) => z.string().trim().max(max);
const optEmail = z.union([z.literal(""), z.string().trim().email().max(255)]).optional();
const date = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => {
  const parsed = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v;
}, "Please enter a real date.")]).optional();

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
    readiness: z.enum(["Now", "Within 3 days", "Within 7 days", "Within 30 days", "Just exploring"]),
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
  // Guided website chat ("Ask QikParcel")
  z.object({
    type: z.literal("chat_sender"), ...common, consent: z.boolean(),
    fullName: str(100).min(2), origin: str(60).min(2), destination: str(60).min(2),
    readiness: z.enum(["Ready now", "Within 3 days", "Within 7 days", "Within 30 days", "Later"]),
    parcelType: str(60).min(2), weight: z.enum([...WEIGHTS, "Not sure"]),
  }),
  z.object({
    type: z.literal("chat_traveller"), ...common, consent: z.boolean(),
    fullName: str(100).min(2), origin: str(60).min(2), destination: str(60).min(2), departureDate: date,
    travelling: z.enum(["Within 48 hours", "Within 7 days", "Within 30 days", "Not booked yet"]),
    spareSpace: z.enum(["Yes", "Maybe", "No"]), capacity: z.enum([...WEIGHTS, "Unsure", "None"]),
    interested: z.enum(["Yes", "Tell me more", "Not now"]),
  }),
  z.object({
    type: z.literal("chat_merchant"), ...common, consent: z.boolean(),
    businessName: str(120).min(2), fullName: str(100).min(2), location: str(60).min(2),
    deliverTo: z.enum(["Local", "National", "International", "Multiple destinations"]),
    volume: z.enum(["1–10", "11–50", "51–200", "Over 200", "Not sure"]),
    when: z.enum(["Immediately", "This month", "Just exploring"]),
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
    const eligibility = screenEnquiry(
      "origin" in d ? d.origin : d.location,
      "destination" in d ? d.destination : "destinations" in d ? d.destinations : d.deliverTo,
      "parcelType" in d ? d.parcelType : "category" in d ? d.category : "Unknown",
    );

    // Create the contact only if new; never overwrite an existing contact's stored details
    // from an unauthenticated submission. Submitted details are kept on the lead itself.
    const email = "email" in d ? d.email || null : null;
    const business = "businessName" in d ? d.businessName : null;
    const { error: insErr } = await db.from("lead_contacts").upsert(
      { phone, full_name: d.fullName, email, business_name: business },
      { onConflict: "phone", ignoreDuplicates: true },
    );
    if (insErr) throw insErr;
    const { data: contact, error: cErr } = await db.from("lead_contacts").select("id").eq("phone", phone).single();
    if (cErr) throw cErr;
    const submitted = { submittedName: d.fullName, submittedEmail: email, submittedBusiness: business };

    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from("leads").select("id", { count: "exact", head: true })
      .eq("contact_id", contact.id).gte("created_at", since);
    if ((count ?? 0) >= 5) return json({ error: "You've sent several requests in the last hour. Please try again later or message us on WhatsApp." }, 429);

    let row: Record<string, unknown>;
    let leadType: "sender" | "traveller" | "merchant";
    let source = d.source || null;
    const consentAt = d.consent ? new Date().toISOString() : null;
    if (d.type === "sender") {
      leadType = "sender";
      row = { origin: d.origin, destination: d.destination, travel_date: d.sendDate || null, urgency: d.readiness, weight: d.weight,
        priority: leadPriority("sender", d.readiness), details: { ...submitted, parcelType: d.parcelType, wantsQuote: d.wantsQuote } };
    } else if (d.type === "traveller") {
      leadType = "traveller";
      row = { origin: d.origin, destination: d.destination, travel_date: d.departureDate || null, urgency: d.travelling, weight: d.capacity,
        priority: leadPriority("traveller", d.travelling, d.capacity), details: { ...submitted, interested: d.interested } };
    } else if (d.type === "merchant") {
      leadType = "merchant";
      row = { origin: d.location, destination: d.destinations, urgency: d.when, weight: d.volume,
        priority: leadPriority("merchant", d.when), details: { ...submitted, category: d.category, needs: d.needs, contactPerson: d.fullName } };
    } else if (d.type === "chat_sender") {
      leadType = "sender"; source = "website_chat";
      row = { origin: d.origin, destination: d.destination, urgency: d.readiness, weight: d.weight,
        priority: leadPriority("sender", d.readiness), details: { ...submitted, parcelType: d.parcelType, consentTimestamp: consentAt } };
    } else if (d.type === "chat_traveller") {
      leadType = "traveller"; source = "website_chat";
      const cap = d.spareSpace === "Yes" ? d.capacity : d.spareSpace === "No" ? "None" : "Unsure";
      row = { origin: d.origin, destination: d.destination, travel_date: d.departureDate || null, urgency: d.travelling, weight: cap,
        priority: leadPriority("traveller", d.travelling, cap), details: { ...submitted, spareSpace: d.spareSpace, interested: d.interested, consentTimestamp: consentAt } };
    } else {
      leadType = "merchant"; source = "website_chat";
      row = { origin: d.location, destination: d.deliverTo, urgency: d.when, weight: d.volume,
        priority: leadPriority("merchant", d.when), details: { ...submitted, contactPerson: d.fullName, consentTimestamp: consentAt } };
    }

    row.details = { ...(row.details as Record<string, unknown>), eligibility, serviceContactConsent: d.consent, consentTimestamp: consentAt, marketingConsent: false };
    for (let i = 0; i < 3; i++) {
      const reference = makeRef();
      const { data: lead, error } = await db.from("leads").insert({
        ...row, reference, contact_id: contact.id, lead_type: leadType, consent: d.consent,
        source, utm: d.utm ?? {},
      }).select("id").single();
      if (!error && lead) {
        let notification: "sent" | "suppressed" | "pending" = "pending";
        try {
          const result = await sendTemplateEmail("enquiry-notification", ENQUIRY_RECIPIENT, {
            idempotencyKey: `enquiry-notification-${lead.id}`,
            templateData: {
              reference, type: leadType, name: d.fullName, phone, email, business,
              origin: row.origin, destination: row.destination, urgency: row.urgency,
              weight: row.weight, date: row.travel_date, priority: row.priority,
              source, consent: d.consent,
              details: Object.entries(row.details as Record<string, unknown>)
                .filter(([key]) => !key.startsWith("submitted"))
                .map(([key, value]) => `${key}: ${value}`).join("\n"),
            },
          });
          notification = result.sent ? "sent" : "suppressed";
        } catch (error) {
          // A failed email must never lose the saved enquiry or invite duplicate submissions.
          console.error("enquiry notification not sent", {
            leadId: lead.id,
            code: error && typeof error === "object" && "code" in error ? error.code : "email_error",
          });
        }
        const audit = await db.from("lead_events").insert([
          { event: "lead_submitted", label: leadType, utm: {} },
          { event: "contact_consent", label: d.consent ? "service_yes_marketing_no" : "service_no_marketing_no", utm: {} },
          { event: "lead_priority", label: row.priority, utm: {} },
          ...(eligibility.status !== "documents_pilot" ? [{ event: "human_escalation", label: eligibility.status, utm: {} }] : []),
        ]);
        if (audit.error) console.error("lead audit failed", { code: audit.error.code });
        return json({ reference, priority: row.priority, notification, eligibility });
      }
      if (!error || error.code !== "23505") throw error ?? new Error("Lead was not returned after saving");
    }
    throw new Error("Could not create reference");
  } catch (e) {
    console.error("submit-lead failed", e);
    return json({ error: "Something went wrong saving your details. Please try again." }, 500);
  }
});
