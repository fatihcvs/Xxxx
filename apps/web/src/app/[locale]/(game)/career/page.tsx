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

  const t = await getTranslations("nav");

  return (
    <div className="panel">
      <div className="panel-header">{t("career")}</div>
      <div className="panel-body">
        {character.employment.length === 0 ? (
          <p className="text-sm text-ink/50">
            You have no job yet. Visit a venue in the city and apply for one. Salaries are paid
            weekly on in-game Fridays.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {character.employment.map((e) => (
              <li key={e.id} className="flex justify-between">
                <span>
                  {e.job.title} @ {e.job.locale.name}
                </span>
                <span className="text-ink/60">§{e.job.salary}/wk</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
