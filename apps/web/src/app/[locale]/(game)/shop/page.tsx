import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { goVipAction } from "@/app/actions/game";

const VIP_PRICE = 3000;

/** Shop section: VIP membership + future credit products. */
export default async function ShopPage({
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
    include: { user: { select: { vipUntil: true } } },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("shop");
  const isVip = !!me.user?.vipUntil && me.user.vipUntil.getTime() > Date.now();

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("intro")}</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("vipTitle")} ★</div>
        <div className="panel-body space-y-2">
          <p className="flavor">{t("vipPitch")}</p>
          <ul className="list-disc pl-5 text-[11px] text-[#444444]">
            <li>{t("vipPerk1")}</li>
            <li>{t("vipPerk2")}</li>
            <li>{t("vipPerk3")}</li>
          </ul>
          {isVip ? (
            <p className="font-bold text-brand">
              {t("vipActive", { date: me.user!.vipUntil!.toLocaleDateString(locale) })}
            </p>
          ) : (
            <form action={goVipAction.bind(null, locale)}>
              <button className="btn" disabled={me.money < VIP_PRICE}>
                {t("buyVip", { price: VIP_PRICE.toLocaleString(locale) })}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("creditsTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("creditsSoon")}</p>
        </div>
      </div>
    </div>
  );
}
