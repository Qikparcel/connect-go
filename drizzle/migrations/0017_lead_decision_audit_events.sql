ALTER TABLE public.lead_events DROP CONSTRAINT IF EXISTS lead_events_event_check;

ALTER TABLE public.lead_events
  ADD CONSTRAINT lead_events_event_check
  CHECK (event = ANY (ARRAY[
    'page_view'::text,
    'cta_click'::text,
    'form_start'::text,
    'form_submit'::text,
    'booking_start'::text,
    'booking_complete'::text,
    'chat_opened'::text,
    'role_selected'::text,
    'qualification_started'::text,
    'lead_submitted'::text,
    'hot_lead_created'::text,
    'booking_clicked'::text,
    'traveller_registration_clicked'::text,
    'whatsapp_clicked'::text,
    'lead_converted_to_booking'::text,
    'contact_consent'::text,
    'lead_priority'::text,
    'booking_handoff'::text,
    'human_escalation'::text,
    'lead_approved'::text,
    'lead_rejected'::text
  ]));