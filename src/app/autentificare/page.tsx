import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { LogoMark } from "@/components/brand/logo";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { t } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: t.auth.title,
  description: t.auth.subtitle,
};

const errorMessages: Record<string, string> = {
  link: t.auth.errorLink,
  google: t.auth.errorGoogle,
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ eroare?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/harta");

  const { eroare } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="bg-card border-border w-full max-w-md rounded-2xl border p-6 shadow-sm sm:p-8">
          <LogoMark size={40} className="mb-6" />
          <SignInForm initialError={eroare ? errorMessages[eroare] : undefined} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
