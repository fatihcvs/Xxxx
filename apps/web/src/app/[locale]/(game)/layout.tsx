import type { ReactNode } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCharacterForUser } from "@/lib/character";
import { formatGameDate } from "@/lib/world";
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
  const ts = await getTranslations("status");

  return (
    <div className="min-h-screen">
      {/* Dark masthead: serif wordmark left, in-game date right */}
      <div className="bg-band text-bandInk border-b border-black/40">
        <div className="mx-auto flex max-w-5xl items-baseline justify-between px-4 py-2.5">
          <span className="wordmark text-xl">{t("name")}</span>
          <span className="text-xs opacity-80">
            {ts("date")}: {formatGameDate()}
          </span>
        </div>
      </div>

      {/* Horizontal tab navigation (classic two-row menu) */}
      <NavMenu locale={locale} />

      <div className="mx-auto max-w-5xl p-4">
        <StatusBar character={character} />
        <section>{children}</section>
      </div>
    </div>
  );
}
