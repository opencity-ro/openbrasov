"use client";

import { Loader2, Mail, MailCheck } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { GoogleIcon } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink, signInWithGoogle, type AuthState } from "@/lib/auth/actions";
import { t } from "@/lib/messages";

const initialState: AuthState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="xl" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Mail aria-hidden="true" />
      )}
      {pending ? t.auth.submitting : t.auth.submit}
    </Button>
  );
}

export function SignInForm({ initialError }: { initialError?: string }) {
  const [state, formAction] = useActionState(sendMagicLink, initialState);

  if (state.status === "sent") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
          <MailCheck aria-hidden="true" className="size-7" />
        </span>
        <h1 className="font-heading text-2xl font-bold">{t.auth.sentTitle}</h1>
        <p className="text-muted-foreground leading-relaxed">
          {t.auth.sentBody.replace("{email}", state.email ?? "")}
        </p>
        <p className="text-muted-foreground text-sm">{t.auth.sentHint}</p>
        <form action={formAction}>
          <input type="hidden" name="email" value={state.email ?? ""} />
          <Button type="submit" variant="outline" size="lg">
            {t.auth.retry}
          </Button>
        </form>
      </div>
    );
  }

  const error = state.status === "error" ? state.message : initialError;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold">{t.auth.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{t.auth.subtitle}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-3" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t.auth.emailLabel}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            placeholder={t.auth.emailPlaceholder}
            aria-describedby={error ? "email-error" : undefined}
            aria-invalid={error ? true : undefined}
            className="h-11"
          />
          {error && (
            <p id="email-error" role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </div>
        <SubmitButton />
      </form>

      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs uppercase">{t.auth.or}</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" size="xl" className="w-full">
          <GoogleIcon />
          {t.auth.google}
        </Button>
      </form>

      <p className="text-muted-foreground text-sm leading-relaxed">{t.auth.guestNote}</p>
    </div>
  );
}
