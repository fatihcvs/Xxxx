import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { getCharacterForUser } from "@/lib/character";

export default async function AchievementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const character = await getCharacterForUser(session.user.id);
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("achievements");
  const [all, earned] = await Promise.all([
    prisma.achievement.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.characterAchievement.findMany({
      where: { characterId: character.id },
      select: { achievementId: true, earnedAt: true },
    }),
  ]);
  const earnedById = new Map(earned.map((e) => [e.achievementId, e.earnedAt]));

  return (
    <div className="panel">
      <div className="panel-header">{t("title")}</div>
      <div className="panel-body">
        <p className="mb-3 text-xs text-ink/60">
          {t("progress", { earned: earned.length, total: all.length })}
        </p>
        <table className="classic w-full text-sm">
          <tbody>
            {all.map((a) => {
              const at = earnedById.get(a.id);
              return (
                <tr key={a.id} className={at ? "" : "opacity-50"}>
                  <td className="w-8 py-1.5 text-center">{at ? "🏆" : "🔒"}</td>
                  <td className="py-1.5 pr-2">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-ink/60">{a.description}</div>
                  </td>
                  <td className="py-1.5 pr-2 text-xs text-ink/50">{a.category}</td>
                  <td className="py-1.5 text-right text-xs tabular-nums text-ink/60">
                    {at
                      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(at)
                      : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
