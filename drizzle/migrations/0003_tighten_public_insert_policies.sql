DROP POLICY IF EXISTS "Anyone can submit onboarding" ON public.onboarding_submissions;
REVOKE INSERT ON public.onboarding_submissions FROM anon, authenticated;
COMMENT ON TABLE public.onboarding_submissions IS 'DEPRECATED: replaced by leads via submit-lead function';

DROP POLICY IF EXISTS "Anyone logs events" ON public.lead_events;
CREATE POLICY "Anyone logs valid events" ON public.lead_events
FOR INSERT TO anon, authenticated
WITH CHECK (
  event IN ('page_view','cta_click','form_start','form_submit','booking_start','booking_complete')
  AND (label IS NULL OR char_length(label) <= 100)
  AND jsonb_typeof(utm) = 'object'
  AND pg_column_size(utm) <= 4096
);