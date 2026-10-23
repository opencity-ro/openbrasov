---
name: open-brasov-design
description: "Limbajul vizual al platformei: cerneală neutră ca ancoră, verde ca singura culoare de voltaj, portocaliu doar pentru acțiune, albastru și galben numai pe date. Montserrat pe interfață, Newsreader pe titluri. Suprafețe separate prin linii de un punct, nu prin umbre. Inspirat de limbajul Linear, adaptat: ținem și tema deschisă, fiindcă oamenii deschid aplicația afară, în soare."

brand:
  ink: "#14171a"
  green: "#08a045"
  orange: "#d65108"

data:
  blue: "#2b59c3"
  yellow: "#f5cb5c"

colors-light:
  background: "#f6f7f8"
  foreground: "#14171a"
  card: "#ffffff"
  primary: "#078037"
  on-primary: "#ffffff"
  accent: "#b84507"
  on-accent: "#ffffff"
  muted: "#eef0ed"
  muted-foreground: "#585e62"
  border: "#dde0db"
  destructive: "#b91c1c"

colors-dark:
  background: "#14171a"
  foreground: "#e9ecef"
  card: "#1a1e22"
  surface-2: "#202429"
  primary: "#08a045"
  on-primary: "#14171a"
  accent: "#e86520"
  on-accent: "#14171a"
  muted-foreground: "#9ba2ab"
  border: "#2a2f35"
  destructive: "#ef4444"

typography:
  sans: Montserrat
  display: Newsreader
  mono: JetBrains Mono
  scale: [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72]
  display-tracking: "-0.025em"
  display-weight: 500
  body-line-height: 1.6

rounded:
  control: 8px
  card: 16px
  pill: 9999px

spacing:
  base: 4px
  section: 96px
  container: 1152px
---

# Limbajul vizual

## De unde vine

Ancora e sistemul **Linear**: pânză aproape neagră, o singură culoare de voltaj, ierarhie făcută din trepte de suprafață și linii de un punct, interfața produsului ca erou al paginii. Am luat structura, nu înfățișarea.

Ce am schimbat față de el, cu motiv:

- **Ținem tema deschisă.** Linear interzice modul deschis pe pagina de prezentare. Noi suntem un serviciu public pe care cineva îl deschide în stradă, cu soarele în ecran. Ambele teme sunt de rang egal și se proiectează împreună.
- **Avem două culori cromatice, nu una.** Verdele e marca, portocaliul e acțiunea. Restul culorilor din aplicație sunt date, nu identitate.

## Culorile

Trei primitive de marcă, în `src/app/globals.css`. Componentele nu le ating niciodată direct: citesc tokenii semantici, iar aceia se leagă de primitive. Dacă marca se schimbă, se schimbă într-un singur loc.

| Rol                      | Ce face                                                                                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cerneală** `#14171a`   | Scrisul pe temă deschisă, pânza pe temă închisă. Aceeași culoare, două meserii. E neutră, nu verzuie: o pânză cu tentă trage toate culorile de pe ea către ea, iar verdele mărcii s-ar topi în fundal în loc să iasă din el. |
| **Verde** `#08a045`      | Marca. Semnul, acțiunea principală, inelul de focus, legătura accentuată. Niciodată ca fundal de secțiune sau umplutură de card.                                                                                             |
| **Portocaliu** `#d65108` | Acțiunea care cere ceva de la om: butonul de sesizare, starea deschisă pe hartă.                                                                                                                                             |

Două locuri unde culoarea mărcii nu trece pragul de contrast, și ce facem:

- alb pe verdele mărcii dă **3.43:1**, sub AA. Pe lumină interactivul coboară o treaptă, la `#078037`, și ajunge la **5.06:1**. Culoarea arată la fel la privire; verdele curat trăiește în semn, pe hartă și pe tema închisă, unde dă **5.25:1** cu cerneala deasupra.
- alb pe portocaliul mărcii dă **4.17:1**. Pe deschis coborâm la `#b84507` (**5.4:1**), pe închis urcăm la `#e86520` (**5.41:1** cu cerneala deasupra).

Celelalte două culori din paletă poartă **date, nu marcă**, și au fiecare un singur înțeles:

| Rol                                | Unde apare                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Albastru** `#2b59c3` (`--info`)  | starea „în lucru": insigna de pe pin, punctul din filtre, eticheta din card. Pe întuneric urcă la `#6f93f0`, ca să rămână lizibil. |
| **Galben** `#f5cb5c` (`--pending`) | ce încă nu s-a întâmplat: eticheta de pe o acțiune care nu e gata. Cu cerneala deasupra trece de 11:1, în ambele teme.             |

Niciuna nu devine culoare de fundal de secțiune, de buton principal sau de navigație. Dacă într-o zi una dintre ele ajunge să decoreze, înseamnă că a încetat să mai însemne ceva.

## Literele

Două familii, cu meserii care nu se suprapun.

- **Montserrat** duce tot ce e interfață: butoane, etichete, titluri de card, text curent. O singură voce, de la buton la paragraf.
- **Newsreader** apare numai pe titluri de pagină și de secțiune. E croită pentru citit lung, deci la corp mare are desenul așezat al unei pagini tipărite, nu zvâcul unui titlu de reclamă. Lângă geometria lui Montserrat face contrastul care lipsea când tot ce scria pe pagină era același sans îngroșat.
- Pe display, greutatea **500** și tracking negativ (`-0.025em`). Serifele nu se îngroașă la 700: la corp mare desenul lor se umflă și pierde exact eleganța pentru care au fost alese.
- Accentul dintr-un titlu se face cu **cursivul aceleiași familii**, niciodată amestecând două familii într-un rând.
- **JetBrains Mono** e vocea tehnică: etichete, coduri, cifre, legende de planșă. Apare doar unde conținutul chiar e dată, niciodată ca să dea un aer „tehnologic" unui text obișnuit. Se scrie mic, cu majuscule și tracking larg.
- Textul curent rămâne la tracking normal și 1.6 înălțime de rând.

## Planșa

Zonele importante nu se închid în carduri, se marchează ca pe o fișă tehnică: patru colțare, o etichetă monospațiată sus-stânga, o legendă jos-dreapta. Cadrul nu are fundal și nu are umbră, deci conținutul curge mai departe pe sub el în loc să fie înrămat.

Verdele mărcii apare o singură dată pe pagină ca **marker peste un cuvânt** din titlu. E singura lui apariție decorativă admisă, fiindcă acolo chiar face o treabă: spune unde se uită ochiul întâi.

## Formele și adâncimea

- Colțuri: **8px** pe controale, **16px** pe carduri. Pilula completă apare în două locuri și numai acolo: eticheta mică dintr-un buton și degetul barei de derulare, adică forme care nu sunt nici control, nici card.
- Separarea se face cu **linii de un punct** și cu trepte de suprafață, nu cu umbre. Pe o pânză aproape neagră umbra nu se vede, iar pe cea deschisă îngroașă interfața degeaba.
- Treptele de suprafață pe întuneric: pânza `#14171a` → cardul `#1a1e22` → suprafața a doua `#202429`. Nu se sare o treaptă.
- Singurele umbre din sistem sunt ale obiectelor care chiar stau deasupra altora: semnele de pe hartă și butonul așezat peste ea.

## Harta desenată

Pagina de pornire nu încarcă harta adevărată. Geometria Brașovului se extrage o dată din dalele vectoriale pe care le servim oricum, cu `pnpm map:city`, și ajunge în `src/components/landing/city-map-data.ts` ca un set de contururi. Pagina desenează un SVG: fără bibliotecă de hărți, fără dale, fără nicio cerere de rețea.

Planul stă culcat sub un unghi, iar semnele se ridică perpendicular pe el și își poartă umbra pe pământ. Asta e ce spune ochiului că obiectele stau _deasupra_ orașului, nu lipite peste poza lui. Planul se înclină ușor după cursor, cu arc, cât să pară viu.

Semnele sunt elemente adevărate, nu desen: se pot ținti cu mouse-ul, cu degetul și cu tastatura, poartă iconița și culoarea categoriei lor din aplicație, iar fiecare duce la categoria lui pe hartă. Cad pe vârfuri de stradă adevărate din aceeași geometrie, nu împrăștiate pe pânză.

Culorile hărții stau în tokeni separați (`--map-canvas`, `--map-green`, `--map-water`, `--map-street`, `--map-road`, `--map-major`, `--map-pin-ring`), fiindcă o hartă nu folosește aceeași scară de suprafețe ca interfața.

## Mișcarea

Discretă și motivată. 150-300ms pe micro-interacțiuni, până la 560ms pe intrări, `transform` și `opacity`, niciodată lățime sau înălțime. Curba e aceeași peste tot, `cubic-bezier(0.16, 1, 0.3, 1)`, ca totul să frâneze la fel.

Blocurile de pagină intră o singură dată, la prima trecere prin dreptul lor, cu `motion` (`Reveal`). Semnele hărții intră etajate, câte unul la 55ms.

Orice mișcare respectă `prefers-reduced-motion`; cu ea pornită, conținutul apare direct și planul nu mai urmărește cursorul. Singurele animații care se repetă sunt pulsurile, și spun ceva: sesizarea e nouă.

## Ce nu facem

- Fără degradeuri atmosferice, fără aureole colorate, fără sticlă mată.
- Fără verde ca fundal de secțiune.
- Fără capturi de ecran false construite din `div`-uri.
- Fără cifre inventate: nu scriem numere de sesizări sau de utilizatori până nu sunt reale.
- Fără emoji ca iconițe de interfață. Iconițele hărții sunt alt lucru: acolo imaginile sunt chiar conținutul.
- Fără etichetă mică de categorie deasupra fiecărui titlu de secțiune. Titlul se susține singur.
