DROP POLICY IF EXISTS "Anyone logs valid events" ON public.lead_events;
CREATE POLICY "Anyone logs valid events" ON public.lead_events FOR INSERT TO anon, authenticated
WITH CHECK (
  event = ANY (ARRAY['page_view','cta_click','form_start','form_submit','booking_start','booking_complete',
    'chat_opened','role_selected','qualification_started','lead_submitted','hot_lead_created',
    'booking_clicked','traveller_registration_clicked','whatsapp_clicked','lead_converted_to_booking'])
  AND (label IS NULL OR char_length(label) <= 100)
  AND jsonb_typeof(utm) = 'object'
  AND pg_column_size(utm) <= 4096
);