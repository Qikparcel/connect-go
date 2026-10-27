CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE FUNCTION public.create_team_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, display_name) VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data->>'full_name', ''), 100)) ON CONFLICT (id) DO NOTHING;
 RETURN NEW;
END;
$$;
CREATE TRIGGER create_team_profile_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_team_profile();
INSERT INTO public.profiles(id, display_name) SELECT id, left(coalesce(raw_user_meta_data->>'full_name', ''), 100) FROM auth.users ON CONFLICT (id) DO NOTHING;

CREATE TABLE public.bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id),
 status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
 created_by uuid NOT NULL,
 decided_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 decided_at timestamptz
);
GRANT SELECT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE FUNCTION public.request_booking(p_lead_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.leads WHERE id = p_lead_id) THEN RAISE EXCEPTION 'Enquiry not found'; END IF;
 INSERT INTO public.bookings(lead_id, created_by) VALUES (p_lead_id, auth.uid()) ON CONFLICT (lead_id) DO NOTHING;
 SELECT id INTO result FROM public.bookings WHERE lead_id = p_lead_id;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.request_booking(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_booking(uuid) TO authenticated;

CREATE FUNCTION public.decide_booking(p_booking_id uuid, p_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE booking_lead uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501'; END IF;
 IF p_status IS NULL OR p_status NOT IN ('Approved', 'Rejected') THEN RAISE EXCEPTION 'Choose Approved or Rejected'; END IF;
 UPDATE public.bookings SET status = p_status, decided_by = auth.uid(), decided_at = now() WHERE id = p_booking_id AND status = 'Pending' RETURNING lead_id INTO booking_lead;
 IF booking_lead IS NULL THEN RAISE EXCEPTION 'Booking is missing or already decided'; END IF;
 IF p_status = 'Approved' THEN UPDATE public.leads SET status = 'Booked', updated_at = now() WHERE id = booking_lead; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.decide_booking(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_booking(uuid, text) TO authenticated;