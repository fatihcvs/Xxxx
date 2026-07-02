import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { ACHIEVEMENTS } from "@fameworld/game-engine";

export default async function AwardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const me = await prisma.character.findFirst({
    where: { userId: session.user.id, isAlive: true },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("awards");

  const [shows, mine] = await Promise.all([
    prisma.awardShow.findMany({
      orderBy: { gameYear: "desc" },
      take: 10,
      include: { awards: true },
    }),
    prisma.characterAchievement.findMany({
      where: { characterId: me.id },
      include: { achievement: true },
    }),
  ]);
  const earnedCodes = new Set(mine.map((m) => m.achievement.code));

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("showsTitle")}</div>
        <div className="panel-body">
          {shows.length === 0 ? (
            <p className="text-sm text-ink/50">{t("empty")}</p>
          ) : (
            <div className="space-y-3">
              {shows.map((show) => (
                <div key={show.id}>
                  <div className="text-sm font-medium">{t("show", { year: show.gameYear })}</div>
                  {show.awards.length === 0 ? (
                    <p className="text-xs text-ink/50">{t("noWinners")}</p>
                  ) : (
                    <ul className="mt-1 space-y-0.5 text-sm">
                      {show.awards.map((a) => (
                        <li key={a.id} className="flex items-center justify-between">
                          <span className="text-ink/60">{t(`cat${a.category}`)}</span>
                          <span className="font-medium">🏆 {a.recipientName}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          {t("achievementsTitle")}{" "}
          <span className="ml-1 text-xs font-normal text-ink/50">
            {t("earned", { earned: earnedCodes.size, total: ACHIEVEMENTS.length })}
          </span>
        </div>
        <div className="panel-body">
          <p className="mb-2 text-xs text-ink/60">{t("achHint")}</p>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {ACHIEVEMENTS.map((a) => {
              const earned = earnedCodes.has(a.code);
              return (
                <li
                  key={a.code}
                  className={`flex items-center gap-2 rounded border px-2 py-1.5 text-sm ${
                    earned
                      ? "border-brand/30 bg-brand/5"
                      : "border-black/5 opacity-50"
                  }`}
                >
                  <span aria-hidden>{earned ? "🏆" : "🔒"}</span>
                  <span>
                    <span className="block font-medium">{t(`ach${a.code}`)}</span>
                    <span className="block text-[11px] text-ink/50">
                      {t(`achCat_${a.category}`)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
