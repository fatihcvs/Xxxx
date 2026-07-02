import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { formatGameDate } from "@/lib/world";
import { setBioAction } from "@/app/actions/game";

/** Background & other information: facts table + self-written biography. */
export default async function BioPage({
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
    include: { cityBorn: true, currentCity: true },
  });
  if (!me) redirect(`/${locale}/create`);

  const [t, tG] = await Promise.all([
    getTranslations("bio"),
    getTranslations("create"),
  ]);

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
          <table className="data">
            <tbody>
              <tr>
                <td className="w-40 font-bold">{t("fullName")}</td>
                <td>
                  {me.firstName} {me.lastName}
                </td>
              </tr>
              <tr>
                <td className="font-bold">{t("gender")}</td>
                <td>{tG(me.gender.toLowerCase() as "male" | "female" | "other")}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("bornOn")}</td>
                <td>{formatGameDate(me.bornAtGame)}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("bornIn")}</td>
                <td>{me.cityBorn.name}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("livesIn")}</td>
                <td>{me.currentCity.name}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("bioTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("bioFlavor")}</p>
          <form action={setBioAction} className="space-y-2">
            <textarea
              name="bio"
              rows={6}
              maxLength={2000}
              defaultValue={me.bio ?? ""}
              className="field"
              placeholder={t("bioPlaceholder")}
            />
            <input type="hidden" name="locale" value={locale} />
            <button className="btn">{t("save")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
