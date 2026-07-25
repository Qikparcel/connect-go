-- QikParcel master onboarding funnel.
-- One row per submission, one flat column per answer so the table can be
-- sorted, filtered and exported to CSV straight from the Supabase dashboard.

create table if not exists public.onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Attribution: which marketing channel produced this lead
  heard_about text not null,
  heard_about_other text,
  source text, -- ?src= query param, e.g. 'zimfest' — survives a wrong tickbox

  roles text[] not null check (array_length(roles, 1) >= 1),

  -- Traveller branch
  traveller_route_from text,
  traveller_route_to text,
  traveller_frequency text,
  traveller_next_trip text,

  -- Sender branch
  sender_items text,
  sender_frequency text,
  sender_route_from text,
  sender_route_to text,

  -- Business branch
  business_name text,
  business_sells text[],
  business_sells_other text,
  business_send_frequency text,
  business_ships_to text,
  business_challenges text[],

  -- Courier branch
  courier_vehicle text,
  courier_areas text,
  courier_availability text,
  courier_capacity text,

  -- Contact
  full_name text not null,
  phone text not null,
  email text,
  city text,
  country text,

  consent_marketing boolean not null default false
);

alter table public.onboarding_submissions enable row level security;

-- Anyone scanning the QR code can submit the form. Nobody can read it back:
-- the anon key ships in the browser bundle, so without this split the whole
-- lead list would be public.
drop policy if exists "Anyone can submit onboarding" on public.onboarding_submissions;
create policy "Anyone can submit onboarding"
  on public.onboarding_submissions
  for insert
  to anon, authenticated
  with check (true);

create index if not exists onboarding_submissions_created_at_idx
  on public.onboarding_submissions (created_at desc);

create index if not exists onboarding_submissions_heard_about_idx
  on public.onboarding_submissions (heard_about);

create index if not exists onboarding_submissions_source_idx
  on public.onboarding_submissions (source);

create index if not exists onboarding_submissions_roles_idx
  on public.onboarding_submissions using gin (roles);
