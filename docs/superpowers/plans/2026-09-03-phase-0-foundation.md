# Open Brașov — Phase 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Public AGPL repo `opencity-ro/openbrasov` with green CI, automated releases (release-please), PR-title linting, and a Vercel-deployed Next.js 16 site showing the Open Brașov identity plus an empty MapLibre map centred on Brașov.

**Architecture:** Single Next.js 16 App Router app (TypeScript strict, `src/`), Tailwind v4 + shadcn/ui (Radix) with our own semantic tokens, MapLibre GL + OpenFreeMap tiles in a client component, Supabase SSR clients wired but unused, zod-validated env. Vitest for unit tests, Playwright for two smoke tests. GitHub Actions for CI, release-please and PR-title checks.

**Tech Stack:** Node 22 LTS (local machine has Node 24; both fine), pnpm 10 via corepack, Next.js 16.3, React 19, Tailwind CSS 4, shadcn (Radix base), motion, lucide-react, sonner, zod, react-hook-form, @tanstack/react-query, maplibre-gl 5, @supabase/ssr, @supabase/supabase-js, Vitest 4 + @testing-library/react, Playwright 1.6x, supabase CLI (devDependency).

## Global Constraints

- Repo: `github.com/opencity-ro/openbrasov` (org slug fallback `opencityro`), public, license AGPL-3.0.
- Package manager: pnpm. Never commit `package-lock.json`.
- Node: `.nvmrc` = `22`. `package.json` `engines.node` = `>=22`.
- UI language: Romanian, correct diacritics (ș, ț with comma below). All user-facing strings live in `messages/ro.json`.
- No emoji as icons. Icons only from `lucide-react`.
- Palette (light): `--primary #1B5E3B`, `--primary-foreground #FFFFFF`, `--accent #D97706`, `--accent-foreground #1C1917`, `--background #FAFAF7`, `--foreground #14261D`, `--card #FFFFFF`, `--muted #EEF1EC`, `--muted-foreground #5B6B62`, `--border #DCE3DD`, `--destructive #B91C1C`, `--ring #1B5E3B`.
- Fonts: headings Bricolage Grotesque, body Inter, both via `next/font/google` with `display: "swap"`.
- Radius: 8px controls, 16px cards. Motion 150–300ms, respect `prefers-reduced-motion`.
- Map: MapLibre GL, style `https://tiles.openfreemap.org/styles/liberty`, centre `[25.5887, 45.6427]`, zoom 13, attribution "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" always visible.
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `test:`, `refactor:`, `build:`, `style:`, `perf:`, `revert:`). Every commit ends with the line `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (required, validated). CI and Playwright use dummy values `https://example.supabase.co` / `sb_publishable_dummy`.
- Working directory: `C:\My Folders\IT\open-brasov` (already a git repo with `docs/` and `.gitignore` committed on `main`).
- Shell on this machine: Git Bash. Use forward slashes and `pnpm` (after corepack enable).

---

## Task 0: Manual account setup (owner does this in a browser; no code)

**Files:** none.

**Interfaces:**

- Produces: GitHub org slug (`opencity-ro`), machine account `openbrasov-ro` as org member with write access, Vercel account on `openbrasov@gmail.com`, Supabase project URL + publishable key, Vercel GitHub App installed on the org.

- [ ] **Step 1: Create GitHub organization**

Logged in as the personal GitHub account (`rafail3`): github.com → "+" → "New organization" → Free plan → name `opencity-ro` (if taken, `opencityro`), contact email `openbrasov@gmail.com`, "My personal account". Set display name "OpenCity" in org settings → Profile.

- [ ] **Step 2: Create machine account**

In a private browser window: github.com/signup with `openbrasov@gmail.com`, username `openbrasov-ro`. Verify email. Then, back on the personal account: org `opencity-ro` → People → Invite member → `openbrasov-ro` → role Member. Accept the invite from the bot account (private window).

- [ ] **Step 3: Create Vercel account**

In the private window (still logged in as `openbrasov-ro` on GitHub): vercel.com/signup → "Continue with Email" → `openbrasov@gmail.com` → Hobby. Do **not** connect GitHub yet; Task 13 does it after the repo exists.

- [ ] **Step 4: Create Supabase project**

supabase.com → sign up with email `openbrasov@gmail.com` → New organization "OpenCity" (Free) → New project `openbrasov`, region `Central EU (Frankfurt)`, generate a strong DB password and store it in a password manager. When ready: Project Settings → API Keys → copy **Project URL** and the **publishable** key (`sb_publishable_…`). Keep them for Task 6 and Task 13.

- [ ] **Step 5: Buy domains (optional now, needed before going public)**

`openbrasov.ro` (ROTLD registrar, e.g. rotld.ro partner) and `bv.help`. Add both to Cloudflare (free), enable Email Routing `contact@openbrasov.ro` → `openbrasov@gmail.com`. Domains are attached to Vercel in Task 13 Step 6.

---

## Task 1: Scaffold Next.js 16 app with pnpm

**Files:**

- Create: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `public/*` (generated), `.nvmrc`, `.editorconfig`, `.prettierrc`, `.prettierignore`
- Modify: `.gitignore`

**Interfaces:**

- Produces: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format`, `pnpm format:check` scripts. Import alias `@/*` → `src/*`.

- [ ] **Step 1: Enable pnpm via corepack**

Run:

```bash
corepack enable && corepack prepare pnpm@latest --activate && pnpm -v
```

Expected: prints a `10.x.x` version.

- [ ] **Step 2: Scaffold into the existing directory**

Run from `C:/My Folders/IT/open-brasov`:

```bash
pnpm dlx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-pnpm --import-alias "@/*" --yes
```

Expected: "Success! Created open-brasov" and files `package.json`, `src/app/page.tsx`, `next.config.ts` exist. (`create-next-app` accepts a non-empty dir when it only contains `.git`, `.gitignore`, `docs`, `LICENSE`, `README.md`.) If it refuses because `AGENTS.md` or `README.md` conflict, delete the generated conflicts and re-run.

- [ ] **Step 3: Pin Node and set package metadata**

Create `.nvmrc`:

```
22
```

Edit `package.json` so the top looks like this (keep the generated `dependencies`/`devDependencies`, keep the `packageManager` field create-next-app wrote):

```json
{
  "name": "openbrasov",
  "version": "0.0.0",
  "private": true,
  "description": "Platformă civică open source pentru Brașov: fotografiezi o problemă, AI-ul scrie sesizarea, instituția o primește.",
  "license": "AGPL-3.0-only",
  "repository": {
    "type": "git",
    "url": "https://github.com/opencity-ro/openbrasov.git"
  },
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

- [ ] **Step 4: Add Prettier and editor config**

Run:

```bash
pnpm add -D prettier prettier-plugin-tailwindcss
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Create `.prettierignore`:

```
.next
node_modules
pnpm-lock.yaml
coverage
playwright-report
test-results
CHANGELOG.md
```

Create `.editorconfig`:

```
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

Create `.gitattributes` (forces LF so Windows checkouts do not flip line endings):

```
* text=auto eol=lf
```

Replace `.gitignore` with:

```
# deps
node_modules/
# next
.next/
out/
next-env.d.ts
# env
.env
.env*.local
# vercel
.vercel/
# tests
coverage/
playwright-report/
test-results/
blob-report/
# supabase
supabase/.temp/
supabase/.branches/
# os / editors
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
*.log
```

- [ ] **Step 5: Verify scripts run**

Run:

```bash
pnpm typecheck && pnpm lint && pnpm format && pnpm build
```

Expected: all exit 0; build prints the route table with `/`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "build: scaffold Next.js 16 app with pnpm, Tailwind v4, ESLint and Prettier

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 2: Open source hygiene files

**Files:**

- Create: `LICENSE`, `README.md` (overwrite generated), `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/bug.yml`, `.github/ISSUE_TEMPLATE/feature.yml`, `.github/ISSUE_TEMPLATE/config.yml`, `.github/dependabot.yml`
- Delete: `AGENTS.md` if create-next-app generated one (we keep agent guidance in `docs/`).

**Interfaces:**

- Produces: nothing code-level; conventions referenced by CI (PR template) and release-please (CHANGELOG link in README).

- [ ] **Step 1: Add AGPL-3.0 license**

Run (downloads the canonical text):

```bash
curl -fsSL https://www.gnu.org/licenses/agpl-3.0.txt -o LICENSE && head -3 LICENSE
```

Expected: first line `                    GNU AFFERO GENERAL PUBLIC LICENSE`.

- [ ] **Step 2: Write README.md**

````markdown
# Open Brașov

Platformă civică open source pentru Brașov. Fotografiezi o problemă din oraș, AI-ul scrie sesizarea oficială, tu o trimiți instituției responsabile, comunitatea urmărește rezolvarea.

> Proiect independent, construit de cetățeni pentru cetățeni. Nu este afiliat Primăriei Brașov sau altei instituții publice.

## Status

Faza 0 — fundație. Vezi [docs/ROADMAP.md](docs/ROADMAP.md).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase · MapLibre GL + OpenFreeMap · Vercel

## Dezvoltare locală

```bash
corepack enable
pnpm install
cp .env.example .env.local   # completează cheile Supabase
pnpm dev
```
````

Comenzi utile: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`.

## Contribuții

Citește [CONTRIBUTING.md](CONTRIBUTING.md). Titlurile PR-urilor respectă [Conventional Commits](https://www.conventionalcommits.org/); release-urile sunt automate ([CHANGELOG.md](CHANGELOG.md)).

## Licență

[AGPL-3.0](LICENSE). Dacă rulezi o versiune modificată ca serviciu, trebuie să publici codul sursă.

````

- [ ] **Step 3: Write CONTRIBUTING.md**

```markdown
# Cum contribui

1. Deschide un issue înainte de o schimbare mare, ca să aliniem direcția.
2. Fork + branch din `main`: `feat/<scurt>`, `fix/<scurt>`, `docs/<scurt>`.
3. Rulează local `pnpm lint && pnpm typecheck && pnpm test` înainte de PR.
4. Titlul PR-ului este un mesaj Conventional Commits, de exemplu `feat(map): add category filter`. PR-urile se îmbină prin squash, deci titlul devine mesajul de commit din `main`.
5. Tipuri acceptate: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `ci`, `build`, `style`, `revert`.
6. UI-ul este în română, cu diacritice corecte (ș, ț cu virgulă). Textele stau în `messages/ro.json`.
7. Fără emoji ca iconițe; folosim `lucide-react`.

Release-urile sunt automate: release-please deschide un PR de release după fiecare merge în `main`; merge-ul lui publică tag-ul și GitHub Release-ul.
````

- [ ] **Step 4: Write SECURITY.md**

```markdown
# Politica de securitate

Raportează vulnerabilități la **openbrasov@gmail.com** (după lansare: contact@openbrasov.ro). Nu deschide issue public pentru probleme de securitate.

Răspundem în maximum 7 zile și publicăm un fix coordonat. Mulțumim.
```

- [ ] **Step 5: Write CODE_OF_CONDUCT.md**

```markdown
# Cod de conduită

Acest proiect adoptă [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Pe scurt: respect, fără hărțuire, fără atacuri personale. Raportări la openbrasov@gmail.com.
```

- [ ] **Step 6: GitHub community files**

Create `.github/CODEOWNERS`:

```
* @rafail3
```

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Ce schimbă

<!-- o propoziție -->

## De ce

<!-- context, issue: Closes #… -->

## Verificare

- [ ] `pnpm lint && pnpm typecheck && pnpm test` trec local
- [ ] Titlul PR-ului este Conventional Commits (`feat:`, `fix:`, …)
- [ ] Textele UI sunt în `messages/ro.json`, cu diacritice corecte
```

Create `.github/ISSUE_TEMPLATE/bug.yml`:

```yaml
name: Bug
description: Ceva nu funcționează
labels: [bug]
body:
  - type: textarea
    id: what
    attributes:
      label: Ce se întâmplă
      description: Pași de reproducere, comportament așteptat vs. real.
    validations:
      required: true
  - type: input
    id: env
    attributes:
      label: Browser / dispozitiv
      placeholder: Chrome 140 pe Android 15
```

Create `.github/ISSUE_TEMPLATE/feature.yml`:

```yaml
name: Propunere
description: O funcționalitate nouă sau o îmbunătățire
labels: [enhancement]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problema pe care o rezolvă
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Propunerea
```

Create `.github/ISSUE_TEMPLATE/config.yml`:

```yaml
blank_issues_enabled: false
contact_links:
  - name: Securitate
    url: https://github.com/opencity-ro/openbrasov/blob/main/SECURITY.md
    about: Vulnerabilitățile se raportează privat.
```

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      minor-and-patch:
        update-types: [minor, patch]
    commit-message:
      prefix: "build"
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    commit-message:
      prefix: "ci"
```

- [ ] **Step 7: Remove generated AGENTS.md if present, format, commit**

```bash
rm -f AGENTS.md
pnpm format
git add -A
git commit -m "docs: add AGPL license, README, contributing, security and issue templates

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 3: GitHub Actions — CI, release-please, PR title

**Files:**

- Create: `.github/workflows/ci.yml`, `.github/workflows/release-please.yml`, `.github/workflows/pr-title.yml`, `release-please-config.json`, `.release-please-manifest.json`

**Interfaces:**

- Consumes: scripts `lint`, `typecheck`, `test` (Task 5 adds `test`; until then `pnpm test` must exist — Step 1 adds a placeholder), `build`, `test:e2e` (Task 11).
- Produces: required status checks named `CI / check` and `CI / e2e` used by branch protection in Task 12.

- [ ] **Step 1: Add placeholder test scripts so CI is green before Task 5/11**

Edit `package.json` scripts, add:

```json
"test": "echo \"no unit tests yet\" && exit 0",
"test:e2e": "echo \"no e2e tests yet\" && exit 0"
```

(Task 5 and Task 11 replace these.)

- [ ] **Step 2: Write ci.yml**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: sb_publishable_dummy
  NEXT_TELEMETRY_DISABLED: 1

jobs:
  check:
    name: check
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

  e2e:
    name: e2e
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Cache Playwright browsers
        uses: actions/cache@v5
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm exec playwright install --with-deps chromium
        if: hashFiles('playwright.config.ts') != ''
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v5
        if: ${{ !cancelled() && hashFiles('playwright-report/**') != '' }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

- [ ] **Step 3: Write release-please workflow and config**

Create `.github/workflows/release-please.yml`:

```yaml
name: release-please

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json
```

Create `release-please-config.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "release-type": "node",
  "bump-minor-pre-major": true,
  "include-component-in-tag": false,
  "changelog-sections": [
    { "type": "feat", "section": "Funcționalități" },
    { "type": "fix", "section": "Corecturi" },
    { "type": "perf", "section": "Performanță" },
    { "type": "refactor", "section": "Refactorizări", "hidden": true },
    { "type": "docs", "section": "Documentație", "hidden": true },
    { "type": "chore", "section": "Diverse", "hidden": true },
    { "type": "ci", "section": "CI", "hidden": true },
    { "type": "build", "section": "Build", "hidden": true },
    { "type": "test", "section": "Teste", "hidden": true }
  ],
  "packages": {
    ".": {}
  }
}
```

Create `.release-please-manifest.json`:

```json
{
  ".": "0.0.0"
}
```

(First release becomes `0.1.0` because the history contains `feat:` commits and `bump-minor-pre-major` is on.)

- [ ] **Step 4: Write pr-title.yml**

Create `.github/workflows/pr-title.yml`:

```yaml
name: PR title

on:
  pull_request_target:
    types: [opened, edited, reopened, synchronize]

permissions:
  pull-requests: read

jobs:
  lint-title:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v6
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            chore
            refactor
            perf
            test
            ci
            build
            style
            revert
          requireScope: false
          subjectPattern: ^(?![A-Z]).+$
          subjectPatternError: Subiectul începe cu literă mică, fără punct la final.
```

- [ ] **Step 5: Validate YAML locally and commit**

Run:

```bash
pnpm dlx yaml-lint .github/workflows/*.yml 2>/dev/null || node -e "const y=require('js-yaml')" 2>/dev/null; pnpm format:check
```

If neither linter is available just ensure `pnpm format:check` passes (Prettier parses YAML).

```bash
git add -A
git commit -m "ci: add CI, release-please and PR title workflows

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 4: Design tokens, fonts, shadcn/ui base

**Files:**

- Create: `components.json`, `src/lib/utils.ts` (by shadcn), `src/components/ui/button.tsx` (by shadcn)
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**

- Produces: Tailwind classes `bg-primary`, `text-primary-foreground`, `bg-accent`, `bg-background`, `text-muted-foreground`, `border-border`, `font-heading`, `font-sans`, `rounded-lg` (=8px) `rounded-2xl` (=16px); `cn()` from `@/lib/utils`; `Button` from `@/components/ui/button` with variants `default | accent | outline | ghost | link` and sizes `default | sm | lg | icon`.

- [ ] **Step 1: Initialise shadcn with Radix base**

Run:

```bash
pnpm dlx shadcn@latest init -y -b radix
pnpm dlx shadcn@latest add -y button
```

Expected: `components.json` created, `src/lib/utils.ts` and `src/components/ui/button.tsx` exist, `src/app/globals.css` now contains `@theme inline` and `:root` blocks.

- [ ] **Step 2: Replace token values in globals.css**

Open `src/app/globals.css`. Keep the `@import` lines, `@custom-variant dark`, the `@theme inline { … }` block and the `@layer base` block that shadcn wrote. Replace the entire `:root { … }` and `.dark { … }` blocks with:

```css
:root {
  --radius: 0.5rem; /* 8px controls; cards use rounded-2xl = 16px */
  --background: #fafaf7;
  --foreground: #14261d;
  --card: #ffffff;
  --card-foreground: #14261d;
  --popover: #ffffff;
  --popover-foreground: #14261d;
  --primary: #1b5e3b;
  --primary-foreground: #ffffff;
  --secondary: #eef1ec;
  --secondary-foreground: #14261d;
  --muted: #eef1ec;
  --muted-foreground: #5b6b62;
  --accent: #d97706;
  --accent-foreground: #1c1917;
  --destructive: #b91c1c;
  --destructive-foreground: #ffffff;
  --border: #dce3dd;
  --input: #dce3dd;
  --ring: #1b5e3b;
  --chart-1: #1b5e3b;
  --chart-2: #d97706;
  --chart-3: #2563eb;
  --chart-4: #b91c1c;
  --chart-5: #5b6b62;
  --sidebar: #ffffff;
  --sidebar-foreground: #14261d;
  --sidebar-primary: #1b5e3b;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #eef1ec;
  --sidebar-accent-foreground: #14261d;
  --sidebar-border: #dce3dd;
  --sidebar-ring: #1b5e3b;
}

.dark {
  --background: #0f1a14;
  --foreground: #e8efe9;
  --card: #16241c;
  --card-foreground: #e8efe9;
  --popover: #16241c;
  --popover-foreground: #e8efe9;
  --primary: #5cb381;
  --primary-foreground: #0f1a14;
  --secondary: #1f2f26;
  --secondary-foreground: #e8efe9;
  --muted: #1f2f26;
  --muted-foreground: #9fb0a6;
  --accent: #f59e0b;
  --accent-foreground: #1c1917;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2a3d32;
  --input: #2a3d32;
  --ring: #5cb381;
  --chart-1: #5cb381;
  --chart-2: #f59e0b;
  --chart-3: #60a5fa;
  --chart-4: #ef4444;
  --chart-5: #9fb0a6;
  --sidebar: #16241c;
  --sidebar-foreground: #e8efe9;
  --sidebar-primary: #5cb381;
  --sidebar-primary-foreground: #0f1a14;
  --sidebar-accent: #1f2f26;
  --sidebar-accent-foreground: #e8efe9;
  --sidebar-border: #2a3d32;
  --sidebar-ring: #5cb381;
}
```

Then, inside the existing `@theme inline { … }` block, add these two lines (fonts come from `next/font` CSS variables set in layout):

```css
--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
--font-heading: var(--font-bricolage), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
```

At the end of the file append:

```css
@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  h1,
  h2,
  h3 {
    font-family: var(--font-heading);
    letter-spacing: -0.01em;
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

- [ ] **Step 3: Add an `accent` button variant**

In `src/components/ui/button.tsx`, inside `variants.variant`, add after `default`:

```ts
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
```

- [ ] **Step 4: Load fonts in the root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Open Brașov",
    template: "%s · Open Brașov",
  },
  description:
    "Platformă civică open source pentru Brașov: fotografiezi o problemă, AI-ul scrie sesizarea, instituția o primește.",
};

export const viewport: Viewport = {
  themeColor: "#1b5e3b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="bg-background text-foreground min-h-dvh antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Smoke-check the tokens visually**

Replace `src/app/page.tsx` temporarily with:

```tsx
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="font-heading text-4xl font-bold">Open Brașov</h1>
      <p className="text-muted-foreground">Verificare tokens: ș ț Ș Ț ă â î.</p>
      <div className="flex gap-3">
        <Button>Primar</Button>
        <Button variant="accent">Sesizează</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </main>
  );
}
```

Run `pnpm dev`, open http://localhost:3000. Expected: cream background, green primary button, amber accent button, heading in Bricolage Grotesque (visibly different letterforms from the body text), diacritics render with comma-below.

- [ ] **Step 6: Lint, typecheck, commit**

```bash
pnpm lint && pnpm typecheck && pnpm format
git add -A
git commit -m "feat(ui): add design tokens, fonts and shadcn button

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 5: Validated env + Vitest setup

**Files:**

- Create: `src/lib/env.ts`, `src/lib/env.test.ts`, `vitest.config.ts`, `vitest.setup.ts`, `.env.example`
- Modify: `package.json` (scripts, devDeps), `tsconfig.json` (`types`, exclude e2e)

**Interfaces:**

- Produces: `env` object `{ NEXT_PUBLIC_SUPABASE_URL: string; NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string }` exported from `@/lib/env`; `pnpm test` runs Vitest once, `pnpm test:watch` watches.

- [ ] **Step 1: Install Vitest toolchain**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/dom vite-tsconfig-paths
```

- [ ] **Step 2: Configure Vitest**

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["tests/**", "node_modules/**", ".next/**"],
    css: false,
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

In `tsconfig.json`, add `"vitest/jsdom"` to `compilerOptions.types` (create the array if missing) and make sure `exclude` contains `"node_modules"` only; `tests/` (Playwright) gets its own tsconfig in Task 11.

Replace the placeholder scripts in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Write the failing env test**

Create `src/lib/env.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

const VALID = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
};

async function loadEnv(overrides: Partial<typeof VALID>) {
  vi.resetModules();
  const values = { ...VALID, ...overrides };
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", values.NEXT_PUBLIC_SUPABASE_URL);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return import("./env");
}

describe("env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("exposes validated public Supabase variables", async () => {
    const { env } = await loadEnv({});
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(VALID.NEXT_PUBLIC_SUPABASE_URL);
    expect(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe(
      VALID.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  });

  it("throws a readable error when the URL is invalid", async () => {
    await expect(loadEnv({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" })).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });

  it("throws when the publishable key is empty", async () => {
    await expect(loadEnv({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" })).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL, `Cannot find module './env'` (or similar) for all three tests.

- [ ] **Step 5: Implement env.ts**

```bash
pnpm add zod
```

Create `src/lib/env.ts`:

```ts
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

// NEXT_PUBLIC_* values are inlined at build time, so each one must be referenced literally.
const parsed = schema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment variables — ${details}`);
}

export const env = parsed.data;
export type Env = typeof env;
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test`
Expected: `3 passed`.

- [ ] **Step 7: Add .env.example and local env**

Create `.env.example`:

```
# Supabase → Project Settings → API Keys
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Copy to `.env.local` and fill in the real values from Task 0 Step 4 (`.env.local` is git-ignored).

- [ ] **Step 8: Lint, typecheck, commit**

```bash
pnpm lint && pnpm typecheck && pnpm format && pnpm test
git add -A
git commit -m "feat: add zod-validated env and Vitest setup

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 6: Supabase clients and initial migration

**Files:**

- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/proxy.ts`, `supabase/config.toml` (generated), `supabase/migrations/20260903000000_init.sql`, `supabase/.gitignore` (generated)

**Interfaces:**

- Consumes: `env` from `@/lib/env`.
- Produces: `createClient()` from `@/lib/supabase/client` (browser), `createClient()` from `@/lib/supabase/server` (server, async), `proxy()` in `src/proxy.ts` refreshing the session cookie. Phase 1 imports these unchanged.

- [ ] **Step 1: Install Supabase packages**

```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add -D supabase
pnpm exec supabase init
```

Expected: `supabase/config.toml` created. Answer `N` if prompted about VS Code/IntelliJ settings.

- [ ] **Step 2: Browser client**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
```

- [ ] **Step 3: Server client**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component: cookies are read-only there. The proxy refreshes sessions.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 4: Proxy (Next 16 name for middleware)**

Create `src/proxy.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes an expired session cookie if one exists. No-op for anonymous visitors.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
```

- [ ] **Step 5: Initial migration**

Create `supabase/migrations/20260903000000_init.sql`:

```sql
-- Phase 0: only the extension Phase 1 needs for report coordinates.
create extension if not exists postgis with schema extensions;
```

- [ ] **Step 6: Verify build with real env, commit**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: build succeeds; route table shows `ƒ Proxy` (or `Middleware`) line.

```bash
pnpm format
git add -A
git commit -m "feat: wire Supabase SSR clients, proxy and initial PostGIS migration

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 7: Brand components (Logo, Wordmark)

**Files:**

- Create: `src/components/brand/logo.tsx`, `src/components/brand/logo.test.tsx`, `public/logo.svg`, `public/favicon.svg`
- Delete: generated `public/*.svg` from create-next-app (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) and `src/app/favicon.ico`

**Interfaces:**

- Produces: `<LogoMark size?: number className?: string />` (SVG symbol, `role="img"`, `aria-label="Open Brașov"`), `<Wordmark className?: string />` (mark + text), both from `@/components/brand/logo`.

- [ ] **Step 1: Write the failing test**

Create `src/components/brand/logo.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LogoMark, Wordmark } from "./logo";

describe("brand", () => {
  it("LogoMark is an accessible image named Open Brașov", () => {
    render(<LogoMark />);
    expect(screen.getByRole("img", { name: "Open Brașov" })).toBeInTheDocument();
  });

  it("Wordmark renders the brand text with correct diacritics", () => {
    render(<Wordmark />);
    expect(screen.getByText("Open Brașov")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL, `Failed to resolve import "./logo"`.

- [ ] **Step 3: Implement the components**

Create `src/components/brand/logo.tsx`:

```tsx
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

/** Map pin with a mountain silhouette — Brașov sits under Tâmpa. */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      role="img"
      aria-label="Open Brașov"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <path
        d="M16 2C9.925 2 5 6.925 5 13c0 7.5 11 17 11 17s11-9.5 11-17c0-6.075-4.925-11-11-11Z"
        fill="currentColor"
        className="text-primary"
      />
      <path d="M9 17l4-6 3 4 2-3 5 5H9Z" fill="var(--background)" />
      <circle cx="21" cy="9" r="2" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={28} />
      <span className="font-heading text-xl font-bold tracking-tight">Open Brașov</span>
    </span>
  );
}
```

Create `public/logo.svg` (same drawing with literal colours, used for OG/social):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 32 32" fill="none">
  <path d="M16 2C9.925 2 5 6.925 5 13c0 7.5 11 17 11 17s11-9.5 11-17c0-6.075-4.925-11-11-11Z" fill="#1B5E3B"/>
  <path d="M9 17l4-6 3 4 2-3 5 5H9Z" fill="#FAFAF7"/>
  <circle cx="21" cy="9" r="2" fill="#D97706"/>
</svg>
```

Create `public/favicon.svg` with identical content to `public/logo.svg`.

Delete the boilerplate assets:

```bash
rm -f public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg src/app/favicon.ico
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: `5 passed` (3 env + 2 brand).

- [ ] **Step 5: Commit**

```bash
pnpm lint && pnpm typecheck && pnpm format
git add -A
git commit -m "feat(brand): add logo mark and wordmark

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 8: Romanian strings and landing page

**Files:**

- Create: `messages/ro.json`, `src/lib/messages.ts`, `src/components/site/header.tsx`, `src/components/site/footer.tsx`
- Modify: `src/app/page.tsx` (replace token smoke page), `tsconfig.json` (`resolveJsonModule` true — already default in Next)

**Interfaces:**

- Consumes: `Wordmark` from `@/components/brand/logo`, `Button` from `@/components/ui/button`.
- Produces: `t` object from `@/lib/messages` (typed as the JSON shape); `<SiteHeader />`, `<SiteFooter />` from `@/components/site/*`. Task 9 reuses `SiteHeader` and `t.map.*`.

- [ ] **Step 1: Strings file**

Create `messages/ro.json`:

```json
{
  "brand": {
    "name": "Open Brașov",
    "tagline": "Platformă civică open source pentru Brașov"
  },
  "nav": {
    "map": "Harta",
    "report": "Sesizează",
    "github": "Cod sursă pe GitHub"
  },
  "home": {
    "eyebrow": "Platforma civică din Brașov",
    "title": "Fotografiezi. AI-ul scrie. Instituția primește.",
    "subtitle": "O groapă, un stâlp căzut, gunoi lăsat pe stradă. Faci o poză, noi generăm sesizarea oficială cu temei legal și o trimiți instituției responsabile din emailul tău. Durează două minute.",
    "ctaMap": "Vezi harta",
    "ctaReport": "Sesizează o problemă",
    "ctaReportSoon": "În curând",
    "steps": [
      {
        "title": "Fotografiezi problema",
        "body": "Orice problemă din spațiul public al Brașovului, direct de pe telefon."
      },
      {
        "title": "AI-ul scrie sesizarea",
        "body": "Text oficial, temei legal, instituția responsabilă. Tu verifici și aprobi."
      },
      {
        "title": "Instituția primește",
        "body": "Sesizarea pleacă din emailul tău către Primărie, Poliția Locală sau operatorul responsabil."
      }
    ],
    "openSourceTitle": "Deschis de la primul commit",
    "openSourceBody": "Codul este public sub licență AGPL-3.0. Poți verifica cum funcționează, raporta probleme sau contribui."
  },
  "map": {
    "title": "Harta sesizărilor",
    "emptyTitle": "Încă nu sunt sesizări",
    "emptyBody": "Harta se va umple pe măsură ce brașovenii raportează probleme. În curând.",
    "locate": "Localizează-mă",
    "loading": "Se încarcă harta…"
  },
  "footer": {
    "independent": "Proiect independent, neafiliat Primăriei Brașov sau altei instituții publice.",
    "license": "Licență AGPL-3.0",
    "terms": "Termeni",
    "privacy": "Confidențialitate"
  },
  "legal": {
    "draft": "Document în lucru. Versiunea finală apare înainte de lansarea publică.",
    "termsTitle": "Termeni și condiții",
    "privacyTitle": "Politica de confidențialitate"
  }
}
```

Create `src/lib/messages.ts`:

```ts
import ro from "../../messages/ro.json";

export const t = ro;
export type Messages = typeof ro;
```

- [ ] **Step 2: Header and footer**

Create `src/components/site/header.tsx`:

```tsx
import { Github, MapPin } from "lucide-react";
import Link from "next/link";

import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

export function SiteHeader() {
  return (
    <header className="border-border bg-background/90 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={t.brand.name}>
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/harta">
              <MapPin aria-hidden="true" />
              {t.nav.map}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label={t.nav.github}>
            <a href="https://github.com/opencity-ro/openbrasov" target="_blank" rel="noreferrer">
              <Github aria-hidden="true" />
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
```

Create `src/components/site/footer.tsx`:

```tsx
import Link from "next/link";

import { t } from "@/lib/messages";

export function SiteFooter() {
  return (
    <footer className="border-border text-muted-foreground border-t text-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t.footer.independent}</p>
        <nav className="flex gap-4">
          <a
            href="https://github.com/opencity-ro/openbrasov/blob/main/LICENSE"
            className="hover:text-foreground"
          >
            {t.footer.license}
          </a>
          <Link href="/termeni" className="hover:text-foreground">
            {t.footer.terms}
          </Link>
          <Link href="/confidentialitate" className="hover:text-foreground">
            {t.footer.privacy}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Landing page**

Replace `src/app/page.tsx`:

```tsx
import { Camera, Landmark, Sparkles } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

const stepIcons = [Camera, Sparkles, Landmark] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            {t.home.eyebrow}
          </p>
          <h1 className="font-heading mt-3 max-w-3xl text-4xl font-bold text-balance sm:text-6xl">
            {t.home.title}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
            {t.home.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/harta">{t.home.ctaMap}</Link>
            </Button>
            <Button size="lg" variant="accent" disabled aria-disabled="true">
              {t.home.ctaReport}
              <span className="bg-accent-foreground/10 rounded-full px-2 py-0.5 text-xs font-medium">
                {t.home.ctaReportSoon}
              </span>
            </Button>
          </div>
        </section>

        <section className="bg-card border-border border-y">
          <ol className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
            {t.home.steps.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <li key={step.title} className="flex flex-col gap-3">
                  <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h2 className="font-heading text-xl font-semibold">
                    {index + 1}. {step.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold">{t.home.openSourceTitle}</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            {t.home.openSourceBody}
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 4: Legal placeholder pages**

Create `src/app/termeni/page.tsx`:

```tsx
import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { t } from "@/lib/messages";

export const metadata: Metadata = { title: t.legal.termsTitle };

export default function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="font-heading text-3xl font-bold">{t.legal.termsTitle}</h1>
        <p className="text-muted-foreground mt-4">{t.legal.draft}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
```

Create `src/app/confidentialitate/page.tsx` with the same structure, using `t.legal.privacyTitle` for both `metadata.title` and the `<h1>`, and component name `PrivacyPage`.

- [ ] **Step 5: Run everything, view, commit**

Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, then `pnpm dev` and check http://localhost:3000 on a 375px-wide viewport and desktop: header, hero, three steps with Lucide icons, footer links. No horizontal scroll.

```bash
pnpm format
git add -A
git commit -m "feat(site): add Romanian strings, landing page, header, footer and legal placeholders

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 9: MapLibre map and /harta page

**Files:**

- Create: `src/components/map/brasov-map.tsx`, `src/components/map/map-config.ts`, `src/components/map/map-config.test.ts`, `src/app/harta/page.tsx`

**Interfaces:**

- Consumes: `SiteHeader`, `t.map.*`.
- Produces: `BRASOV_CENTER: [number, number]`, `BRASOV_BOUNDS: [[number, number], [number, number]]`, `MAP_STYLE_URL`, `DEFAULT_ZOOM` from `@/components/map/map-config`; `<BrasovMap className? />` client component. Phase 1 adds a `reports` prop to `BrasovMap` without changing its mounting contract.

- [ ] **Step 1: Write the failing config test**

Create `src/components/map/map-config.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { BRASOV_BOUNDS, BRASOV_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL } from "./map-config";

describe("map config", () => {
  it("centres on Brașov inside the allowed bounds", () => {
    const [lng, lat] = BRASOV_CENTER;
    const [[west, south], [east, north]] = BRASOV_BOUNDS;
    expect(lng).toBeGreaterThan(west);
    expect(lng).toBeLessThan(east);
    expect(lat).toBeGreaterThan(south);
    expect(lat).toBeLessThan(north);
  });

  it("uses OpenFreeMap tiles and a city-level zoom", () => {
    expect(MAP_STYLE_URL).toMatch(/^https:\/\/tiles\.openfreemap\.org\/styles\//);
    expect(DEFAULT_ZOOM).toBe(13);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `./map-config`.

- [ ] **Step 3: Implement config**

Create `src/components/map/map-config.ts`:

```ts
/** [lng, lat] — Piața Sfatului area. */
export const BRASOV_CENTER: [number, number] = [25.5887, 45.6427];

/** Metropolitan area: Codlea/Ghimbav (W) → Săcele (E), Râșnov (S) → Bod (N). */
export const BRASOV_BOUNDS: [[number, number], [number, number]] = [
  [25.35, 45.5],
  [25.85, 45.78],
];

export const DEFAULT_ZOOM = 13;
export const MIN_ZOOM = 10;

export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export const MAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: `7 passed`.

- [ ] **Step 5: Install MapLibre and write the map component**

```bash
pnpm add maplibre-gl
```

Create `src/components/map/brasov-map.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

import { cn } from "@/lib/utils";
import { t } from "@/lib/messages";

import {
  BRASOV_BOUNDS,
  BRASOV_CENTER,
  DEFAULT_ZOOM,
  MAP_ATTRIBUTION,
  MAP_STYLE_URL,
  MIN_ZOOM,
} from "./map-config";

type BrasovMapProps = {
  className?: string;
};

export function BrasovMap({ className }: BrasovMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let map: import("maplibre-gl").Map | undefined;

    void (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled) return;

      map = new maplibregl.Map({
        container,
        style: MAP_STYLE_URL,
        center: BRASOV_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxBounds: BRASOV_BOUNDS,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.AttributionControl({ compact: false, customAttribution: MAP_ATTRIBUTION }),
        "bottom-right",
      );
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
        }),
        "bottom-right",
      );

      map.once("load", () => {
        if (!cancelled) setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div ref={containerRef} data-testid="map-canvas" className="absolute inset-0" />
      {!ready && (
        <p
          role="status"
          className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm"
        >
          {t.map.loading}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 6: /harta page with empty state**

Create `src/app/harta/page.tsx`:

```tsx
import type { Metadata } from "next";
import { MapPinOff } from "lucide-react";

import { BrasovMap } from "@/components/map/brasov-map";
import { SiteHeader } from "@/components/site/header";
import { t } from "@/lib/messages";

export const metadata: Metadata = {
  title: t.map.title,
  description: t.map.emptyBody,
};

export default function MapPage() {
  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      <main className="relative flex-1">
        <h1 className="sr-only">{t.map.title}</h1>
        <BrasovMap className="h-full w-full" />
        <div
          role="note"
          className="bg-card border-border absolute top-4 left-1/2 z-10 flex max-w-sm -translate-x-1/2 items-start gap-3 rounded-2xl border p-4 shadow-md"
        >
          <MapPinOff aria-hidden="true" className="text-accent mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">{t.map.emptyTitle}</p>
            <p className="text-muted-foreground text-sm">{t.map.emptyBody}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Verify in the browser**

Run `pnpm dev`, open http://localhost:3000/harta. Expected: full-height map of Brașov (OpenFreeMap "liberty" style), attribution text bottom-right, zoom + geolocate buttons, empty-state card at top. Panning far outside the county stops at the bounds. Loading text disappears once tiles render. Also check at 375px width.

- [ ] **Step 8: Commit**

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm format
git add -A
git commit -m "feat(map): add MapLibre map of Brașov with OpenFreeMap tiles

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 10: SEO, PWA manifest, OG image

**Files:**

- Create: `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts`, `src/app/icon.svg` (copy of `public/favicon.svg`), `src/app/opengraph-image.tsx`, `src/lib/site.ts`

**Interfaces:**

- Produces: `SITE_URL` from `@/lib/site` (reads `NEXT_PUBLIC_SITE_URL`, falls back to `https://openbrasov.ro`).

- [ ] **Step 1: Site constant**

Create `src/lib/site.ts`:

```ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://openbrasov.ro";
```

Add to `.env.example`:

```
# Public origin, used for sitemap/OG. Vercel preview: leave unset.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 2: robots, sitemap, manifest**

Create `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

Create `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/harta`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/termeni`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${SITE_URL}/confidentialitate`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
```

Create `src/app/manifest.ts`:

```ts
import type { MetadataRoute } from "next";

import { t } from "@/lib/messages";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: t.brand.name,
    short_name: t.brand.name,
    description: t.brand.tagline,
    start_url: "/harta",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#1b5e3b",
    lang: "ro",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
```

Copy `public/favicon.svg` to `src/app/icon.svg` (Next serves it as the favicon automatically) and delete `public/favicon.svg`.

- [ ] **Step 3: OG image**

Create `src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";

import { t } from "@/lib/messages";

export const alt = "Open Brașov";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        background: "#fafaf7",
        color: "#14261d",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "#1b5e3b",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 40, fontWeight: 700 }}>{t.brand.name}</div>
      </div>
      <div style={{ marginTop: 48, fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
        {t.home.title}
      </div>
      <div style={{ marginTop: 32, fontSize: 32, color: "#5b6b62" }}>{t.brand.tagline}</div>
    </div>,
    size,
  );
}
```

- [ ] **Step 4: Metadata base in layout**

In `src/app/layout.tsx`, add `metadataBase: new URL(SITE_URL)` to `metadata` and import `SITE_URL` from `@/lib/site`; also add:

```ts
  openGraph: { type: "website", locale: "ro_RO", siteName: "Open Brașov" },
```

- [ ] **Step 5: Verify and commit**

Run `pnpm build`; then `pnpm start` and check `curl -s localhost:3000/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image` (returns PNG, HTTP 200).

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm format
git add -A
git commit -m "feat(seo): add robots, sitemap, web manifest and OG image

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 11: Playwright smoke tests

**Files:**

- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`, `tests/tsconfig.json`
- Modify: `package.json` (`test:e2e`), `tsconfig.json` (`exclude` tests)

**Interfaces:**

- Consumes: `data-testid="map-canvas"` from `BrasovMap`, `h1` on `/`.
- Produces: `pnpm test:e2e` used by CI job `e2e`.

- [ ] **Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

- [ ] **Step 2: Config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_dummy",
      NEXT_PUBLIC_SITE_URL: baseURL,
    },
  },
});
```

Create `tests/tsconfig.json`:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": { "types": ["node"], "noEmit": true },
  "include": ["./**/*.ts"]
}
```

In root `tsconfig.json` add `"tests"` to `exclude` (so `pnpm typecheck` ignores Playwright files, which use their own config).

Replace the placeholder script in `package.json`:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Write the smoke tests**

Create `tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("landing page renders hero and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Fotografiezi");
  await expect(page.getByRole("link", { name: "Vezi harta" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sesizează o problemă/ })).toBeDisabled();
});

test("map page mounts MapLibre with attribution", async ({ page }) => {
  await page.goto("/harta");
  await expect(page.getByTestId("map-canvas")).toBeVisible();
  await expect(page.getByTestId("map-canvas").locator("canvas.maplibregl-canvas")).toBeAttached({
    timeout: 15_000,
  });
  await expect(page.getByText("OpenFreeMap")).toBeVisible();
  await expect(page.getByText("Încă nu sunt sesizări")).toBeVisible();
});

test("no horizontal overflow on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
```

- [ ] **Step 4: Run tests**

Run: `pnpm test:e2e`
Expected: `5 passed` (2 tests × 2 projects + 1 mobile-only). If the canvas assertion is flaky because WebGL is unavailable in headless Chromium, keep the `toBeAttached` check but add `--use-gl=swiftshader` via `launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader"] }` under the chromium project `use`.

- [ ] **Step 5: Commit**

```bash
pnpm lint && pnpm typecheck && pnpm format
git add -A
git commit -m "test: add Playwright smoke tests for landing and map

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Task 12: Publish to GitHub, repo settings, first release

**Files:** none new. Uses `gh` CLI (logged in as `rafail3`).

**Interfaces:**

- Consumes: org `opencity-ro` from Task 0.
- Produces: remote `origin`, branch protection on `main`, release PR → tag `v0.1.0`.

- [ ] **Step 1: Create the repo and push**

```bash
gh repo create opencity-ro/openbrasov --public --source=. --remote=origin --push \
  --description "Platformă civică open source pentru Brașov: fotografiezi o problemă, AI-ul scrie sesizarea, instituția o primește." \
  --homepage "https://openbrasov.ro"
```

Expected: `✓ Created repository opencity-ro/openbrasov on GitHub` and the push of `main`.

- [ ] **Step 2: Merge strategy, auto-delete branches, topics**

```bash
gh api -X PATCH repos/opencity-ro/openbrasov \
  -F allow_merge_commit=false -F allow_rebase_merge=false -F allow_squash_merge=true \
  -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=PR_BODY \
  -F delete_branch_on_merge=true -F has_wiki=false -F has_projects=false
gh repo edit opencity-ro/openbrasov --add-topic civic-tech --add-topic brasov --add-topic nextjs --add-topic supabase --add-topic maplibre --add-topic romania
```

- [ ] **Step 3: Let Actions create PRs (needed by release-please)**

```bash
gh api -X PUT repos/opencity-ro/openbrasov/actions/permissions/workflow \
  -f default_workflow_permissions=write -F can_approve_pull_request_reviews=true
```

- [ ] **Step 4: Wait for CI and the release PR**

```bash
gh run list --repo opencity-ro/openbrasov --limit 5
gh run watch --repo opencity-ro/openbrasov --exit-status
gh pr list --repo opencity-ro/openbrasov
```

Expected: `CI` succeeded; a PR titled `chore(main): release 0.1.0` opened by `github-actions[bot]`. If CI fails, fix locally, commit with a conventional prefix, push to `main` (protection is not on yet), re-check.

- [ ] **Step 5: Merge the release PR**

```bash
gh pr merge --repo opencity-ro/openbrasov --squash --auto "$(gh pr list --repo opencity-ro/openbrasov --search 'chore(main): release' --json number -q '.[0].number')"
gh release list --repo opencity-ro/openbrasov
```

Expected: release `v0.1.0` listed, `CHANGELOG.md` present on `main`, `package.json` version `0.1.0`. Pull locally: `git pull --ff-only`.

- [ ] **Step 6: Branch protection**

```bash
cat > /tmp/protection.json <<'EOF'
{
  "required_status_checks": { "strict": true, "contexts": ["check", "e2e", "Validate PR title"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF
gh api -X PUT repos/opencity-ro/openbrasov/branches/main/protection --input /tmp/protection.json
```

Note: the `contexts` names must match the job names shown in the Checks tab (`check`, `e2e`, and the pr-title job name). If `Validate PR title` differs, run `gh api repos/opencity-ro/openbrasov/commits/main/check-runs -q '.check_runs[].name'` and use the exact strings. From now on all work goes through PRs.

- [ ] **Step 7: Enable Dependabot security updates and secret scanning**

```bash
gh api -X PUT repos/opencity-ro/openbrasov/automated-security-fixes
gh api -X PUT repos/opencity-ro/openbrasov/vulnerability-alerts
```

---

## Task 13: Vercel deploy (manual, owner in the browser)

**Files:** none.

**Interfaces:**

- Consumes: Vercel account (Task 0 Step 3), `openbrasov-ro` GitHub account, Supabase URL + key.
- Produces: production URL `https://openbrasov.vercel.app` (name may vary) and preview deploys on PRs.

- [ ] **Step 1: Connect GitHub to the new Vercel account**

In the private window logged in as `openbrasov-ro` on GitHub and as `openbrasov@gmail.com` on Vercel: Vercel → Account Settings → Authentication → Login Connections → Connect GitHub → authorise `openbrasov-ro`.

- [ ] **Step 2: Install the Vercel GitHub App on the org**

Vercel → Add New → Project → "Import Git Repository" → GitHub → "Add GitHub Account" → choose organization `opencity-ro` → "Only select repositories" → `openbrasov` → Install. GitHub will ask an org Owner (your personal account) to approve the installation if the bot is only a Member: approve it at github.com/organizations/opencity-ro/settings/installations.

- [ ] **Step 3: Import and configure**

Import `opencity-ro/openbrasov`. Framework preset: Next.js (auto). Root directory `/`. Environment variables (Production + Preview):

- `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key
- `NEXT_PUBLIC_SITE_URL` = `https://openbrasov.ro` (Production only)
  Deploy.

- [ ] **Step 4: Verify**

Open the production URL: landing renders with fonts and colours, `/harta` loads tiles, `/robots.txt` and `/sitemap.xml` respond. Open a throwaway PR from the personal account (`git checkout -b chore/vercel-check`, edit `README.md`, push, `gh pr create`), confirm the Vercel bot comments a preview URL and CI passes, then merge via squash and delete the branch.

- [ ] **Step 5: Tighten Vercel settings**

Project → Settings → Git: production branch `main`; enable "Ignored Build Step" = `Automatic`. Settings → Deployment Protection: keep previews public (open source). Settings → Security → "Git Fork Protection" on.

- [ ] **Step 6: Domains (when purchased)**

Project → Settings → Domains → add `openbrasov.ro` and `www.openbrasov.ro` (redirect www → apex). In Cloudflare DNS: `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`, proxy **off** (grey cloud). Add `bv.help` the same way and set it to redirect to `openbrasov.ro`.

- [ ] **Step 7: Record the outcome**

Append to `docs/ROADMAP.md` under the table: `Faza 0 livrată: <data>, release v0.1.0, producție: <URL>.` Open a PR titled `docs: mark phase 0 as delivered`, merge it.

---

## Self-review

**Spec coverage:** §1 deliverables → Tasks 12 (repo, CI, v0.1.0), 13 (Vercel), 6 (Supabase). §2 stack → Tasks 1, 4, 5, 6, 9, 11. §3 identity → Task 4 (tokens, fonts, radius, reduced motion), Task 7 (logo). §4 structure → each file appears in a task; `src/lib/supabase/proxy.ts` from the spec is implemented as `src/proxy.ts` because Next 16 requires the proxy file at the `src/` root (spec note: acceptable deviation). §5 workflows → Task 3 + Task 12 settings. §6 pages → Tasks 8, 9, 10. §7 Supabase → Task 6. §8 tests → Tasks 5, 7, 9, 11. §9 exclusions respected (no auth, no PostHog, no toggle). §11 accounts → Tasks 0, 12, 13. Not in Phase 0 but installed per §2 "cerut explicit": `motion`, `react-hook-form`, `@tanstack/react-query`, `sonner` are **not** installed in this plan because nothing in Phase 0 uses them (YAGNI); Phase 1 adds each when first used.

**Placeholder scan:** none; every code step has full content. Legal pages intentionally show the "document în lucru" string from `messages/ro.json`, which is the spec's placeholder requirement.

**Type consistency:** `env` shape (Task 5) matches uses in Task 6; `t.map.loading`, `t.map.emptyTitle`, `t.map.emptyBody` (Task 8) match Task 9; `data-testid="map-canvas"` (Task 9) matches Task 11; `Button` variant `accent` (Task 4) matches Task 8; `SITE_URL` (Task 10) used consistently.
