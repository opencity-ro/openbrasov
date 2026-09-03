# Open Brașov

Platformă civică open source pentru Brașov. Fotografiezi o problemă din oraș, AI-ul scrie sesizarea oficială, tu o trimiți instituției responsabile, comunitatea urmărește rezolvarea.

> Proiect independent, construit de cetățeni pentru cetățeni. Nu este afiliat Primăriei Brașov sau altei instituții publice.

## Status

Faza 0 — fundație. Vezi [docs/ROADMAP.md](docs/ROADMAP.md).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase · MapLibre GL + OpenFreeMap · Vercel

## Dezvoltare locală

```bash
pnpm install
cp .env.example .env.local   # completează cheile Supabase
pnpm dev
```

Comenzi utile: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`.

## Contribuții

Citește [CONTRIBUTING.md](CONTRIBUTING.md). Titlurile PR-urilor respectă [Conventional Commits](https://www.conventionalcommits.org/); release-urile sunt automate ([CHANGELOG.md](CHANGELOG.md)).

## Licență

[AGPL-3.0](LICENSE). Dacă rulezi o versiune modificată ca serviciu, trebuie să publici codul sursă.
