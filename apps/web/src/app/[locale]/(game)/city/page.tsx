import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { getCharacterForUser } from "@/lib/character";
import { Link } from "@/i18n/routing";
import { travelAction } from "@/app/actions/game";

export default async function CityPage({
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

  const t = await getTranslations("city");
  const locales = await prisma.locale.findMany({
    where: { cityId: character.currentCityId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="panel">
      <div className="panel-header">{t("title", { city: character.currentCityName })}</div>
      <div className="panel-body">
        <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-2">{t("venues")}</h2>
        <ul className="divide-y divide-black/5">
          {locales.map((l) => {
            const here = character.currentLocaleId === l.id;
            return (
              <li key={l.id} className="flex items-center justify-between py-2">
                <div>
                  <Link href={`/locale/${l.id}`} className="font-medium hover:text-brand">
                    {l.name}
                  </Link>
                  <span className="ml-2 text-xs text-ink/50">{l.type.toLowerCase()}</span>
                </div>
                {here ? (
                  <span className="text-xs text-green-600">{t("youAreHere")}</span>
                ) : (
                  <form action={travelAction}>
                    <input type="hidden" name="localeId" value={l.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <button type="submit" className="btn-ghost">
                      {t("goHere")}
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
