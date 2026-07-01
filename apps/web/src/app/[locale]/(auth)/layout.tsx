import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("app");
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand">{t("name")}</h1>
          <p className="text-sm text-ink/60">{t("tagline")}</p>
        </div>
        <div className="panel">
          <div className="panel-body">{children}</div>
        </div>
      </div>
    </main>
  );
}
