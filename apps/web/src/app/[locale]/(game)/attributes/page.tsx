import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { xpForNextLevel } from "@fameworld/game-engine";
import { studyBookAction } from "@/app/actions/game";

export default async function AttributesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const character = await prisma.character.findFirst({
    where: { userId: session.user.id, isAlive: true },
    include: {
      attributes: { orderBy: { attribute: "asc" } },
      skills: { include: { skill: true }, orderBy: { level: "desc" } },
      ownedBooks: { include: { book: { include: { skill: true } } } },
      learningTasks: {
        where: { state: "IN_PROGRESS" },
        orderBy: { finishesAt: "asc" },
      },
    },
  });
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("nav");
  const ts = await getTranslations("study");
  const skillLevel = new Map(character.skills.map((s) => [s.skillId, s.level]));
  const studyingSkillIds = new Set(character.learningTasks.map((l) => l.skillId));
  const skillNameById = new Map(character.skills.map((s) => [s.skillId, s.skill.name]));

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="panel">
        <div className="panel-header">{t("attributes")}</div>
        <div className="panel-body">
          <ul className="space-y-2 text-sm">
            {character.attributes.map((a) => {
              const need = xpForNextLevel(a.level);
              const pct = Math.min(100, Math.round((a.xp / need) * 100));
              return (
                <li key={a.id}>
                  <div className="flex justify-between">
                    <span className="capitalize">{a.attribute}</span>
                    <span className="text-brand">
                      {"★".repeat(Math.min(5, a.level))} {a.level}
                    </span>
                  </div>
                  <div className="meter mt-0.5">
                    <span style={{ width: `${pct}%`, backgroundColor: "#7c3aed" }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="panel">
          <div className="panel-header">Skills</div>
          <div className="panel-body">
            {character.skills.length === 0 ? (
              <p className="text-sm text-ink/50">{ts("noSkills")}</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {character.skills.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span>{s.skill.name}</span>
                    <span className="text-brand">Lv {s.level}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {character.learningTasks.length > 0 && (
          <div className="panel">
            <div className="panel-header">{ts("inProgress")}</div>
            <div className="panel-body">
              <ul className="space-y-1 text-sm">
                {character.learningTasks.map((l) => (
                  <li key={l.id} className="flex justify-between">
                    <span>
                      {skillNameById.get(l.skillId) ?? "Skill"} → Lv {l.toLevel}
                    </span>
                    <span className="text-ink/60">
                      {ts("finishes")} {l.finishesAt.toLocaleString(locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="panel">
          <div className="panel-header">{ts("myBooks")}</div>
          <div className="panel-body">
            {character.ownedBooks.length === 0 ? (
              <p className="text-sm text-ink/50">{ts("noBooks")}</p>
            ) : (
              <ul className="divide-y divide-black/5 text-sm">
                {character.ownedBooks.map((ob) => {
                  const lvl = skillLevel.get(ob.book.skillId) ?? 0;
                  const maxed = lvl >= ob.book.maxTeachLevel;
                  const busy = studyingSkillIds.has(ob.book.skillId);
                  return (
                    <li key={ob.id} className="flex items-center justify-between py-2">
                      <span>
                        {ob.book.title} · {ob.book.skill.name} (Lv {lvl}/{ob.book.maxTeachLevel})
                      </span>
                      <form action={studyBookAction}>
                        <input type="hidden" name="bookId" value={ob.bookId} />
                        <input type="hidden" name="locale" value={locale} />
                        <button className="btn-ghost" disabled={maxed || busy || character.hospitalizedAt !== null}>
                          {maxed ? ts("maxed") : ts("study")}
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
