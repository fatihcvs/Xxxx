import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";

export default async function AttributesPage({
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
    include: {
      attributes: { orderBy: { attribute: "asc" } },
      skills: { include: { skill: true }, orderBy: { level: "desc" } },
    },
  });
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("nav");

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="panel">
        <div className="panel-header">{t("attributes")}</div>
        <div className="panel-body">
          <ul className="space-y-1 text-sm">
            {character.attributes.map((a) => (
              <li key={a.id} className="flex justify-between">
                <span className="capitalize">{a.attribute}</span>
                <span className="text-brand">{"★".repeat(Math.min(5, a.level))} {a.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="panel">
        <div className="panel-header">Skills</div>
        <div className="panel-body">
          {character.skills.length === 0 ? (
            <p className="text-sm text-ink/50">No skills yet. Buy a book at a shop to start learning.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {character.skills.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span>{s.skill.name}</span>
                  <span className="text-brand">Lv {s.level}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
