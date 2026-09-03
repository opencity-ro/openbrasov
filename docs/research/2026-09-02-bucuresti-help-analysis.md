# Analiză bucuresti.help (referință pentru aplicația Brașov)

Data: 2026-09-02. Surse: site-ul bucuresti.help (home, /map, /despre, /puncte-civice, /privacy, /terms, /blog, /in-presa, /sesizare/groapa-asfalt), Play Store, interviuri ZF IT Generation (24.06.2026), Libertatea (21.07.2026), Revista Biz (08.07.2026).

## Ce este

Platformă civică independentă, gratuită, fără reclame. Fondator: Marius Funie (marketing/data la eMAG), construită integral cu Claude Code. Lansată mai 2026. ~1.900 sesizări, ~1.500+ utilizatori, ~50 sesizări/zi, cost operare ~120 EUR/lună (AI + hosting), finanțată din donații.

Slogan: **„Tu fotografiezi. AI-ul scrie. Autoritățile primesc.”**

## Flux principal (report)

1. `/report/guest-name` — ecran „Bun venit!”: consimțământ (nume, locație, foto), checkbox Termeni + Confidențialitate. Fără cont = guest.
2. `/report/photo` — upload/cameră. AI (Claude Sonnet, fallback Gemini / Grok Vision) detectează **categoria** din poză.
3. Localizare: GPS automat sau pin manual pe hartă → adresă (reverse geocoding). Determină **instituția responsabilă** (ex. stradă de sector → Primăria de Sector; bulevard → PMB/Administrația Străzilor). ~82 instituții mapate.
4. Notă opțională utilizator.
5. AI generează **textul oficial** al sesizării: formal, cu temei legal (OG 27/2002, Legea 233/2002, Legea 544/2001), cu instituția destinatară. Utilizatorul verifică/editează.
6. Adresa de domiciliu a petiționarului (obligatorie legal; la guest nu se stochează pe server, la cont se poate salva în profil). Se inserează local, NU se trimite la AI.
7. **Trimitere: platforma NU trimite emailul.** Deschide `mailto:` cu tot conținutul în clientul de email al utilizatorului; emailul pleacă din contul personal. Poze atașate ca link către o pagină privată (tracking de deschidere: hash IP, user-agent → „a fost consultată de un om?”).
8. Confirmare pe email (Resend), ID unic + timestamp = dovadă oficială.
9. Rate limit anti-abuz: 2 sesizări / 10 minute.

## Statusuri & urmărire

- Statusuri: trimisă → (consultată de instituție) → rezolvată (doar autorul marchează, cu poză „după”) / persistă.
- Secțiune „înainte și după” pe fiecare sesizare.
- Sesizările active rămân pe hartă 30 zile, apoi dispar din public.
- După 30 zile fără răspuns: buton **escaladare** (Prefectură / Avocatul Poporului) + template followup.
- Remindere pe email.

## Harta (`/map`)

- MapLibre GL + tile-uri **OpenFreeMap** (gratuit, OpenMapTiles/OSM). Stil deschis, culori pastel.
- Clustere numerotate (portocaliu), pin-uri cu icon pe categorie, verde = rezolvat.
- Bară sus: chips „1893 total”, „Rezolvate · 362”, apoi categorii cu count (filtre).
- Ticker „Sesizări rezolvate: <categorie> · <adresă>”.
- Butoane flotante: „Urgență” (numere de urgență), „Susține”, „Localizează-mă”, „+ Sesizare nouă”.
- Click pe pin → card sesizare: categorie, adresă, autor anonimizat (ma*****), upvote „susține”, „trimite și în numele meu”, poze.

## Cont & auth

- Google OAuth, Apple, **magic link pe email** (fără parolă). NextAuth, cookie sesiune 30 zile.
- Fără cont NU poți: urmări status, badge-uri, apărea pe hartă / fi susținut, email confirmare + followup.
- Nume afișat parțial anonim pe hartă.

## Gamification (`/puncte-civice`)

| Acțiune                                                         | Puncte |
| --------------------------------------------------------------- | ------ |
| Trimiți sesizare                                                | +50    |
| Primești upvote                                                 | +10    |
| Escaladezi la Prefectură                                        | +50    |
| Confirmi cu poză rezolvarea sesizării tale                      | +30    |
| Confirmi cu poză rezolvarea sesizării altcuiva (misiune civică) | +100   |
| Confirmi pe teren că problema persistă (max 5/zi)               | +15    |
| Răspunzi la sondaj de cartier                                   | +100   |

Puncte disponibile pentru răscumpărare după 30 zile; recompense de la afaceri locale (`/recompense`, formular pentru business). Badge-uri, streak, clasament. Verificare pe teren = distanță GPS în intervale (<50m, 50–150m, >150m), nu coordonate exacte.

## Categorii (30)

Groapă în carosabil, Alei și trotuare, Iluminat defect, Avarie apă/termoficare, Spații verzi, Parcare ilegală (generic / trotuar / carosabil), Parcuri, Mașini abandonate, Marcaje trecere pietoni, Marcaj rutier lipsă/șters, Stâlpi anti-parcare, Trotinetă parcată ilegal, Semafor defect/lipsă, Cerere limitator viteză, Deșeuri ilegale, Salubritate/Colectare, Terenuri insalubre, Vandalism, Comerț stradal neautorizat, Ocupare domeniu public, Construcție ilegală, Mediu/Calitatea aerului, Animal vagabond, Deratizare, Dezinsecție, Transport suprafață (STB), Metrou, Spații comerciale.

Top în BUC: parcare ilegală trotuar (139), alei/trotuare (111), spații verzi (93), gropi (88), iluminat (66).

## Pagini

`/` (login split: stânga auth, dreapta hero), `/map`, `/report/*`, `/despre` (cum funcționează, de ce, categorii, FAQ, transparență, contact), `/puncte-civice`, `/recompense`, `/blog` (ghiduri: legea 544, OG 27/2002, ce faci dacă te ignoră, Poliția Locală vs 112, ADP), `/in-presa`, `/suport` (donații), `/privacy`, `/terms`, landing SEO per categorie `/sesizare/groapa-asfalt`.

## UI / design

- Font: **Plus Jakarta Sans**. Fundal `#F7F7F5`, text `#1A1A1A`, primar/accent **`#FF5C3A`** (portocaliu-coral), secundar gri `#6A7282`, theme-color `#1B2A6B` (navy). Radius 12px butoane, pill chips, carduri albe, umbre soft.
- Tailwind. Emoji ca iconițe de categorie/pași. Ton: prietenos, direct, „tu”.
- Mobil-first, `user-scalable=no`, PWA + app nativă (Android + iOS, probabil Capacitor).
- Cookie banner: esențiale + PostHog (EU) opt-in.

## Stack tehnic (dedus)

Next.js (App Router, `/_next/image`, Vercel), NextAuth, **Supabase** (Postgres + Storage pentru icoane), Cloudinary (poze), Resend (email), Anthropic Claude Sonnet (vision + text), Gemini / Grok fallback, MapLibre + OpenFreeMap, PostHog, Capacitor/mobile.

## Legal (RO)

- OG 27/2002 (petiții): răspuns 30 zile, +15 prelungire, redirecționare 5 zile.
- Legea 233/2002 (petiții — necesită nume + adresă petiționar).
- Legea 544/2001 (informații publice).
- GDPR: nu se stochează parole, poze private, IP hash 30 zile, retenție cont 2 ani.

## Context Brașov

- Primăria Brașov are **My BrasovCity** (com.brasov.citycare, 10K+ instalări, ultima actualizare mar. 2025): raportare incidente către Dispeceratul Tehnic (0268 405000), categorii: animale, apă-canal, capac canal, groapă, iluminat, mobilier urban, salubritate, semnalizare rutieră, spații verzi, stâlpi, transport. Necesită cont pe portal. Petiții online: serviciielectronice.brasovcity.ro (OG 27/2002).
- Instituții de mapat: Primăria Brașov (contact@brasovcity.ro, dispecerat 0268 405000), Poliția Locală Brașov (dispecerat@politialocalabrasov.ro, 0268 954), Compania Apa Brașov (clienti@apabrasov.ro, 0268 926), RATBV (ratbv@ratbv.ro), Comprest / salubritate, Serviciul Public de Administrare Creșe?/ Direcția Tehnică, Prefectura Brașov, IPJ Brașov, ISU, Direcția Silvică (urși!), Regia Pădurilor Kronstadt, etc. — de completat în faza de spec.
