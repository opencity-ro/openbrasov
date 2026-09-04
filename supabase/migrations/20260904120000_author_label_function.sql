-- Vederea publică nu mai ocolește Row Level Security.
--
-- Prima variantă folosea `security_invoker = false`, ca join-ul cu profiles să
-- nu fie filtrat de politica RLS. Efectul secundar: întreaga vedere rula cu
-- drepturile proprietarului, inclusiv citirea din reports — exact tiparul pe care
-- linterul Supabase îl semnalează ca „Security Definer View".
--
-- Soluția: vederea revine la drepturile apelantului, iar singura bucată care
-- chiar are nevoie de acces privilegiat — citirea numelui pentru a-l masca —
-- se mută într-o funcție care nu poate returna decât textul deja mascat.

drop view if exists public.public_reports;

create function public.report_author_label(author uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  -- Returnează exclusiv forma mascată. Numele întreg nu iese din funcție,
  -- indiferent cine o apelează.
  select public.mask_display_name(p.display_name)
  from public.profiles p
  where p.id = author;
$$;

comment on function public.report_author_label (uuid) is
  'Numele autorului, mascat. Singurul mod în care un vizitator află cine a trimis o sesizare.';

revoke all on function public.report_author_label (uuid) from public;
grant execute on function public.report_author_label (uuid) to anon, authenticated;

create view public.public_reports
with (security_invoker = true)
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
    public.report_author_label (r.author_id) as author_label
  from public.reports r;

comment on view public.public_reports is
  'Sesizările așa cum apar pe harta publică: coordonate simple și autor mascat.';

grant select on public.public_reports to anon, authenticated;
