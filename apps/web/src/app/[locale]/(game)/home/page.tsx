import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCharacterForUser } from "@/lib/character";
import { Link } from "@/i18n/routing";

export default async function HomePage({
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

  const t = await getTranslations("home");

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("welcome", { name: character.firstName })}</div>
        <div className="panel-body space-y-2 text-sm">
          <p>{t("bornIn", { city: character.bornCity })}</p>
          <p>{t("yearsOld", { age: character.age })}</p>
          <p>
            {t("currentlyAt", {
              place: character.currentLocaleName ?? t("nowhere"),
            })}
          </p>
        </div>
      </div>

      {character.hospitalized ? (
        <div className="panel border-red-300">
          <div className="panel-body text-sm text-red-700">{t("hospitalNotice")}</div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-body">
            <Link href="/city" className="btn">
              {t("currentlyAt", { place: character.currentCityName })}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
