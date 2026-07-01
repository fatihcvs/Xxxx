import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { worldClock } from "@/lib/world";
import { socializeAction, haveChildAction } from "@/app/actions/game";

export default async function RelationshipsPage({
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
      relationsFrom: { include: { to: true }, orderBy: { level: "desc" } },
    },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("relationships");

  // Other living characters currently in the same city (people you can meet).
  const cityPeople = await prisma.character.findMany({
    where: {
      currentCityId: me.currentCityId,
      isAlive: true,
      id: { not: me.id },
    },
    take: 20,
    orderBy: { updatedAt: "desc" },
  });
  const knownIds = new Set(me.relationsFrom.map((r) => r.toId));

  return (
    <div className="space-y-4">
      {/* Family */}
      <div className="panel">
        <div className="panel-header">{t("family")}</div>
        <div className="panel-body text-sm space-y-2">
          {me.parent && (
            <p>
              {t("parent")}: {me.parent.firstName} {me.parent.lastName}
            </p>
          )}
          {me.children.length === 0 ? (
            <p className="text-ink/50">{t("noChildren")}</p>
          ) : (
            <ul className="space-y-1">
              {me.children.map((ch) => (
                <li key={ch.id} className="flex justify-between">
                  <span>
                    {ch.firstName} {ch.lastName}
                  </span>
                  <span className="text-ink/50">
                    {worldClock.gameYearsBetween(ch.bornAtGame)} {t("yrs")}
                    {ch.isAlive ? "" : ` · ${t("deceased")}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <form action={haveChildAction} className="flex items-end gap-2 pt-2 border-t border-black/5">
            <div>
              <label className="block text-xs mb-1 text-ink/70">{t("childName")}</label>
              <input name="firstName" maxLength={40} required className="field" />
            </div>
            <input type="hidden" name="locale" value={locale} />
            <button className="btn-ghost">{t("haveChild")}</button>
          </form>
          <p className="text-xs text-ink/50">{t("heirNote")}</p>
        </div>
      </div>

      {/* Address book */}
      <div className="panel">
        <div className="panel-header">{t("addressBook")}</div>
        <div className="panel-body">
          {me.relationsFrom.length === 0 ? (
            <p className="text-sm text-ink/50">{t("noRelations")}</p>
          ) : (
            <ul className="divide-y divide-black/5 text-sm">
              {me.relationsFrom.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <span>
                    {r.to.firstName} {r.to.lastName}{" "}
                    <span className="text-[11px] text-ink/40">{r.type.toLowerCase()}</span>
                  </span>
                  <span className="text-brand">{t("affinity")} {r.level}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* People in the city */}
      <div className="panel">
        <div className="panel-header">{t("peopleHere", { city: "" }).trim()}</div>
        <div className="panel-body">
          {cityPeople.length === 0 ? (
            <p className="text-sm text-ink/50">{t("nobodyHere")}</p>
          ) : (
            <ul className="divide-y divide-black/5 text-sm">
              {cityPeople.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>
                    {p.firstName} {p.lastName}
                    {knownIds.has(p.id) && (
                      <span className="ml-1 text-[11px] text-green-600">{t("known")}</span>
                    )}
                  </span>
                  <form action={socializeAction}>
                    <input type="hidden" name="targetId" value={p.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <button className="btn-ghost" disabled={me.hospitalizedAt !== null}>
                      {t("socialize")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
