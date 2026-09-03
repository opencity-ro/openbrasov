import { MapPin } from "lucide-react";
import Link from "next/link";

import { Wordmark } from "@/components/brand/logo";
import { GithubIcon } from "@/components/icons/github";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { UserMenu } from "@/components/site/user-menu";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

export function SiteHeader() {
  return (
    <header className="border-border bg-background/90 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={t.brand.name}>
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="xl">
            <Link href="/harta" aria-label={t.nav.map}>
              <MapPin aria-hidden="true" />
              <span className="hidden sm:inline">{t.nav.map}</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon-xl" aria-label={t.nav.github}>
            <a href="https://github.com/opencity-ro/openbrasov" target="_blank" rel="noreferrer">
              <GithubIcon />
            </a>
          </Button>
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
