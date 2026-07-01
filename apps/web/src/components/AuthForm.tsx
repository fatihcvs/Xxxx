"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { loginAction, registerAction, type AuthActionState } from "@/app/actions/auth";

export function AuthForm({ mode, locale }: { mode: "login" | "register"; locale: string }) {
  const t = useTranslations("auth");
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label className="block text-xs mb-1 text-ink/70">{t("email")}</label>
        <input name="email" type="email" required className="field" autoComplete="email" />
      </div>
      <div>
        <label className="block text-xs mb-1 text-ink/70">{t("password")}</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="field"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{t(state.error as "invalid" | "emailTaken")}</p>
      )}
      <button type="submit" className="btn w-full" disabled={pending}>
        {mode === "login" ? t("loginCta") : t("registerCta")}
      </button>
      <p className="text-center text-sm text-ink/70">
        {mode === "login" ? (
          <Link href="/register" className="text-brand hover:underline">
            {t("toRegister")}
          </Link>
        ) : (
          <Link href="/login" className="text-brand hover:underline">
            {t("toLogin")}
          </Link>
        )}
      </p>
    </form>
  );
}
