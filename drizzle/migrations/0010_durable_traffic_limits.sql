CREATE TABLE public.traffic_buckets (key text PRIMARY KEY, hits integer NOT NULL DEFAULT 0, expires_at timestamptz NOT NULL);
GRANT ALL ON public.traffic_buckets TO service_role;
ALTER TABLE public.traffic_buckets ENABLE ROW LEVEL SECURITY;
CREATE INDEX traffic_buckets_expiry_idx ON public.traffic_buckets(expires_at);
CREATE OR REPLACE FUNCTION public.consume_traffic_limits(p_buckets jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b jsonb; n integer; expires timestamptz; retry integer := 0; current_time timestamptz := clock_timestamp();
BEGIN
 IF jsonb_typeof(p_buckets) IS DISTINCT FROM 'array' OR jsonb_array_length(p_buckets) NOT BETWEEN 1 AND 8 THEN RAISE EXCEPTION 'Invalid traffic buckets'; END IF;
 FOR b IN SELECT value FROM jsonb_array_elements(p_buckets) ORDER BY value->>'key' LOOP
  IF (b->>'key') !~ '^[a-f0-9]{64}$' OR (b->>'limit')::integer NOT BETWEEN 1 AND 100000 OR (b->>'window')::integer NOT BETWEEN 1 AND 100000 THEN RAISE EXCEPTION 'Invalid traffic rule'; END IF;
  INSERT INTO public.traffic_buckets(key,hits,expires_at) VALUES (b->>'key',0,current_time + make_interval(secs => (b->>'window')::integer)) ON CONFLICT (key) DO NOTHING;
  SELECT hits,expires_at INTO n,expires FROM public.traffic_buckets WHERE key=b->>'key' FOR UPDATE;
  IF expires <= current_time THEN
   UPDATE public.traffic_buckets SET hits=0,expires_at=current_time + make_interval(secs => (b->>'window')::integer) WHERE key=b->>'key';
   n:=0; expires:=current_time + make_interval(secs => (b->>'window')::integer);
  END IF;
  IF n >= (b->>'limit')::integer THEN retry:=greatest(retry,ceil(extract(epoch FROM expires-current_time))::integer); END IF;
 END LOOP;
 IF retry > 0 THEN RETURN jsonb_build_object('allowed',false,'retry_after',retry); END IF;
 FOR b IN SELECT value FROM jsonb_array_elements(p_buckets) LOOP
  UPDATE public.traffic_buckets SET hits=hits+1 WHERE key=b->>'key';
 END LOOP;
 DELETE FROM public.traffic_buckets WHERE key IN (SELECT key FROM public.traffic_buckets WHERE expires_at < current_time - interval '1 day' LIMIT 100);
 RETURN jsonb_build_object('allowed',true,'retry_after',0);
END $$;
REVOKE ALL ON FUNCTION public.consume_traffic_limits(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_traffic_limits(jsonb) TO service_role;
COMMENT ON TABLE public.traffic_buckets IS 'Server-only hashed traffic counters. Expired counters cleaned in bounded batches; no raw phone, account or IP identifiers.';