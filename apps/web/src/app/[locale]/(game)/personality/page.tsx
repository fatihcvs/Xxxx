import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { ATTITUDES } from "@/lib/characterOptions";
import { setAttitudeAction } from "@/app/actions/game";

/** Personality & behaviour: public demeanour (more behaviours arrive later). */
export default async function PersonalityPage({
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
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("personality");

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("attitudeTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("attitudeFlavor")}</p>
          <form action={setAttitudeAction} className="space-y-2">
            {ATTITUDES.map((a) => (
              <label key={a} className="block">
                <input
                  type="radio"
                  name="attitude"
                  value={a}
                  defaultChecked={(me.attitude ?? ATTITUDES[0]) === a}
                />{" "}
                <b>{t(`at_${a}`)}</b>
                <span className="ml-1 text-[11px] text-[#777777]">{t(`at_${a}_sub`)}</span>
              </label>
            ))}
            <input type="hidden" name="locale" value={locale} />
            <button className="btn">{t("save")}</button>
          </form>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("laterTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("laterFlavor")}</p>
        </div>
      </div>
    </div>
  );
}
