# Open Brașov — Faza 0: Fundație (design spec)

Data: 2026-09-02. Status: aprobat verbal, în review scris.

## 1. Scop

Repo public, pipeline de release automat și un site deployat care afișează identitatea Open Brașov și o hartă MapLibre centrată pe Brașov. Fără auth, fără sesizări, fără AI. Tot ce urmează (Faza 1+) se construiește peste această fundație fără să o rescrie.

**Livrabil verificabil:**

- `github.com/openbrasov/openbrasov` public, licență AGPL-3.0.
- CI verde pe `main`; release-please a produs `v0.1.0` cu CHANGELOG și GitHub Release.
- Site pe Vercel (URL `*.vercel.app`, apoi `openbrasov.ro`): landing + `/harta` cu MapLibre + OpenFreeMap, centrată pe Brașov, fără pin-uri.
- Supabase project creat, conectat prin env, cu o migrare inițială minimă (doar extensia PostGIS).

## 2. Decizii fixate

| Decizie | Alegere | Motiv |
|---|---|---|
| Nume / domeniu | Open Brașov / `openbrasov.ro`, alias `bv.help` | liber, local, „open” = open source + oraș transparent |
| Licență | AGPL-3.0 | protejează caracterul civic: cine rulează o copie modificată publică codul |
| Framework | Next.js 16 (App Router, TypeScript strict, React 19) | ecosistem, Vercel, contributori |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) + Motion (Framer Motion) | cerut explicit; standard actual |
| Forms / data | react-hook-form + zod, TanStack Query | validare tipată, cache client |
| Icons | lucide-react | consistent, fără emoji ca iconițe |
| Toasts | sonner | |
| Backend | Supabase (Postgres, Auth, Storage) | free tier suficient, RLS, magic link nativ |
| Hărți | MapLibre GL JS + tile-uri OpenFreeMap | gratuit, fără cheie, fără limite; Mapbox cere card |
| Email | Resend (SMTP custom pentru Supabase Auth + tranzacțional) | Supabase SMTP default e limitat la ~2 email/oră |
| AI | Anthropic Claude (Faza 2) | vision + text, DPA |
| Analytics | PostHog EU, opt-in prin cookie banner (Faza 1) | |
| Hosting | Vercel Hobby | free, preview deploy pe PR |
| Package manager | pnpm, Node 22 LTS | |
| Teste | Vitest (unit) + Playwright (e2e smoke) | |
| Limbă UI | Română; strings în `messages/ro.json` de la început pentru i18n ulterior | |

## 3. Identitate vizuală (proprie, diferită de bucuresti.help)

bucuresti.help = coral `#FF5C3A` pe alb, Plus Jakarta Sans, emoji. Noi ne diferențiem clar.

**Concept:** Brașovul = munte, pădure, oraș vechi. Verde de brad ca primar, chihlimbar cald ca accent de acțiune, fundal cald-neutru. Serios cât să fie credibil pentru o petiție oficială, prietenos cât să nu pară site de primărie.

**Paletă (tokens semantice, light mode; dark mode derivat tonal, nu inversat):**

| Token | Hex | Rol |
|---|---|---|
| `--primary` | `#1B5E3B` | verde brad: brand, butoane primare, link-uri |
| `--primary-foreground` | `#FFFFFF` | |
| `--accent` | `#D97706` | chihlimbar: CTA „Sesizează”, pin sesizare deschisă |
| `--accent-foreground` | `#1C1917` | |
| `--background` | `#FAFAF7` | cald-neutru, nu alb pur |
| `--foreground` | `#14261D` | verde-negru, text |
| `--card` | `#FFFFFF` | |
| `--muted` | `#EEF1EC` | |
| `--muted-foreground` | `#5B6B62` | |
| `--border` | `#DCE3DD` | |
| `--destructive` | `#B91C1C` | |
| `--ring` | `#1B5E3B` | |

Status sesizare (Faza 1+): deschisă = accent chihlimbar, în lucru = albastru `#2563EB`, rezolvată = primar verde, escaladată = destructive. Fiecare status are și iconiță, nu doar culoare.

Contrast: primary pe background 7.6:1, foreground pe background 14:1, accent pe alb 3.3:1 (doar pentru elemente mari/UI; textul pe accent e `--accent-foreground`).

**Tipografie:** heading **Bricolage Grotesque** (variable, distinctiv, cald), body/UI **Inter** (variable, diacritice românești corecte ș/ț cu virgulă, cifre tabulare). Ambele prin `next/font/google`, `display: swap`. Scală: 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56. Body 16px, line-height 1.5.

**Formă:** radius 8px controale, 16px carduri, 999px chips. O singură scară de elevație. Spațiere 4/8. Fără emoji ca iconițe. Motion 150–300ms, `prefers-reduced-motion` respectat.

**Logo:** wordmark „Open Brașov” în Bricolage Grotesque + simbol simplu (pin de hartă cu siluetă de munte). Livrat ca SVG în Faza 0; se poate rafina ulterior.

Alegerile vin din `ui-ux-pro-max` (paletă „nature green + amber”, pairing geometric/humanist), verificate cu `impeccable` la implementare.

## 4. Structura repo

```
openbrasov/
├── .github/
│   ├── workflows/ci.yml              lint, typecheck, test, build (PR + main)
│   ├── workflows/release-please.yml  pe push main
│   ├── workflows/pr-title.yml        amannn/action-semantic-pull-request@v6
│   ├── dependabot.yml                npm + github-actions, weekly
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/{bug,feature}.yml
├── docs/                             ROADMAP, research, superpowers/specs, superpowers/plans
├── messages/ro.json                  strings UI
├── public/                           favicon, logo.svg, og-image
├── src/
│   ├── app/                          layout, page (landing), harta/page, termeni, confidentialitate
│   ├── components/ui/                shadcn
│   ├── components/brand/             Logo, Wordmark
│   ├── components/map/               Map (client), MapAttribution
│   ├── lib/supabase/{client,server,proxy}.ts
│   ├── lib/env.ts                    zod-validated env
│   └── styles/globals.css            tokens Tailwind v4 (@theme)
├── supabase/config.toml + migrations/0001_init.sql
├── tests/e2e/smoke.spec.ts
├── release-please-config.json, .release-please-manifest.json
├── LICENSE (AGPL-3.0), README.md, CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md
└── .env.example, .nvmrc, .editorconfig, eslint.config.mjs, prettier, vitest.config.ts, playwright.config.ts
```

## 5. GitHub Actions

- **ci.yml**: `pull_request` + `push: main`. Steps: checkout, pnpm setup (cache), `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Playwright smoke rulează în job separat `e2e`, cu browserele cache-uite.
- **release-please.yml**: `push: main`; `permissions: contents: write, pull-requests: write, issues: write`; `googleapis/release-please-action@v4` cu `config-file` + `manifest-file`, `release-type: node`. Versiunea inițială în manifest: `0.1.0`. Repo setting „Allow GitHub Actions to create and approve pull requests” = on.
- **pr-title.yml**: `pull_request_target` (opened, edited, reopened, synchronize); `amannn/action-semantic-pull-request@v6`; tipuri permise: feat, fix, docs, chore, refactor, perf, test, ci, build, style, revert; scope opțional.
- Repo: squash merge only (titlul PR devine commit conventional), branch protection pe `main` (PR + CI required), Dependabot activat.

## 6. Pagini Faza 0

- `/` landing: hero (wordmark, propoziția de valoare „Fotografiezi. AI-ul scrie. Instituția primește.” reformulată în tonul nostru), 3 pași, CTA „Vezi harta” (funcțional) și „Sesizează” (dezactivat vizual, „în curând”), footer cu link GitHub, licență, Termeni/Confidențialitate (placeholder scurt, marcat draft).
- `/harta`: full-screen MapLibre, centru Brașov `[25.5887, 45.6427]`, zoom 13, `maxBounds` pe zona metropolitană; control geolocate + zoom; atribuție OpenFreeMap / OpenMapTiles / OSM obligatorie; empty state „Încă nu sunt sesizări. În curând.” Fără pin-uri.
- `robots.txt`, `sitemap.xml`, `manifest.webmanifest` (PWA de bază), OG image statică.

## 7. Supabase (Faza 0)

Project creat manual în dashboard (region EU-central). Local: `supabase init` + `supabase/migrations/0001_init.sql` cu `create extension if not exists postgis;` (necesar din Faza 1 pentru coordonate) și nimic altceva. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, validate în `src/lib/env.ts`. Clienții `@supabase/ssr` (browser, server, proxy) sunt creați acum ca să nu se reconfigureze în Faza 1, dar nu sunt folosiți de nicio pagină.

## 8. Testare

- Vitest: `lib/env.ts` (env lipsă → eroare clară), un test de randare pentru `Logo`.
- Playwright smoke: `/` se încarcă și are `h1`; `/harta` montează canvasul MapLibre și afișează atribuția.
- CI rulează ambele. Fără coverage threshold în Faza 0.

## 9. Ce NU intră în Faza 0

Auth, schema DB pentru sesizări, upload, AI, PostHog, cookie banner, app nativă, i18n runtime (doar fișierul de strings), dark mode toggle (tokens există, toggle-ul vine cu profilul în Faza 1).

## 10. Riscuri

- Vercel Hobby interzice uz comercial; proiect civic nonprofit = ok. Dacă apar donații sau recompense de la firme, reevaluăm.
- OpenFreeMap fără SLA; fallback: self-host tiles sau Protomaps (tot gratuit).
- Supabase free tier: project pauzat după 7 zile de inactivitate; CI-ul nu atinge DB în Faza 0.
