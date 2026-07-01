import type { ReactNode } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCharacterForUser } from "@/lib/character";
import { StatusBar } from "@/components/StatusBar";
import { NavMenu } from "@/components/NavMenu";

export default async function GameLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const character = await getCharacterForUser(session.user.id);
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("app");

  return (
    <div className="min-h-screen">
      {/* Wordmark band */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-5xl px-4 py-2.5 text-center">
          <span className="text-lg font-extrabold tracking-tight">{t("name")}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-4">
        <StatusBar character={character} />
        {/* Content on the left, grouped navigation sidebar on the right (classic layout). */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_210px] gap-4">
          <section className="order-2 md:order-1">{children}</section>
          <aside className="order-1 md:order-2">
            <NavMenu locale={locale} />
          </aside>
        </div>
      </div>
    </div>
  );
}
