import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { PREREQ_MIN_LEVEL } from "@fameworld/game-engine";
import { learnFromMasterAction } from "@/app/actions/game";

const MASTER_MIN_LEVEL = 3;

export default async function SkillsPage({
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
    include: { skills: true },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("skills");

  const skills = await prisma.skill.findMany({
    include: { prereq: true },
    orderBy: [{ category: "asc" }, { tier: "asc" }, { name: "asc" }],
  });
  const myLevel = new Map(me.skills.map((s) => [s.skillId, s.level]));

  // Group by category.
  const byCategory = new Map<string, typeof skills>();
  for (const s of skills) {
    const list = byCategory.get(s.category) ?? [];
    list.push(s);
    byCategory.set(s.category, list);
  }

  // Masters in the same city: other living characters ahead of me in a skill.
  const masterSkills = await prisma.characterSkill.findMany({
    where: {
      level: { gte: MASTER_MIN_LEVEL },
      character: { currentCityId: me.currentCityId, isAlive: true, id: { not: me.id } },
    },
    include: { character: true, skill: true },
    orderBy: { level: "desc" },
    take: 60,
  });
  const availableMasters = masterSkills.filter(
    (ms) => ms.level > (myLevel.get(ms.skillId) ?? 0),
  );

  return (
    <div className="space-y-4">
      {/* Master/mentor learning */}
      <div className="panel">
        <div className="panel-header">{t("mastersHere")}</div>
        <div className="panel-body">
          {availableMasters.length === 0 ? (
            <p className="text-sm text-ink/50">{t("noMasters")}</p>
          ) : (
            <ul className="divide-y divide-black/5 text-sm">
              {availableMasters.slice(0, 15).map((ms) => (
                <li key={ms.id} className="flex items-center justify-between py-2">
                  <span>
                    {ms.character.firstName} {ms.character.lastName} —{" "}
                    <span className="font-medium">{ms.skill.name}</span>{" "}
                    <span className="text-[11px] text-ink/40">Lv {ms.level}</span>
                  </span>
                  <form action={learnFromMasterAction}>
                    <input type="hidden" name="masterId" value={ms.characterId} />
                    <input type="hidden" name="skillId" value={ms.skillId} />
                    <input type="hidden" name="locale" value={locale} />
                    <button className="btn-ghost" disabled={me.hospitalizedAt !== null}>
                      {t("learn")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-ink/50">{t("masterHint")}</p>
        </div>
      </div>

      {/* Skill catalogue / tree */}
      {[...byCategory.entries()].map(([category, list]) => (
        <div key={category} className="panel">
          <div className="panel-header capitalize">{category}</div>
          <div className="panel-body">
            <ul className="space-y-1 text-sm">
              {list.map((s) => {
                const lvl = myLevel.get(s.id) ?? 0;
                const prereqLevel = s.prereqSkillId ? (myLevel.get(s.prereqSkillId) ?? 0) : 999;
                const locked = !!s.prereq && prereqLevel < PREREQ_MIN_LEVEL;
                return (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className={locked ? "text-ink/40" : ""}>
                      {s.tier > 1 && "↳ "}
                      {s.name}
                      {locked && s.prereq && (
                        <span className="ml-1 text-[11px] text-red-500">
                          🔒 {s.prereq.name} {PREREQ_MIN_LEVEL}★
                        </span>
                      )}
                    </span>
                    <span className="text-brand">
                      {lvl > 0 ? "★".repeat(Math.min(5, lvl)) : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
