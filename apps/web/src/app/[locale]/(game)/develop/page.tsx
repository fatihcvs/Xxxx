import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import {
  ATTRIBUTES,
  attributePercent,
  adjectiveIndex,
  DP_ATTRIBUTE_COST,
  DP_SKILL_COST,
  PREREQ_MIN_LEVEL,
} from "@fameworld/game-engine";
import { spendDpOnAttributeAction, spendDpOnSkillAction } from "@/app/actions/game";

/** Develop your character: spend weekly development points on training. */
export default async function DevelopPage({
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
    include: { attributes: true, skills: { include: { skill: true } } },
  });
  if (!me) redirect(`/${locale}/create`);

  const [t, tAttr, tAdj, allSkills] = await Promise.all([
    getTranslations("develop"),
    getTranslations("attrNames"),
    getTranslations("adjectives"),
    prisma.skill.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);

  const myLevel = new Map(me.skills.map((s) => [s.skillId, s.level]));
  // Skills the character can still raise (respecting prerequisite gates).
  const raisable = allSkills.filter((s) => {
    const lvl = myLevel.get(s.id) ?? 0;
    if (lvl >= s.maxLevel) return false;
    if (s.prereqSkillId && (myLevel.get(s.prereqSkillId) ?? 0) < PREREQ_MIN_LEVEL) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
          <p className="font-bold">{t("balance", { dp: me.dp })}</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("attrTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("attrFlavor", { cost: DP_ATTRIBUTE_COST })}</p>
          <table className="data">
            <thead>
              <tr>
                <th>{t("colAttribute")}</th>
                <th>{t("colLevel")}</th>
                <th className="w-28"></th>
              </tr>
            </thead>
            <tbody>
              {ATTRIBUTES.map((attr) => {
                const row = me.attributes.find((a) => a.attribute === attr);
                const pct = attributePercent(row?.level ?? 0);
                return (
                  <tr key={attr}>
                    <td>{tAttr(attr)}</td>
                    <td>
                      <span className="lvl">
                        {pct}
                        <span className="adj">{tAdj(`a${adjectiveIndex(pct)}`)}</span>
                      </span>
                    </td>
                    <td>
                      <form action={spendDpOnAttributeAction}>
                        <input type="hidden" name="attribute" value={attr} />
                        <input type="hidden" name="locale" value={locale} />
                        <button className="btn" disabled={me.dp < DP_ATTRIBUTE_COST}>
                          {t("train", { cost: DP_ATTRIBUTE_COST })}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("skillTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("skillFlavor", { cost: DP_SKILL_COST })}</p>
          <form action={spendDpOnSkillAction} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] text-[#666666]">
                {t("pickSkill")}
              </label>
              <select name="skillId" className="field" required>
                {raisable.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({"★".repeat(myLevel.get(s.id) ?? 0)})
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" name="locale" value={locale} />
            <button className="btn" disabled={me.dp < DP_SKILL_COST}>
              {t("raise", { cost: DP_SKILL_COST })}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
