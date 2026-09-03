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
