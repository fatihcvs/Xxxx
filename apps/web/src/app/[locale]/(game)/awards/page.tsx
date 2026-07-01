import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { getCharacterForUser } from "@/lib/character";

const CATEGORY_KEY: Record<string, string> = {
  BAND_OF_THE_YEAR: "bandOfYear",
  ALBUM_OF_THE_YEAR: "albumOfYear",
  SONG_OF_THE_YEAR: "songOfYear",
  ARTIST_OF_THE_YEAR: "artistOfYear",
};

export default async function AwardsPage({
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

  const t = await getTranslations("awards");
  const shows = await prisma.awardShow.findMany({
    include: {
      awards: { include: { band: true, character: true } },
    },
    orderBy: { gameYear: "desc" },
  });

  return (
    <div className="space-y-4">
      {shows.length === 0 && (
        <div className="panel">
          <div className="panel-header">{t("title")}</div>
          <div className="panel-body text-sm text-ink/60">{t("empty")}</div>
        </div>
      )}
      {shows.map((show) => (
        <div key={show.id} className="panel">
          <div className="panel-header">🏆 {t("showTitle", { year: show.gameYear })}</div>
          <div className="panel-body">
            <table className="classic w-full text-sm">
              <tbody>
                {show.awards.map((a) => {
                  const winner = a.band
                    ? a.band.name
                    : a.character
                      ? `${a.character.firstName} ${a.character.lastName}`
                      : "—";
                  return (
                    <tr key={a.id}>
                      <td className="py-1.5 pr-2 text-xs text-ink/60">
                        {t(CATEGORY_KEY[a.category] ?? "bandOfYear")}
                      </td>
                      <td className="py-1.5 pr-2 font-medium">{winner}</td>
                      <td className="py-1.5 text-xs text-ink/60">{a.detail ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
