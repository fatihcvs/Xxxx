import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma, PropertyKind } from "@fameworld/db";
import { Link } from "@/i18n/routing";

/** Housing: where the character lives — owned home or active rental. */
export default async function HousingPage({
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
      rentContracts: { where: { active: true }, include: { locale: true } },
      properties: { where: { kind: PropertyKind.HOME }, include: { city: true } },
    },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("housing");
  const homeless = me.properties.length === 0 && me.rentContracts.length === 0;

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
          {homeless && (
            <p>
              {t("homeless", { name: me.firstName })}{" "}
              <Link href="/estate" className="text-brand hover:underline">
                {t("estateLink")}
              </Link>
            </p>
          )}
          {me.properties.map((p) => (
            <p key={p.id}>
              {t("owns", { name: p.name, city: p.city.name })}
            </p>
          ))}
          {me.rentContracts.map((rc) => (
            <p key={rc.id}>
              {t("rents", { name: rc.locale.name, rent: rc.weeklyRent })}
              {rc.missedWeeks > 0 && (
                <span className="ml-1 font-bold text-alert">
                  {t("behind", { weeks: rc.missedWeeks })}
                </span>
              )}
            </p>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("keysTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("keysFlavor")}</p>
        </div>
      </div>
    </div>
  );
}
