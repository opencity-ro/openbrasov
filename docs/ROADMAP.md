# Open Brașov — Roadmap

Aplicație civică open source pentru Brașov: fotografiezi o problemă din oraș, AI-ul scrie sesizarea oficială, tu o trimiți instituției responsabile, comunitatea urmărește rezolvarea.

| Fază                         | Conținut                                                                                                                                    | Rezultat                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **0. Fundație**              | Repo + GitHub Actions (CI, release-please, PR title), Next.js scaffold, identitate vizuală + design system, Supabase project, deploy Vercel | `openbrasov.ro` live cu landing + hartă MapLibre pe Brașov (fără date) |
| **1. Cont + hartă**          | Magic link + Google login, profil, pin-uri din DB, card sesizare, filtre categorii, clustere                                                | Vezi sesizări pe hartă                                                 |
| **2. Sesizare cu AI**        | Poză → categorie AI → locație → text oficial → `mailto:`; guest mode; instituții Brașov mapate; confirmare email; ID unic                   | Fluxul principal complet, de la poză la instituție                     |
| **3. Status + comunitate**   | Rezolvată cu poză, upvote, „trimite și în numele meu”, escaladare după 30 zile, remindere                                                   | Comunitate: susținere, urmărire, escaladare                            |
| **4. Puncte civice + extra** | Gamification, badge-uri, recompense locale, blog/ghiduri, PWA install, landing SEO per categorie                                            | Peste nivelul unei platforme civice obișnuite                          |

Fiecare fază: spec în `docs/superpowers/specs/` → plan în `docs/superpowers/plans/` → implementare pe branch → PR → release.
