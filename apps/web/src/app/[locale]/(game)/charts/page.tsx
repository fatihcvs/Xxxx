import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";

type ChartRow = {
  id: string;
  title: string;
  type: string;
  totalSales: number;
  chartScore: number;
  band: { name: string; genre: { name: string } | null };
};

function ChartList({
  title,
  rows,
  labels,
  locale,
}: {
  title: string;
  rows: ChartRow[];
  labels: { empty: string; sales: string };
  locale: string;
}) {
  return (
    <div className="panel">
      <div className="panel-header">{title}</div>
      <div className="panel-body">
        {rows.length === 0 ? (
          <p className="text-sm text-ink/50">{labels.empty}</p>
        ) : (
          <ol className="space-y-1 text-sm">
            {rows.map((r, i) => (
              <li key={r.id} className="flex items-center justify-between">
                <span>
                  <span className="inline-block w-6 text-ink/40">{i + 1}.</span>
                  <span className="font-medium">{r.title}</span>{" "}
                  <span className="text-ink/50">— {r.band.name}</span>
                  {r.band.genre && (
                    <span className="ml-1 text-[11px] text-ink/40">{r.band.genre.name}</span>
                  )}
                </span>
                <span className="text-ink/60">
                  {labels.sales} {r.totalSales.toLocaleString(locale)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default async function ChartsPage({
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
    include: { currentCity: true },
  });
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("charts");
  const include = { band: { include: { genre: true } } } as const;

  const [global, city] = await Promise.all([
    prisma.release.findMany({
      where: { active: true },
      orderBy: { chartScore: "desc" },
      take: 20,
      include,
    }),
    prisma.release.findMany({
      where: { active: true, band: { cityId: character.currentCityId } },
      orderBy: { chartScore: "desc" },
      take: 20,
      include,
    }),
  ]);

  const labels = { empty: t("empty"), sales: t("sales") };

  return (
    <div className="space-y-4">
      <ChartList title={t("global")} rows={global} labels={labels} locale={locale} />
      <ChartList
        title={t("inCity", { city: character.currentCity.name })}
        rows={city}
        labels={labels}
        locale={locale}
      />
      <p className="text-xs text-ink/50">{t("note")}</p>
    </div>
  );
}
