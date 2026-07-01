import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";

export default async function CareerPage({
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
    include: { employment: { where: { active: true }, include: { job: { include: { locale: true } } } } },
  });
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("career");

  return (
    <div className="panel">
      <div className="panel-header">{t("title")}</div>
      <div className="panel-body">
        {character.employment.length === 0 ? (
          <p className="text-sm text-ink/50">{t("noJob")}</p>
        ) : (
          <>
            <ul className="space-y-1 text-sm">
              {character.employment.map((e) => (
                <li key={e.id} className="flex justify-between">
                  <span>
                    {e.job.title} @ {e.job.locale.name}
                  </span>
                  <span className="text-ink/60">
                    §{e.job.salary}
                    {t("perWeek")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink/50">{t("paydayNote")}</p>
          </>
        )}
      </div>
    </div>
  );
}
