import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { getCharacterForUser } from "@/lib/character";
import { formatGameDate } from "@/lib/world";
import { Link } from "@/i18n/routing";

/** Character overview ("Genel Bilgiler"): info box, latest diary lines, recent places. */
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

  const [t, tDiary, diary, visits] = await Promise.all([
    getTranslations("home"),
    getTranslations("diary"),
    prisma.diaryEntry.findMany({
      where: { characterId: character.id },
      orderBy: { createdAtGame: "desc" },
      take: 6,
    }),
    prisma.localeVisit.findMany({
      where: { characterId: character.id },
      orderBy: { visitedAtGame: "desc" },
      take: 5,
    }),
  ]);
  const visitLocales = await prisma.locale.findMany({
    where: { id: { in: visits.map((v) => v.localeId) } },
    select: { id: true, name: true },
  });
  const localeName = new Map(visitLocales.map((l) => [l.id, l.name]));

  return (
    <div className="space-y-4">
      {character.hospitalized && (
        <div className="panel">
          <div className="panel-body font-bold text-alert">{t("hospitalNotice")}</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">{t("infoTitle")}</div>
        <div className="panel-body">
          <table className="data">
            <tbody>
              <tr>
                <td className="w-40 font-bold">{t("bornCity")}</td>
                <td>{character.bornCity}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("age")}</td>
                <td>{character.age}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("status")}</td>
                <td>{character.hospitalized ? t("statusHospital") : t("statusNormal")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{tDiary("latestTitle")}</div>
        <div className="panel-body">
          {diary.length === 0 ? (
            <p className="flavor">{tDiary("empty")}</p>
          ) : (
            <ul className="space-y-1">
              {diary.map((e) => (
                <li key={e.id}>
                  <span className="text-[10px] text-[#999999]">
                    {formatGameDate(e.createdAtGame)}:
                  </span>{" "}
                  {tDiary(
                    `e_${e.key}`,
                    (e.params ?? {}) as Record<string, string | number>,
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2">
            <Link href="/diary" className="text-brand hover:underline">
              {tDiary("openDiary")}
            </Link>
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("recentPlacesTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("recentPlacesFlavor")}</p>
          {visits.length === 0 ? (
            <p className="flavor">{t("recentPlacesEmpty")}</p>
          ) : (
            <ul className="space-y-0.5">
              {visits.map((v) => (
                <li key={v.id}>
                  <span className="text-[10px] text-[#999999]">
                    {formatGameDate(v.visitedAtGame)}:
                  </span>{" "}
                  <Link href={`/locale/${v.localeId}`} className="text-brand hover:underline">
                    {localeName.get(v.localeId) ?? "—"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
