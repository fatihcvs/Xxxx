import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { formatGameDate } from "@/lib/world";

/** Full diary: automatic entries of the character's notable moments. */
export default async function DiaryPage({
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

  const t = await getTranslations("diary");
  const entries = await prisma.diaryEntry.findMany({
    where: { characterId: me.id },
    orderBy: { createdAtGame: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
          {entries.length === 0 ? (
            <p className="flavor">{t("empty")}</p>
          ) : (
            <ul className="space-y-1.5">
              {entries.map((e) => (
                <li key={e.id}>
                  <span className="text-[10px] text-[#999999]">
                    {formatGameDate(e.createdAtGame)}:
                  </span>{" "}
                  {t(`e_${e.key}`, (e.params ?? {}) as Record<string, string | number>)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
