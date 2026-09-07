-- ---------------------------------------------------------------------------
-- Sesizări de probă, pentru dezvoltare locală.
--
-- Rulează singur la `supabase db reset`. Nu ajunge niciodată în producție:
-- acolo harta se umple din sesizări reale.
--
-- Coordonatele sunt puncte adevărate din Brașov, împrăștiate prin cartiere, ca
-- gruparea la depărtare și desprinderea la apropiere să aibă ce arăta. Punctul are
-- nevoie de sistemul de coordonate pus explicit: fără el, conversia la geography eșuează.
-- ---------------------------------------------------------------------------

insert into public.reports (
  category, status, description, address, location, institution, created_at, resolved_at
)
values
  ('pothole', 'open',
   'Groapă adâncă pe banda dinspre centru, chiar înainte de trecerea de pietoni.',
   'Bulevardul Griviței 42', st_setsrid(st_point(25.6035, 45.6598), 4326)::geography,
   'Primăria Brașov', now() - interval '3 days', null),

  ('pothole', 'in_progress',
   'Carosabil surpat lângă gura de canal. Au fost puse conuri, dar nimic mai mult.',
   'Strada Lungă 128', st_setsrid(st_point(25.5678, 45.6461), 4326)::geography,
   'Primăria Brașov', now() - interval '11 days', null),

  ('street_lighting', 'open',
   'Trei stâlpi stinși pe toată porțiunea dintre bloc și stație. Seara nu se vede nimic.',
   'Strada Zizinului 74', st_setsrid(st_point(25.6217, 45.6402), 4326)::geography,
   'Primăria Brașov', now() - interval '5 days', null),

  ('street_lighting', 'resolved',
   'Becul din capătul aleii era ars de câteva săptămâni.',
   'Aleea Mercur 3', st_setsrid(st_point(25.6108, 45.6521), 4326)::geography,
   'Primăria Brașov', now() - interval '28 days', now() - interval '9 days'),

  ('illegal_parking', 'open',
   'Mașini parcate pe trotuar zi de zi, nu mai poți trece cu căruciorul.',
   'Strada Mihail Kogălniceanu 15', st_setsrid(st_point(25.5924, 45.6438), 4326)::geography,
   'Poliția Locală Brașov', now() - interval '2 days', null),

  ('illegal_parking', 'escalated',
   'Trotuar blocat complet în fața școlii. Sesizat de două luni, fără răspuns.',
   'Strada Cerbului 8', st_setsrid(st_point(25.5871, 45.6389), 4326)::geography,
   'Poliția Locală Brașov', now() - interval '64 days', null),

  ('abandoned_vehicle', 'open',
   'Mașină fără roți și fără numere, stă în parcare de peste un an.',
   'Strada Carpaților 60', st_setsrid(st_point(25.5963, 45.6301), 4326)::geography,
   'Poliția Locală Brașov', now() - interval '17 days', null),

  ('illegal_dumping', 'open',
   'Saci de moloz aruncați lângă platforma de gunoi, se adună de la o zi la alta.',
   'Strada Molidului 12', st_setsrid(st_point(25.6152, 45.6289), 4326)::geography,
   'Primăria Brașov', now() - interval '4 days', null),

  ('waste_collection', 'in_progress',
   'Pubelele nu au fost golite de peste o săptămână.',
   'Strada Saturn 30', st_setsrid(st_point(25.6291, 45.6355), 4326)::geography,
   'Primăria Brașov', now() - interval '8 days', null),

  ('waste_collection', 'resolved',
   'Platforma era plină și mirosea în tot cartierul.',
   'Bulevardul Saturn 22', st_setsrid(st_point(25.6248, 45.6318), 4326)::geography,
   'Primăria Brașov', now() - interval '35 days', now() - interval '21 days'),

  ('traffic_light', 'in_progress',
   'Semaforul pentru pietoni clipește portocaliu de câteva zile.',
   'Bulevardul Victoriei intersecție cu Griviței', st_setsrid(st_point(25.6079, 45.6562), 4326)::geography,
   'Primăria Brașov', now() - interval '6 days', null),

  ('crosswalk_marking', 'open',
   'Marcajul trecerii de pietoni de lângă grădiniță s-a șters aproape complet.',
   'Strada Toamnei 4', st_setsrid(st_point(25.6183, 45.6478), 4326)::geography,
   'Primăria Brașov', now() - interval '13 days', null),

  ('road_marking', 'open',
   'Nu se mai văd benzile pe sensul giratoriu, mai ales pe ploaie.',
   'Calea București la Gemenii', st_setsrid(st_point(25.6334, 45.6428), 4326)::geography,
   'Primăria Brașov', now() - interval '9 days', null),

  ('sidewalk', 'open',
   'Dale sparte pe vreo zece metri, se împiedică lumea.',
   'Strada Iuliu Maniu 55', st_setsrid(st_point(25.5896, 45.6472), 4326)::geography,
   'Primăria Brașov', now() - interval '7 days', null),

  ('sidewalk', 'resolved',
   'Trotuarul era surpat lângă intrarea în bloc.',
   'Strada Alexandru Vlahuță 18', st_setsrid(st_point(25.6224, 45.6531), 4326)::geography,
   'Primăria Brașov', now() - interval '41 days', now() - interval '12 days'),

  ('green_space', 'open',
   'Spațiul verde dintre blocuri e plin de buruieni înalte cât gardul.',
   'Strada Bârsei 9', st_setsrid(st_point(25.5812, 45.6612), 4326)::geography,
   'Primăria Brașov', now() - interval '15 days', null),

  ('park', 'in_progress',
   'Leagănul din parc are lanțul rupt, iar bara e ruginită.',
   'Parcul Tractorul', st_setsrid(st_point(25.6041, 45.6689), 4326)::geography,
   'Primăria Brașov', now() - interval '10 days', null),

  ('water_or_heating', 'escalated',
   'Apă care curge continuu din conductă, pe stradă, de aproape trei luni.',
   'Strada Nicolae Titulescu 27', st_setsrid(st_point(25.6117, 45.6449), 4326)::geography,
   'Compania Apa Brașov', now() - interval '82 days', null),

  ('stray_animal', 'open',
   'Haită de câini fără stăpân în jurul terenului de sport, seara.',
   'Strada Stadionului 2', st_setsrid(st_point(25.5989, 45.6353), 4326)::geography,
   'Primăria Brașov', now() - interval '1 day', null),

  ('wildlife', 'in_progress',
   'Urs văzut lângă tomberoane, a treia oară în două săptămâni.',
   'Strada Poienelor 40', st_setsrid(st_point(25.5743, 45.6285), 4326)::geography,
   'Primăria Brașov', now() - interval '3 days', null),

  ('vandalism', 'open',
   'Stația de autobuz e acoperită de graffiti și are geamul spart.',
   'Bulevardul Gării 12', st_setsrid(st_point(25.6062, 45.6603), 4326)::geography,
   'Primăria Brașov', now() - interval '19 days', null),

  ('public_transport', 'resolved',
   'Afișajul cu orarul din stație nu mai funcționa.',
   'Stația Livada Poștei', st_setsrid(st_point(25.5934, 45.6489), 4326)::geography,
   'RATBV', now() - interval '52 days', now() - interval '30 days'),

  ('signage', 'open',
   'Indicatorul de sens unic e îndoit și nu se mai vede din mașină.',
   'Strada Castelului 33', st_setsrid(st_point(25.5851, 45.6421), 4326)::geography,
   'Primăria Brașov', now() - interval '22 days', null),

  ('accessibility', 'escalated',
   'Rampa de acces în clădire e mult prea abruptă pentru scaun cu rotile.',
   'Strada Republicii 5', st_setsrid(st_point(25.5908, 45.6412), 4326)::geography,
   'Primăria Brașov', now() - interval '95 days', null),

  ('heritage', 'open',
   'Tencuiala cade de pe fațada clădirii vechi, direct pe trotuar.',
   'Strada Michael Weiss 20', st_setsrid(st_point(25.5879, 45.6446), 4326)::geography,
   'Direcția Județeană pentru Cultură Brașov', now() - interval '26 days', null),

  ('noise', 'open',
   'Muzică foarte tare din terasă până după miezul nopții, în fiecare weekend.',
   'Piața Sfatului 14', st_setsrid(st_point(25.5887, 45.6427), 4326)::geography,
   'Poliția Locală Brașov', now() - interval '5 days', null),

  ('illegal_construction', 'in_progress',
   'Se construiește o anexă lipită de bloc, fără niciun panou de autorizație.',
   'Strada Aurel Vlaicu 62', st_setsrid(st_point(25.6156, 45.6572), 4326)::geography,
   'Primăria Brașov', now() - interval '31 days', null),

  ('rodents', 'open',
   'Șobolani în jurul platformei de gunoi, se văd și ziua.',
   'Strada Berzei 7', st_setsrid(st_point(25.6203, 45.6338), 4326)::geography,
   'Primăria Brașov', now() - interval '12 days', null),

  ('air_quality', 'open',
   'Miros puternic de ars dinspre zona industrială, seara și noaptea.',
   'Strada Timișul Sec 3', st_setsrid(st_point(25.6402, 45.6521), 4326)::geography,
   'Agenția pentru Protecția Mediului Brașov', now() - interval '14 days', null),

  ('speed_bump_request', 'open',
   'Se circulă foarte repede pe lângă școală, ar trebui un limitator.',
   'Strada Panselelor 11', st_setsrid(st_point(25.6271, 45.6462), 4326)::geography,
   'Primăria Brașov', now() - interval '20 days', null);
