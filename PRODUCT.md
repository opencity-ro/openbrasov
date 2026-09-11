# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Brașoveanul care vede o problemă în spațiul public — o groapă, un stâlp căzut, gunoi lăsat pe stradă — și vrea s-o raporteze fără să știe cui și cum. Telefonul și desktopul sunt la fel de importante: raportezi de pe stradă, dar urmărești, citești și compari și de la birou.

Instituțiile publice (Primăria, Poliția Locală și celelalte) sunt al doilea public: primesc sesizările și trebuie să poată intra pe platformă, s-o citească și s-o ia în serios.

## Product Purpose

Faci o poză, AI-ul scrie sesizarea oficială cu temei legal și instituția responsabilă, tu o verifici și o trimiți din emailul tău, iar comunitatea urmărește pe hartă dacă s-a rezolvat. Durează două minute.

Succesul înseamnă că orice brașovean poate raporta o problemă fără să cunoască procedura, iar problemele raportate devin vizibile public până se rezolvă.

## Positioning

- Prima platformă de acest fel pentru Brașov și a doua din România; modelul e gândit să se extindă ulterior și în alte orașe.
- Open source (AGPL-3.0) de la primul commit: oricine poate verifica și contribui.
- Independentă și cetățenească: nu e afiliată Primăriei sau vreunei instituții publice.
- Sesizarea oficială e scrisă de AI, cu temei legal și instituția potrivită, și pleacă din emailul omului.
- Gratuită și fără reclame.

## Operating Context

- Raportarea se face de pe stradă, de pe telefon, adesea în grabă; urmărirea și citirea se fac pe orice ecran.
- Sesizarea pleacă din emailul utilizatorului către instituția responsabilă; platforma nu trimite în numele lui.
- Harta e publică: oricine vede sesizările, starea lor și unde sunt, fără cont.

## Capabilities and Constraints

- Harta sesizărilor (MapLibre + OpenFreeMap), cu filtre pe stare și categorie, grupare, card de detalii și adresă dedusă din locul de pe hartă.
- Contul se face fără parolă (link pe email sau Google) și e necesar doar pentru a raporta și a urmări; harta și citirea merg fără cont.
- Totul pe servicii gratuite, dar la calitate profesională.
- Interfață, rute și texte în română; engleza doar în cod.
- Orice ecran trebuie să arate bine pe tema deschisă și pe cea închisă.
- Codul (Next.js, Supabase, Vercel) e public; documentele de planificare rămân locale.

## Brand Commitments

- Numele: **Open Brașov**, domeniu `openbrasov.ro`, organizație `opencity-ro` (umbrelă pentru orașele viitoare).
- Ton: direct, prietenos, în română firească, fără jargon birocratic.
- Nivelul cerut: totul profesionist — interfață matură și stabilă, dar în primul rând ușor de folosit, în UI și în UX.
- Decizie deschisă: identitatea vizuală proprie (logo, paletă, tipografie) urmează să fie construită după ce se termină harta. Până atunci nu se tratează cea actuală ca definitivă.
- Produsele pe care le studiem ca reper nu se numesc niciodată în repo, cod, commituri sau PR-uri.

## Evidence on Hand

- Sesizările de pe hartă sunt, deocamdată, date de probă (`supabase/seed.sql`), nu sesizări reale.
- Nu există încă utilizatori, testimoniale, parteneriate cu instituții sau apariții în presă; nu se inventează.

## Product Principles

1. Ușor de folosit înainte de orice: dacă un brașovean trebuie să se gândească, am greșit.
2. Adevărat înainte de impresionant: o adresă, o stare sau o cifră afișată trebuie să fie reală, niciodată ghicită și prezentată ca fapt.
3. Deschis oricui: harta și sesizările se văd fără cont, iar raportarea cere cât mai puțin.
4. Matur și stabil: suficient de serios încât o instituție să-l ia în considerare.
5. Gândit să crească: ce se construiește pentru Brașov trebuie să poată merge și în alt oraș.

## Accessibility & Inclusion

- Temă deschisă și închisă, amândouă tratate la fel de atent.
- Română peste tot.
- Acces fără cont la hartă și la citirea sesizărilor.
