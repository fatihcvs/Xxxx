import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma, LocaleType, Prisma } from "@fameworld/db";
import { Link } from "@/i18n/routing";
import { travelAction } from "@/app/actions/game";

/** Places in the city: search by name/type, walk to any result. */
export default async function VenuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { locale } = await params;
  const { q, type } = await searchParams;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const me = await prisma.character.findFirst({
    where: { userId: session.user.id, isAlive: true },
    include: { currentCity: true },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("venues");
  const tCity = await getTranslations("city");

  const where: Prisma.LocaleWhereInput = { cityId: me.currentCityId };
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (type && (Object.values(LocaleType) as string[]).includes(type)) {
    where.type = type as LocaleType;
  }

  const results = await prisma.locale.findMany({
    where,
    orderBy: { name: "asc" },
    include: { district: true },
    take: 60,
  });

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title", { city: me.currentCity.name })}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
          <form method="get" className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-[#666666]">{t("name")}</label>
              <input name="q" defaultValue={q ?? ""} className="field w-48" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-[#666666]">{t("type")}</label>
              <select name="type" defaultValue={type ?? ""} className="field w-44">
                <option value="">{t("anyType")}</option>
                {Object.values(LocaleType).map((lt) => (
                  <option key={lt} value={lt}>
                    {tCity(`t_${lt}`)}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn">{t("search")}</button>
          </form>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("results")}</div>
        <div className="panel-body">
          {results.length === 0 ? (
            <p className="flavor">{t("noResults")}</p>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>{t("colPlace")}</th>
                  <th>{t("colType")}</th>
                  <th>{t("colDistrict")}</th>
                  <th className="w-28"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link href={`/locale/${l.id}`} className="text-brand hover:underline">
                        {l.name}
                      </Link>
                    </td>
                    <td>{tCity(`t_${l.type}`)}</td>
                    <td>{l.district?.name ?? "—"}</td>
                    <td className="text-right">
                      {me.currentLocaleId === l.id ? (
                        <span className="text-[11px] font-bold">{t("youAreHere")}</span>
                      ) : (
                        <form action={travelAction}>
                          <input type="hidden" name="localeId" value={l.id} />
                          <input type="hidden" name="locale" value={locale} />
                          <button className="btn">{t("walk")}</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
