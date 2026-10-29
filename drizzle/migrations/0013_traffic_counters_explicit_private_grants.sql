REVOKE ALL ON public.traffic_buckets FROM anon, authenticated;
GRANT ALL ON public.traffic_buckets TO service_role;