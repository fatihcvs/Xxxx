import type { ReactNode } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCharacterForUser } from "@/lib/character";
import { gameClockParts } from "@/lib/world";
import { readFlash } from "@/lib/flash";
import { CharacterHeader } from "@/components/CharacterHeader";
import { MainMenu } from "@/components/MainMenu";
import { ContextMenu } from "@/components/ContextMenu";

// Every game page is per-character state: never statically cache them.
export const dynamic = "force-dynamic";

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

  const [tApp, tClock, tFlash] = await Promise.all([
    getTranslations("app"),
    getTranslations("clock"),
    getTranslations("flash"),
  ]);
  const clock = gameClockParts();
  const flash = await readFlash();

  return (
    <div className="min-h-screen bg-[#dddddd]">
      <div className="mx-auto max-w-[1000px] bg-white shadow-md">
        {/* Header: wordmark + in-game clock + energy + notification bell. */}
        <header className="flex items-center justify-between border-b border-[#cccccc] px-3 py-2">
          <span className="text-[18px] font-extrabold tracking-tight text-brand">
            {tApp("name")}
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              <b>{tClock(`d${clock.day}`)}</b> {clock.time}
            </span>
            <span title={tClock("energy")}>
              ⚡ <b>{character.meters.energy}</b>
            </span>
            <span title={tClock("noNews")} className="cursor-default">
              🔔
            </span>
          </div>
        </header>

        <MainMenu />

        <div className="game-content px-3 pb-6">
          {/* Feedback line: one-shot action result, or the idle pattern. */}
          {flash ? (
            <p className="flashline">{tFlash(flash.key, flash.params)}</p>
          ) : (
            <p className="flashline empty">{tFlash("none")}</p>
          )}

          <CharacterHeader character={character} />

          {/* Wide content column + right context menu. */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
            <section className="min-w-0">{children}</section>
            <aside>
              <ContextMenu />
            </aside>
          </div>
        </div>

        <footer className="border-t border-[#cccccc] px-3 py-2 text-[10px] text-[#888888]">
          {tApp("footer")}
        </footer>
      </div>
    </div>
  );
}
