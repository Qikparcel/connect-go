REVOKE INSERT ON public.onboarding_submissions FROM anon, authenticated;
GRANT INSERT ON public.onboarding_submissions TO service_role;
COMMENT ON TABLE public.onboarding_submissions IS 'Public registration writes pass through submit-onboarding for server validation and shared atomic traffic limits. No direct visitor INSERT grant.';