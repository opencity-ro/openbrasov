# Cum contribui

1. Deschide un issue înainte de o schimbare mare, ca să aliniem direcția.
2. Fork sau branch din `main`: `feat/<scurt>`, `fix/<scurt>`, `docs/<scurt>`.
3. Rulează local `pnpm lint && pnpm typecheck && pnpm test` înainte de PR.
4. Titlul PR-ului este un mesaj Conventional Commits, de exemplu `feat(map): adaugă filtru pe categorii`. PR-urile se îmbină prin squash, deci titlul devine mesajul de commit din `main`.
5. Tipurile acceptate: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `ci`, `build`, `style`, `revert`.
6. UI-ul este în română, cu diacritice corecte (ș, ț cu virgulă). Textele stau în `messages/ro.json`.
7. Fără emoji ca iconițe; folosim `lucide-react`.

Release-urile sunt automate: release-please deschide un PR de release după fiecare merge în `main`; merge-ul acelui PR publică tag-ul și GitHub Release-ul.
