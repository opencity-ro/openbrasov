---
name: open-brasov-design
description: "Limbajul vizual al platformei: Onyx ca ancoră, verde ca singura culoare de voltaj, portocaliu doar pentru acțiune, albastru și galben numai pe date. Plus Jakarta Sans peste tot, Bricolage Grotesque numai pe titlurile mari. Suprafețe separate prin linii de un punct, nu prin umbre. Inspirat de limbajul Linear, adaptat: ținem și tema deschisă, fiindcă oamenii deschid aplicația afară, în soare."

brand:
  onyx: "#0d160b"
  green: "#08a045"
  orange: "#d65108"

data:
  blue: "#2b59c3"
  yellow: "#f5cb5c"

colors-light:
  background: "#f7f8f5"
  foreground: "#0d160b"
  card: "#ffffff"
  primary: "#078037"
  on-primary: "#ffffff"
  accent: "#b84507"
  on-accent: "#ffffff"
  muted: "#ecefe8"
  muted-foreground: "#546152"
  border: "#dce2d7"
  destructive: "#b91c1c"

colors-dark:
  background: "#0d160b"
  foreground: "#e9efe6"
  card: "#131d11"
  surface-2: "#182417"
  primary: "#08a045"
  on-primary: "#0d160b"
  accent: "#e86520"
  on-accent: "#0d160b"
  muted-foreground: "#9fb09b"
  border: "#243021"
  destructive: "#ef4444"

typography:
  sans: Plus Jakarta Sans
  display: Bricolage Grotesque
  scale: [12, 14, 16, 18, 20, 24, 30, 36, 48, 60]
  display-tracking: "-0.02em"
  body-line-height: 1.6

rounded:
  control: 8px
  card: 16px

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

| Rol                      | Ce face                                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Onyx** `#0d160b`       | Cerneala pe temă deschisă, pânza pe temă închisă. Aceeași culoare, două meserii.                                                 |
| **Verde** `#08a045`      | Marca. Semnul, acțiunea principală, inelul de focus, legătura accentuată. Niciodată ca fundal de secțiune sau umplutură de card. |
| **Portocaliu** `#d65108` | Acțiunea care cere ceva de la om: butonul de sesizare, starea deschisă pe hartă.                                                 |

Două locuri unde culoarea mărcii nu trece pragul de contrast, și ce facem:

- alb pe verdele mărcii dă **3.43:1**, sub AA. Pe temă deschisă interactivul coboară o treaptă, la `#078037`, și ajunge la **5.06:1**. Culoarea arată la fel la privire; verdele curat trăiește în semn, pe hartă și pe tema închisă, unde dă **5.39:1** cu cerneala deasupra.
- alb pe portocaliul mărcii dă **4.17:1**. Pe deschis coborâm la `#b84507` (**5.4:1**), pe închis urcăm la `#e86520` (**5.55:1** cu Onyx deasupra).

Celelalte două culori din paletă poartă **date, nu marcă**, și au fiecare un singur înțeles:

| Rol                                | Unde apare                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Albastru** `#2b59c3` (`--info`)  | starea „în lucru": insigna de pe pin, punctul din filtre, eticheta din card. Pe întuneric urcă la `#6f93f0`, ca să rămână lizibil pe Onyx. |
| **Galben** `#f5cb5c` (`--pending`) | ce încă nu s-a întâmplat: eticheta „în curând" de pe o acțiune care nu e gata. Cu Onyx deasupra dă 11.95:1, în ambele teme.                |

Niciuna nu devine culoare de fundal de secțiune, de buton principal sau de navigație. Dacă într-o zi una dintre ele ajunge să decoreze, înseamnă că a încetat să mai însemne ceva.

## Literele

- **Plus Jakarta Sans** duce tot: interfață, titluri de card, text. O singură voce, de la buton la paragraf.
- **Bricolage Grotesque** apare numai pe titlul `h1` al unei pagini. Nu pe interfață, nu pe titluri de card, nu pe butoane. Are talia mai largă și tăietura mai apăsată, deci titlul se desparte de pagină fără să crească în corp de literă; pusă peste tot, ar striga.
- Pe display, 700 și tracking negativ (`-0.02em`). Textul curent rămâne la tracking normal și 1.6 înălțime de rând.

## Semnul

O bulă de mesaj cu vârful în jos și punctul locului în mijloc. Verdele poartă forma, portocaliul stă în punct: a doua culoare a mărcii intră acolo unde se uită ochiul oricum, iar inelul dintre punct și bulă rămâne decupat, deci semnul funcționează pe orice fundal fără o versiune separată.

Nu se desenează cu contur, nu primește umbră, nu se pune pe un pătrat colorat. Mărimea minimă e 16 puncte, unde încă se citesc toate trei formele.

## Formele și adâncimea

- Colțuri: **8px** pe controale, **16px** pe carduri. Un singur sistem, fără excepții.
- Separarea se face cu **linii de un punct** și cu trepte de suprafață, nu cu umbre. Pe o pânză aproape neagră umbra nu se vede, iar pe cea deschisă îngroașă interfața degeaba.
- Treptele de suprafață pe întuneric: pânza `#0d160b` → cardul `#131d11` → suprafața a doua `#182417`. Nu se sare o treaptă.

## Mișcarea

Discretă și motivată. 150-300ms pe micro-interacțiuni, `transform` și `opacity`, niciodată lățime sau înălțime. Orice mișcare respectă `prefers-reduced-motion`. Pulsul de pe hartă e singura animație care se repetă, și spune ceva: sesizarea e din ultimele șapte zile.

## Ce nu facem

- Fără degradeuri atmosferice, fără aureole colorate, fără sticlă mată.
- Fără verde ca fundal de secțiune.
- Fără capturi de ecran false construite din `div`-uri. Harta e reală sau nu apare.
- Fără cifre inventate: nu scriem numere de sesizări sau de utilizatori până nu sunt reale.
- Fără emoji ca iconițe de interfață. Iconițele hărții sunt alt lucru: acolo imaginile sunt chiar conținutul.
