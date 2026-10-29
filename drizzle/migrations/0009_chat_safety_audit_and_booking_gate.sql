ALTER TABLE public.lead_events DROP CONSTRAINT lead_events_event_check;
ALTER TABLE public.lead_events ADD CONSTRAINT lead_events_event_check CHECK (event = ANY (ARRAY['page_view','cta_click','form_start','form_submit','booking_start','booking_complete','chat_opened','role_selected','qualification_started','lead_submitted','hot_lead_created','booking_clicked','traveller_registration_clicked','whatsapp_clicked','lead_converted_to_booking','contact_consent','lead_priority','booking_handoff','human_escalation']::text[]));
DROP POLICY "Anyone logs valid events" ON public.lead_events;
CREATE POLICY "Anyone logs valid events" ON public.lead_events FOR INSERT TO anon, authenticated WITH CHECK (event = ANY (ARRAY['page_view','cta_click','form_start','form_submit','booking_start','booking_complete','chat_opened','role_selected','qualification_started','lead_submitted','hot_lead_created','booking_clicked','traveller_registration_clicked','whatsapp_clicked','lead_converted_to_booking']::text[]) AND (label IS NULL OR char_length(label) <= 100) AND jsonb_typeof(utm) = 'object' AND pg_column_size(utm) <= 4096);
CREATE OR REPLACE FUNCTION public.enforce_website_booking_safety() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF TG_TABLE_NAME = 'bookings' AND (TG_OP = 'INSERT' OR NEW.status = 'Approved') THEN
  RAISE EXCEPTION 'Booking unavailable: secure identity verification and operational eligibility confirmation are not connected. Contact the QikParcel team.' USING ERRCODE = '42501';
 END IF;
 IF TG_TABLE_NAME = 'leads' AND NEW.status = 'Booked' AND OLD.status IS DISTINCT FROM 'Booked' THEN
  RAISE EXCEPTION 'Cannot confirm a booking without the approved secure verification and booking workflow.' USING ERRCODE = '42501';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER enforce_website_booking_safety BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.enforce_website_booking_safety();
CREATE TRIGGER enforce_lead_booking_safety BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.enforce_website_booking_safety();
REVOKE ALL ON FUNCTION public.enforce_website_booking_safety() FROM PUBLIC;
COMMENT ON FUNCTION public.enforce_website_booking_safety() IS 'Fail closed: website enquiry booking creation/approval and Booked transitions remain unavailable until an approved server-verified identity and operational eligibility workflow is connected. Enquiries and rejections remain available.';