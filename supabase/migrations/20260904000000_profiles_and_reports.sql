-- Faza 1: profiluri de utilizator și sesizări.
--
-- Modelul urmărește fluxul aplicației: o sesizare este o problemă din spațiul
-- public, cu o categorie, o poziție pe hartă și un status care avansează în timp.
-- Autorul poate lipsi — o sesizare trimisă fără cont rămâne anonimă.

-- ---------------------------------------------------------------------------
-- Tipuri
-- ---------------------------------------------------------------------------

create type public.report_category as enum (
  'pothole',                -- groapă în carosabil
  'sidewalk',               -- alei și trotuare
  'street_lighting',        -- iluminat public defect
  'water_or_heating',       -- avarie apă / termoficare
  'green_space',            -- spații verzi
  'park',                   -- parcuri și locuri de joacă
  'illegal_parking',        -- parcare ilegală
  'abandoned_vehicle',      -- mașină abandonată
  'crosswalk_marking',      -- marcaj trecere de pietoni
  'road_marking',           -- marcaj rutier lipsă sau șters
  'traffic_light',          -- semafor defect sau lipsă
  'speed_bump_request',     -- cerere limitator de viteză
  'illegal_dumping',        -- deșeuri abandonate
  'waste_collection',       -- salubritate și colectare
  'unsanitary_land',        -- teren insalubru
  'vandalism',              -- vandalism, graffiti
  'illegal_street_vending', -- comerț stradal neautorizat
  'public_space_occupation',-- ocupare abuzivă a domeniului public
  'illegal_construction',   -- construcție fără autorizație
  'air_quality',            -- mediu, calitatea aerului
  'stray_animal',           -- animal fără stăpân
  'wildlife',               -- animal sălbatic în oraș (urs, mistreț)
  'rodents',                -- deratizare
  'insects',                -- dezinsecție
  'public_transport',       -- transport public
  'signage',                -- indicatoare și semnalizare
  'noise',                  -- poluare fonică
  'accessibility',          -- accesibilitate pentru persoane cu dizabilități
  'heritage',               -- clădiri istorice degradate
  'other'                   -- altceva
);

create type public.report_status as enum (
  'open',        -- trimisă, fără răspuns
  'in_progress', -- instituția a confirmat că lucrează la ea
  'resolved',    -- rezolvată
  'escalated'    -- escaladată după termenul legal
);

-- ---------------------------------------------------------------------------
-- Profiluri
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint display_name_length check (
    display_name is null or char_length(display_name) between 2 and 60
  )
);

comment on table public.profiles is
  'Datele publice ale unui utilizator. Emailul rămâne exclusiv în auth.users.';

-- ---------------------------------------------------------------------------
-- Sesizări
-- ---------------------------------------------------------------------------

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  -- Null înseamnă sesizare trimisă fără cont; rămâne null și dacă profilul
  -- este șters ulterior, ca sesizarea publică să nu dispară din istoric.
  author_id uuid references public.profiles (id) on delete set null,
  category public.report_category not null,
  status public.report_status not null default 'open',
  description text not null,
  address text not null,
  location geography (point, 4326) not null,
  -- Instituția către care a fost adresată sesizarea, ca text, pentru că lista
  -- se schimbă în timp și nu vrem sesizările vechi rescrise retroactiv.
  institution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint description_length check (char_length(description) between 10 and 4000),
  constraint address_length check (char_length(address) between 3 and 300),
  constraint resolved_at_matches_status check (
    (status = 'resolved') = (resolved_at is not null)
  )
);

comment on table public.reports is
  'O problemă raportată din spațiul public. Coordonatele folosesc SRID 4326.';

create index reports_location_idx on public.reports using gist (location);
create index reports_status_idx on public.reports (status);
create index reports_category_idx on public.reports (category);
create index reports_created_at_idx on public.reports (created_at desc);
create index reports_author_idx on public.reports (author_id);

-- ---------------------------------------------------------------------------
-- Actualizarea automată a coloanei updated_at
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Profil creat automat la înregistrare
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.reports enable row level security;

-- Profilul este vizibil doar propriului utilizator. Pe hartă, numele apare
-- prescurtat prin vederea publică de mai jos, nu prin acces direct la tabel.
create policy "profiles are readable by their owner"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "profiles are editable by their owner"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sesizările sunt publice: oricine le poate citi, inclusiv vizitatorii nelogați.
create policy "reports are readable by everyone"
  on public.reports for select
  to anon, authenticated
  using (true);

create policy "authenticated users create their own reports"
  on public.reports for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "authors edit their own reports"
  on public.reports for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

-- ---------------------------------------------------------------------------
-- Vederea publică pentru hartă
-- ---------------------------------------------------------------------------

-- Scurtează un nume la primele două caractere, restul mascat: „Maria" -> „ma***".
create function public.mask_display_name(name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when name is null or char_length(name) = 0 then null
    when char_length(name) <= 2 then left(name, 1) || '***'
    else lower(left(name, 2)) || repeat('*', least(char_length(name) - 2, 5))
  end;
$$;

-- Harta citește exclusiv de aici, ca numele întreg să nu părăsească serverul.
--
-- Vederea rulează cu drepturile proprietarului (security_invoker = false),
-- fiindcă altfel join-ul cu profiles ar fi filtrat de politica RLS care lasă
-- fiecare utilizator să-și vadă doar propriul profil, iar autorul ar apărea gol
-- pentru toți ceilalți. Ocolirea este intenționată și sigură: vederea expune
-- doar câmpuri publice, iar numele iese exclusiv mascat.
create view public.public_reports
with (security_invoker = false)
as
  select
    r.id,
    r.category,
    r.status,
    r.description,
    r.address,
    st_y (r.location::geometry) as latitude,
    st_x (r.location::geometry) as longitude,
    r.institution,
    r.created_at,
    r.resolved_at,
    public.mask_display_name (p.display_name) as author_label
  from public.reports r
  left join public.profiles p on p.id = r.author_id;

comment on view public.public_reports is
  'Sesizările așa cum apar pe harta publică: coordonate simple și autor mascat.';

grant select on public.public_reports to anon, authenticated;
