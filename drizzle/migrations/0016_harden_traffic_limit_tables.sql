-- The platform grants the public Data API roles table access by default. These two
-- tables are protected by RLS with no policies, but the grants are removed as well so
-- the browser and any anonymous client cannot reach them even if a policy is added later.
REVOKE ALL ON public.traffic_limit_settings FROM anon, authenticated;
REVOKE ALL ON public.traffic_limit_blocks FROM anon, authenticated;
COMMENT ON TABLE public.traffic_limit_settings IS 'Owner-saved traffic ceilings. Read and written only by the manage-limits function and the limiter; not reachable from the browser.';
COMMENT ON TABLE public.traffic_limit_blocks IS 'Daily throttle counts per endpoint and scope. Service-role writes only.';