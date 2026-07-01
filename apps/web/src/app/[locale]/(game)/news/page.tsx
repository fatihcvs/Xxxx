import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { getCharacterForUser } from "@/lib/character";

const CATEGORY_ICON: Record<string, string> = {
  ELECTION: "🗳",
  CHARTS: "📈",
  CONCERT: "🎤",
  OBITUARY: "🕯",
  PRESS_RELEASE: "📰",
  AWARDS: "🏆",
};

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const character = await getCharacterForUser(session.user.id);
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("news");
  // The paper covers the character's city plus the world desk (cityId null).
  const articles = await prisma.newsArticle.findMany({
    where: { OR: [{ cityId: null }, { cityId: character.currentCityId }] },
    include: { city: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="panel">
      <div className="panel-header">{t("title")}</div>
      <div className="panel-body">
        {articles.length === 0 ? (
          <p className="text-sm text-ink/60">{t("empty")}</p>
        ) : (
          <ul>
            {articles.map((a) => (
              <li key={a.id} className="border-t border-black/5 py-2 first:border-t-0">
                <div className="flex items-baseline gap-2">
                  <span aria-hidden>{CATEGORY_ICON[a.category] ?? "•"}</span>
                  <span className="font-display text-[15px] font-semibold">{a.headline}</span>
                </div>
                <p className="mt-0.5 text-sm text-ink/80">{a.body}</p>
                <div className="mt-0.5 text-[11px] text-ink/50">
                  {a.city ? a.city.name : t("worldDesk")} ·{" "}
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(a.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
