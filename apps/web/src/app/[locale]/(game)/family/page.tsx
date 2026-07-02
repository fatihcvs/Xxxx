import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { worldClock, formatGameDate } from "@/lib/world";

/** Family page: closest family — parent, siblings and children. */
export default async function FamilyPage({
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
    include: {
      parent: true,
      children: { orderBy: { bornAtGame: "asc" } },
    },
  });
  if (!me) redirect(`/${locale}/create`);

  const siblings = me.parentId
    ? await prisma.character.findMany({
        where: { parentId: me.parentId, id: { not: me.id } },
        orderBy: { bornAtGame: "asc" },
      })
    : [];

  const t = await getTranslations("family");
  const nowGame = worldClock.toGameTime();

  const Row = ({
    rel,
    c,
  }: {
    rel: string;
    c: { firstName: string; lastName: string; bornAtGame: Date; isAlive: boolean };
  }) => (
    <tr>
      <td className="w-32 font-bold">{rel}</td>
      <td>
        {c.firstName} {c.lastName}
        {!c.isAlive && <span className="ml-1 text-[10px] text-[#999999]">†</span>}
      </td>
      <td className="w-40">
        {c.isAlive
          ? t("aged", { age: worldClock.gameYearsBetween(c.bornAtGame, nowGame) })
          : t("born", { date: formatGameDate(c.bornAtGame) })}
      </td>
    </tr>
  );

  const hasFamily = me.parent || siblings.length > 0 || me.children.length > 0;

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">
          {t("title", { name: `${me.firstName} ${me.lastName}` })}
        </div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("closestTitle")}</div>
        <div className="panel-body">
          {!hasFamily ? (
            <p>{t("empty", { name: me.firstName })}</p>
          ) : (
            <table className="data">
              <tbody>
                {me.parent && <Row rel={t("parent")} c={me.parent} />}
                {siblings.map((s) => (
                  <Row key={s.id} rel={t("sibling")} c={s} />
                ))}
                {me.children.map((c) => (
                  <Row key={c.id} rel={t("child")} c={c} />
                ))}
              </tbody>
            </table>
          )}
          <p className="flavor mt-2">{t("heirNote")}</p>
        </div>
      </div>
    </div>
  );
}
