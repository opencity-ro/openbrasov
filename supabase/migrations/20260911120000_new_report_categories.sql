-- ---------------------------------------------------------------------------
-- Categorii noi de sesizări
--
-- Parcarea ilegală se desparte în două, după unde stă mașina: pe carosabil, unde
-- încurcă circulația, și pe trotuar, unde îi scoate pe pietoni în stradă. Sunt
-- instituții și argumente diferite, iar la o singură categorie nu se putea spune
-- care dintre ele e problema.
--
-- Valoarea veche se redenumește, nu se copiază: sesizările existente trec singure
-- la carosabil, fără nicio actualizare de rânduri, și nimic nu rămâne în urmă pe o
-- categorie pe care aplicația n-o mai cunoaște.
--
-- Se adaugă și stâlpii anti-parcare, trotinetele lăsate aiurea și spațiile
-- comerciale. Metroul nu, fiindcă Brașovul n-are metrou.
-- ---------------------------------------------------------------------------

alter type public.report_category rename value 'illegal_parking' to 'illegal_parking_road';

alter type public.report_category add value if not exists 'illegal_parking_sidewalk'
  after 'illegal_parking_road';

alter type public.report_category add value if not exists 'bollards'
  after 'illegal_parking_sidewalk';

alter type public.report_category add value if not exists 'illegal_scooter_parking'
  after 'bollards';

alter type public.report_category add value if not exists 'commercial_space'
  after 'illegal_street_vending';
