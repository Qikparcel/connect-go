-- Owner-managed traffic limits: the admin dashboard can raise or lower each ceiling
-- without a redeploy. Service-role only: no anon/authenticated grants, no policies,
-- so the Data API cannot read or write these rows; the manage-limits function owns writes.
CREATE TABLE public.traffic_limit_settings (
  endpoint text NOT NULL CHECK (endpoint IN ('chat', 'lead', 'email_preview')),
  scope text NOT NULL CHECK (scope IN ('global', 'session', 'account', 'network', 'contact')),
  max_count integer NOT NULL CHECK (max_count BETWEEN 1 AND 100000),
  window_seconds integer NOT NULL CHECK (window_seconds BETWEEN 1 AND 86400),
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (endpoint, scope)
);
GRANT ALL ON public.traffic_limit_settings TO service_role;
ALTER TABLE public.traffic_limit_settings ENABLE ROW LEVEL SECURITY;

-- Daily throttle counts so the owner can see whether a limit is turning people away.
CREATE TABLE public.traffic_limit_blocks (
  endpoint text NOT NULL CHECK (endpoint IN ('chat', 'lead', 'email_preview')),
  scope text NOT NULL CHECK (scope IN ('global', 'session', 'account', 'network', 'contact')),
  day date NOT NULL,
  blocks integer NOT NULL DEFAULT 1,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (endpoint, scope, day)
);
GRANT ALL ON public.traffic_limit_blocks TO service_role;
ALTER TABLE public.traffic_limit_blocks ENABLE ROW LEVEL SECURITY;

-- Incremented by the limiter on every throttled request; keyed by day so a flood
-- cannot grow the table faster than one row per endpoint, scope and day.
CREATE OR REPLACE FUNCTION public.record_traffic_block(p_endpoint text, p_scope text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.traffic_limit_blocks AS b (endpoint, scope, day, blocks)
  VALUES (p_endpoint, p_scope, (now() AT TIME ZONE 'utc')::date, 1)
  ON CONFLICT (endpoint, scope, day)
  DO UPDATE SET blocks = b.blocks + 1, updated_at = now();
$$;
REVOKE ALL ON FUNCTION public.record_traffic_block(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_traffic_block(text, text) TO service_role;

-- Admin approvals and rejections must be auditable from the dashboard, so the
-- browser-writable event whitelist gains the two decision events.
DROP POLICY "Anyone logs valid events" ON public.lead_events;
CREATE POLICY "Anyone logs valid events" ON public.lead_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    event = ANY (ARRAY['page_view', 'cta_click', 'form_start', 'form_submit', 'booking_start', 'booking_complete', 'chat_opened', 'role_selected', 'qualification_started', 'lead_submitted', 'hot_lead_created', 'booking_clicked', 'traveller_registration_clicked', 'whatsapp_clicked', 'lead_converted_to_booking', 'lead_approved', 'lead_rejected'])
    AND (label IS NULL OR char_length(label) <= 100)
    AND jsonb_typeof(utm) = 'object'
    AND pg_column_size(utm) <= 4096
  );