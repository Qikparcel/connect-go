grant insert on public.onboarding_submissions to anon, authenticated;
grant all on public.onboarding_submissions to service_role;
grant select on public.onboarding_submissions to authenticated;
create policy "Admins read onboarding" on public.onboarding_submissions for select to authenticated using (public.has_role(auth.uid(), 'admin'));