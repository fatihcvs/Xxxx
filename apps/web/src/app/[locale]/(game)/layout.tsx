import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
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

  return (
    <div className="mx-auto max-w-5xl p-4">
      <StatusBar character={character} />
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
        <aside>
          <NavMenu locale={locale} />
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
