import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { FREE_TIME_FOCUSES, CAREER_FOCUSES } from "@/lib/characterOptions";
import { setFocusAction } from "@/app/actions/game";

/** Focus page: pick the free-time pastime and the career focus. */
export default async function FocusPage({
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

  const t = await getTranslations("focus");

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
          <form action={setFocusAction} className="space-y-3">
            <div>
              <div className="panel-header mb-1">{t("freeTimeTitle")}</div>
              <p className="flavor">{t("freeTimeFlavor")}</p>
              {FREE_TIME_FOCUSES.map((f) => (
                <label key={f} className="block">
                  <input
                    type="radio"
                    name="freeTime"
                    value={f}
                    defaultChecked={(me.freeTimeFocus ?? FREE_TIME_FOCUSES[0]) === f}
                  />{" "}
                  <b>{t(`ft_${f}`)}</b>
                  <span className="ml-1 text-[11px] text-[#777777]">{t(`ft_${f}_sub`)}</span>
                </label>
              ))}
            </div>
            <div>
              <div className="panel-header mb-1">{t("careerTitle")}</div>
              <p className="flavor">{t("careerFlavor")}</p>
              {CAREER_FOCUSES.map((f) => (
                <label key={f} className="block">
                  <input
                    type="radio"
                    name="career"
                    value={f}
                    defaultChecked={(me.careerFocus ?? CAREER_FOCUSES[0]) === f}
                  />{" "}
                  <b>{t(`cf_${f}`)}</b>
                  <span className="ml-1 text-[11px] text-[#777777]">{t(`cf_${f}_sub`)}</span>
                </label>
              ))}
            </div>
            <input type="hidden" name="locale" value={locale} />
            <button className="btn">{t("save")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
