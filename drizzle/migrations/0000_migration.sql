create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Auto-grant admin to the QikParcel team inbox once its email is confirmed
create or replace function public.grant_admin_for_team()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if lower(new.email) in ('info@qikparcel.com') and new.email_confirmed_at is not null then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_admin after insert or update of email_confirmed_at on auth.users
  for each row execute function public.grant_admin_for_team();

create table public.lead_contacts (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  full_name text not null,
  email text,
  business_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.lead_contacts to authenticated;
grant all on public.lead_contacts to service_role;
alter table public.lead_contacts enable row level security;
create policy "Admins read contacts" on public.lead_contacts for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update contacts" on public.lead_contacts for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  contact_id uuid not null references public.lead_contacts(id) on delete cascade,
  lead_type text not null check (lead_type in ('sender','traveller','merchant')),
  origin text,
  destination text,
  travel_date date,
  urgency text,
  weight text,
  details jsonb not null default '{}'::jsonb,
  consent boolean not null default false,
  priority text not null check (priority in ('HOT','WARM','FUTURE')),
  status text not null default 'New' check (status in ('New','Contacted','Qualified','Matched','Booked','Lost')),
  owner text,
  source text,
  utm jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_contact_created on public.leads(contact_id, created_at desc);
grant select, update on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "Admins read leads" on public.leads for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update leads" on public.leads for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  event text not null check (event in ('page_view','cta_click','form_start','form_submit','booking_start','booking_complete')),
  label text check (char_length(label) <= 100),
  utm jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant insert on public.lead_events to anon, authenticated;
grant select on public.lead_events to authenticated;
grant all on public.lead_events to service_role;
alter table public.lead_events enable row level security;
create policy "Anyone logs events" on public.lead_events for insert to anon, authenticated with check (true);
create policy "Admins read events" on public.lead_events for select to authenticated using (public.has_role(auth.uid(), 'admin'));