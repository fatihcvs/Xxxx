import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma, PropertyKind } from "@fameworld/db";
import { buyPropertyAction, foundBusinessAction } from "@/app/actions/game";

const BUSINESS_TYPES = [
  { type: "Cafe", price: 2000 },
  { type: "Studio", price: 5000 },
  { type: "Club", price: 10000 },
];

export default async function EstatePage({
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
      properties: true,
      businesses: true,
    },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("estate");

  return (
    <div className="space-y-4">
      {/* Real estate */}
      <div className="panel">
        <div className="panel-header">{t("realEstate")}</div>
        <div className="panel-body space-y-3">
          <div className="flex flex-wrap gap-2">
            <form action={buyPropertyAction}>
              <input type="hidden" name="kind" value={PropertyKind.HOME} />
              <input type="hidden" name="locale" value={locale} />
              <button className="btn-ghost" disabled={me.money < 5000}>
                {t("buyHome")} (§5000)
              </button>
            </form>
            <form action={buyPropertyAction}>
              <input type="hidden" name="kind" value={PropertyKind.RENTAL} />
              <input type="hidden" name="locale" value={locale} />
              <button className="btn-ghost" disabled={me.money < 8000}>
                {t("buyRental")} (§8000)
              </button>
            </form>
          </div>
          {me.properties.length > 0 && (
            <ul className="divide-y divide-black/5 text-sm">
              {me.properties.map((p) => (
                <li key={p.id} className="flex justify-between py-1.5">
                  <span>
                    {p.name} <span className="text-[11px] text-ink/40">{p.kind.toLowerCase()}</span>
                  </span>
                  <span className="text-ink/60">
                    {p.weeklyIncome > 0 ? `+§${p.weeklyIncome}${t("perWeek")}` : t("ownedHome")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Business */}
      <div className="panel">
        <div className="panel-header">{t("business")}</div>
        <div className="panel-body space-y-3">
          <form action={foundBusinessAction} className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-xs mb-1 text-ink/70">{t("bizName")}</label>
              <input name="name" required maxLength={60} className="field" />
            </div>
            <div>
              <label className="block text-xs mb-1 text-ink/70">{t("bizType")}</label>
              <select name="type" className="field" defaultValue="Cafe">
                {BUSINESS_TYPES.map((b) => (
                  <option key={b.type} value={b.type}>
                    {b.type} (§{b.price})
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" name="locale" value={locale} />
            <button className="btn-ghost">{t("found")}</button>
          </form>
          {me.businesses.length > 0 && (
            <ul className="divide-y divide-black/5 text-sm">
              {me.businesses.map((b) => (
                <li key={b.id} className="flex justify-between py-1.5">
                  <span>
                    {b.name} <span className="text-[11px] text-ink/40">{b.type}</span>
                  </span>
                  <span className="text-ink/60">
                    ~§{b.baseWeeklyProfit}
                    {t("perWeek")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
