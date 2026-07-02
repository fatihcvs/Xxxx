import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import {
  attributePercent,
  adjectiveIndex,
  currentMeter,
} from "@fameworld/game-engine";
import { studyBookAction } from "@/app/actions/game";

/**
 * Body & Health: attribute table (value + adjective), mood/health gauges and
 * the condition panels (illnesses, addictions, surgeries, tattoos,
 * immunities — empty states until those systems land in U5).
 */
export default async function BodyHealthPage({
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
      meters: true,
      ownedBooks: { include: { book: { include: { skill: true } } } },
      skills: true,
      learningTasks: { where: { state: "IN_PROGRESS" }, orderBy: { finishesAt: "asc" } },
    },
  });
  if (!character) redirect(`/${locale}/create`);

  const [t, tAttr, tAdj, ts] = await Promise.all([
    getTranslations("bodyHealth"),
    getTranslations("attrNames"),
    getTranslations("adjectives"),
    getTranslations("study"),
  ]);

  const now = new Date();
  const meterOf = (kind: "MOOD" | "HEALTH") => {
    const row = character.meters.find((m) => m.kind === kind);
    return row ? Math.round(currentMeter(row, now)) : 0;
  };
  const mood = meterOf("MOOD");
  const health = meterOf("HEALTH");

  const skillLevel = new Map(character.skills.map((s) => [s.skillId, s.level]));
  const studying = new Set(character.learningTasks.map((l) => l.skillId));

  const emptyPanels = [
    "illnesses",
    "addictions",
    "surgeries",
    "tattoos",
    "immunities",
  ] as const;

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("attrTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("attrFlavor")}</p>
          <table className="data">
            <thead>
              <tr>
                <th>{t("colAttribute")}</th>
                <th>{t("colLevel")}</th>
              </tr>
            </thead>
            <tbody>
              {character.attributes.map((a) => {
                const pct = attributePercent(a.level);
                return (
                  <tr key={a.id}>
                    <td>{tAttr(a.attribute)}</td>
                    <td>
                      <span className="lvl">
                        {pct}
                        <span className="adj">{tAdj(`a${adjectiveIndex(pct)}`)}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(
        [
          ["moodTitle", mood, "moodFlavor"],
          ["healthTitle", health, "healthFlavor"],
        ] as const
      ).map(([titleKey, value, flavorKey]) => (
        <div className="panel" key={titleKey}>
          <div className="panel-header">{t(titleKey)}</div>
          <div className="panel-body">
            <p>
              {t("currentLevel")}:{" "}
              <span className="lvl font-bold">
                {value}
                <span className="adj">{tAdj(`a${adjectiveIndex(value)}`)}</span>
              </span>
            </p>
            <p className="flavor mt-1">{t(flavorKey)}</p>
          </div>
        </div>
      ))}

      {emptyPanels.map((key) => (
        <div className="panel" key={key}>
          <div className="panel-header">{t(`${key}Title`)}</div>
          <div className="panel-body">
            <p>{t(`${key}Empty`, { name: character.firstName })}</p>
            <p className="flavor mt-1">{t(`${key}Flavor`)}</p>
          </div>
        </div>
      ))}

      {character.learningTasks.length > 0 && (
        <div className="panel">
          <div className="panel-header">{ts("inProgress")}</div>
          <div className="panel-body">
            <ul className="space-y-1">
              {character.learningTasks.map((l) => (
                <li key={l.id}>
                  {ts("finishes")} {l.finishesAt.toLocaleString(locale)}
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
            <p className="flavor">{ts("noBooks")}</p>
          ) : (
            <table className="data">
              <tbody>
                {character.ownedBooks.map((ob) => {
                  const lvl = skillLevel.get(ob.book.skillId) ?? 0;
                  const maxed = lvl >= ob.book.maxTeachLevel;
                  const busy = studying.has(ob.book.skillId);
                  return (
                    <tr key={ob.id}>
                      <td>
                        {ob.book.title}
                        <span className="ml-1 text-[11px] text-[#777777]">
                          {ob.book.skill.name} ({lvl}/{ob.book.maxTeachLevel})
                        </span>
                      </td>
                      <td className="w-28 text-right">
                        <form action={studyBookAction}>
                          <input type="hidden" name="bookId" value={ob.bookId} />
                          <input type="hidden" name="locale" value={locale} />
                          <button
                            className="btn"
                            disabled={maxed || busy || character.hospitalizedAt !== null}
                          >
                            {maxed ? ts("maxed") : ts("study")}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
