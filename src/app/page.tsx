import { CategoryIndex, Masthead } from "@/components/landing/sections";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <Masthead />
        <CategoryIndex />
      </main>
      <SiteFooter />
    </>
  );
}
