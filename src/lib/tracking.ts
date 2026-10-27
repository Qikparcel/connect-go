import { supabase } from "@/integrations/supabase/client";

const KEY = "qp_utm";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "src"];

/** Captures campaign tags on first landing and keeps them for the session. */
export function getUtm(): Record<string, string> {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v.slice(0, 200);
    });
    if (document.referrer) utm.referrer = document.referrer.slice(0, 200);
    sessionStorage.setItem(KEY, JSON.stringify(utm));
    return utm;
  } catch {
    return {};
  }
}

type EventName = "page_view" | "cta_click" | "form_start" | "form_submit" | "booking_start" | "booking_complete"
  | "chat_opened" | "role_selected" | "qualification_started" | "lead_submitted" | "hot_lead_created"
  | "booking_clicked" | "traveller_registration_clicked" | "whatsapp_clicked" | "lead_converted_to_booking";

export function track(event: EventName, label?: string) {
  void supabase.from("lead_events").insert({ event, label: label?.slice(0, 100) ?? null, utm: getUtm() }).then(() => {});
}
