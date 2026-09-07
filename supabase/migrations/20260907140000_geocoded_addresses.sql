-- ---------------------------------------------------------------------------
-- Adresele deja aflate, ținute minte
--
-- Serviciul care traduce coordonate în adrese cere explicit ca răspunsurile să
-- fie păstrate la noi și consideră defect pe cine repetă aceeași întrebare. Un
-- punct de pe hartă nu-și schimbă adresa, deci întrebarea se pune o singură dată
-- în viața acelui punct, iar restul vizitatorilor citesc de aici.
--
-- Cheia e coordonata rotunjită la cinci zecimale, adică vreo șapte metri pe
-- latitudine — sub lățimea unei străzi, deci două sesizări din capete opuse ale
-- aceleiași case cad pe aceeași cheie, ceea ce e tocmai bine.
-- ---------------------------------------------------------------------------

create table public.geocoded_addresses (
  cell text primary key,
  label text not null,
  kind text not null,
  -- Răspunsul întreg al serviciului. Dacă ne răzgândim mâine asupra felului în
  -- care scriem adresa, o rescriem de aici, fără să mai întrebăm o dată.
  raw jsonb,
  created_at timestamptz not null default now(),
  constraint geocoded_kind check (kind in ('street', 'landmark', 'code')),
  constraint geocoded_label_length check (char_length(label) between 1 and 300)
);

comment on table public.geocoded_addresses is
  'Adrese deduse din coordonate, ținute minte ca serviciul extern să fie întrebat o singură dată pentru fiecare punct.';

-- Nimeni din afară nu atinge tabelul: nici citire, nici scriere. Îl folosește
-- doar ruta noastră, cu cheia de serviciu.
--
-- O politică de scriere deschisă ar fi însemnat că oricine poate pune ce adresă
-- vrea pe orice punct de pe hartă, iar minciuna s-ar fi arătat tuturor.
alter table public.geocoded_addresses enable row level security;

-- Regulile de rând sunt de ajuns cât timp nu există nicio politică, dar dreptul
-- pe tabel rămâne acordat din start rolurilor publice. Îl retragem, ca o
-- politică adăugată din greșeală mâine să nu deschidă tabelul dintr-o dată.
revoke all on table public.geocoded_addresses from anon, authenticated;
