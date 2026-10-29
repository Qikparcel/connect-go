import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { limitTraffic } from "../_shared/traffic-limit.ts";
import { normalizePhone } from "../_shared/priority.ts";
const nullableText = z.string().trim().max(1000).nullable();
const nullableList = z.array(z.string().max(100)).max(20).nullable();
const Body = z.object({
  heard_about: z.enum(["Zimfest", "Airport", "WhatsApp", "Facebook", "Instagram", "Referral", "Other"]),
  heard_about_other: nullableText, source: z.string().max(100).nullable(),
  roles: z.array(z.enum(["Traveller", "Sender", "Business", "Courier"])).min(1).max(4),
  traveller_route_from: nullableText, traveller_route_to: nullableText, traveller_frequency: nullableText, traveller_next_trip: nullableText,
  sender_items: nullableText, sender_frequency: nullableText, sender_route_from: nullableText, sender_route_to: nullableText,
  business_name: nullableText, business_sells: nullableList, business_sells_other: nullableText,
  business_send_frequency: nullableText, business_ships_to: nullableText, business_challenges: nullableList,
  courier_vehicle: nullableText, courier_areas: nullableText, courier_availability: nullableText, courier_capacity: nullableText,
  full_name: z.string().trim().min(2).max(120), phone: z.string().max(30), email: z.string().email().max(255).nullable(),
  city: nullableText, country: nullableText, consent_marketing: z.boolean(), website: z.string().max(0).optional(),
}).strict();
const json = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  const limited = await limitTraffic(req, "lead", corsHeaders);
  if (limited) return limited;
  try {
    const raw = await req.text();
    if (raw.length > 20000) return json(413, { error: "Please shorten your submission." });
    const parsed = Body.safeParse(JSON.parse(raw));
    if (!parsed.success) return json(400, { error: "Please check your registration details and try again." });
    const phone = normalizePhone(parsed.data.phone);
    if (!phone) return json(400, { error: "Please enter a valid phone number with country code." });
    const contactLimited = await limitTraffic(req, "lead", corsHeaders, { contact: phone, contactOnly: true });
    if (contactLimited) return contactLimited;
    const { website: _website, ...row } = parsed.data;
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await db.from("onboarding_submissions").insert({ ...row, phone }).select("id").single();
    if (error || !data) return json(500, { error: "We couldn't save your registration. Please retry or contact QikParcel on WhatsApp." });
    return json(200, { saved: true });
  } catch {
    return json(400, { error: "Please check your registration details and try again." });
  }
});