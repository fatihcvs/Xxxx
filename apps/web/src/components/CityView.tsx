import { getTranslations } from "next-intl/server";
import { prisma, LocaleType, NewsKind } from "@fameworld/db";
import {
  holidayKeyForDate,
  gameWeekIndex,
  LOTTERY_TICKET_PRICE,
} from "@fameworld/game-engine";
import { worldClock, formatGameDate, gameClockParts } from "@/lib/world";
import { Link } from "@/i18n/routing";
import { buyLotteryTicketAction, setMayorNoteAction } from "@/app/actions/game";

const MS_PER_DAY = 24 * 3_600_000;

/** The "City 101" directory: one key place of each civic type, linked. */
const CITY_101_TYPES: LocaleType[] = [
  LocaleType.AIRPORT,
  LocaleType.HOSPITAL,
  LocaleType.CITY_HALL,
  LocaleType.COURTHOUSE,
  LocaleType.HIGHWAY,
  LocaleType.LOST_AND_FOUND,
  LocaleType.TEMPLE,
  LocaleType.GYM,
  LocaleType.HOTEL,
  LocaleType.BANK,
];

export async function CityView({
  cityId,
  viewerId,
  viewerCityId,
  locale,
}: {
  cityId: string;
  viewerId: string;
  viewerCityId: string;
  locale: string;
}) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: { country: true, mayor: true },
  });
  if (!city) return null;

  const nowGame = worldClock.toGameTime();
  const week = gameWeekIndex(nowGame);
  const isHome = cityId === viewerCityId;

  const [t, tClock, population, keyPlaces, articles, draw, myTicket, recentConcerts, allCities, isMayor] =
    await Promise.all([
      getTranslations("city"),
      getTranslations("clock"),
      prisma.character.count({ where: { currentCityId: cityId, isAlive: true } }),
      prisma.locale.findMany({
        where: { cityId, type: { in: CITY_101_TYPES } },
        orderBy: { name: "asc" },
      }),
      prisma.newsArticle.findMany({
        where: { cityId, kind: { in: [NewsKind.INTERVIEW, NewsKind.GOSSIP, NewsKind.AWARD] } },
        orderBy: { publishedAtGame: "desc" },
        take: 3,
      }),
      prisma.lottery.findUnique({
        where: { cityId_weekIndex: { cityId, weekIndex: week } },
      }),
      prisma.lotteryTicket.findUnique({
        where: {
          characterId_cityId_weekIndex: { characterId: viewerId, cityId, weekIndex: week },
        },
      }),
      prisma.concert.findMany({
        where: { played: true, locale: { cityId } },
        orderBy: { scheduledAt: "desc" },
        take: 5,
        include: { band: true, locale: true },
      }),
      prisma.city.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.city
        .findUnique({ where: { id: cityId }, select: { mayorId: true } })
        .then((c) => c?.mayorId === viewerId),
    ]);

  const typeOf = new Map<LocaleType, { id: string; name: string }>();
  for (const p of keyPlaces) if (!typeOf.has(p.type)) typeOf.set(p.type, p);

  // Upcoming seven in-game days.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(nowGame.getTime() + i * MS_PER_DAY);
    return {
      dayNo: Math.floor(d.getTime() / MS_PER_DAY),
      date: formatGameDate(d),
      weekday: tClock(`d${gameClockParts(d).day}`),
      holiday: holidayKeyForDate(d),
    };
  });

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("welcome", { city: city.name })}</div>
        <div className="panel-body">
          <p>
            {t("population", {
              city: city.name,
              country: city.country.name,
              count: population.toLocaleString(locale),
            })}
          </p>
          <p className="flavor mt-1">{t("welcomeFlavor")}</p>
          {!isHome && (
            <p className="mt-1 text-[11px] text-alert">{t("visitingNote")}</p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("city101", { city: city.name })}</div>
        <div className="panel-body">
          <table className="data">
            <tbody>
              {CITY_101_TYPES.map((type) => {
                const p = typeOf.get(type);
                if (!p) return null;
                return (
                  <tr key={type}>
                    <td className="w-44 font-bold">{t(`t_${type}`)}:</td>
                    <td>
                      <Link href={`/locale/${p.id}`} className="text-brand hover:underline">
                        {p.name}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p>
            <Link href="/venues" className="text-brand hover:underline">
              {t("findOther")}
            </Link>
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("upcomingDays", { city: city.name })}</div>
        <div className="panel-body">
          <table className="data">
            <thead>
              <tr>
                <th>{t("colDay")}</th>
                <th>{t("colDate")}</th>
                <th>{t("colWeekday")}</th>
                <th>{t("colHoliday")}</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.dayNo}>
                  <td>{d.dayNo}</td>
                  <td>{d.date}</td>
                  <td>{d.weekday}</td>
                  <td>{d.holiday ? <b>{t(`h_${d.holiday}`)}</b> : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("mayorSays")}</div>
        <div className="panel-body">
          {city.mayor ? (
            <>
              <p className="flavor">
                {t("mayorIs", { name: `${city.mayor.firstName} ${city.mayor.lastName}` })}
              </p>
              <p>{city.mayorNote ?? t("mayorSilent")}</p>
            </>
          ) : (
            <p>{t("noMayor")}</p>
          )}
          {isMayor && (
            <form action={setMayorNoteAction} className="mt-2 space-y-1">
              <textarea
                name="note"
                rows={3}
                maxLength={600}
                defaultValue={city.mayorNote ?? ""}
                className="field"
              />
              <input type="hidden" name="locale" value={locale} />
              <button className="btn">{t("saveNote")}</button>
            </form>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("articles", { city: city.name })}</div>
        <div className="panel-body">
          {articles.length === 0 ? (
            <p className="flavor">{t("noArticles")}</p>
          ) : (
            <ul className="space-y-1">
              {articles.map((a) => (
                <li key={a.id}>
                  <span className="text-[10px] text-[#999999]">
                    {formatGameDate(a.publishedAtGame)}:
                  </span>{" "}
                  {a.headline}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("lotteryTitle", { city: city.name })}</div>
        <div className="panel-body">
          <p className="flavor">{t("lotteryFlavor", { price: LOTTERY_TICKET_PRICE })}</p>
          {draw && (
            <p>
              {t("lotteryWeek", { week })}: <b>{draw.numbers.split(",").join(", ")}</b>
            </p>
          )}
          {isHome &&
            (myTicket ? (
              <p>
                {t("yourTicket")}: <b>{myTicket.numbers.split(",").join(", ")}</b>
              </p>
            ) : (
              <form action={buyLotteryTicketAction.bind(null, locale)} className="mt-1">
                <button className="btn">
                  {t("buyTicket", { price: LOTTERY_TICKET_PRICE })}
                </button>
              </form>
            ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("recentConcerts", { city: city.name })}</div>
        <div className="panel-body">
          {recentConcerts.length === 0 ? (
            <p className="flavor">{t("noConcerts")}</p>
          ) : (
            <ul className="space-y-1">
              {recentConcerts.map((cc) => (
                <li key={cc.id}>
                  {t("concertLine", {
                    band: cc.band.name,
                    venue: cc.locale.name,
                    tickets: cc.attendance ?? 0,
                  })}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("pickCity")}</div>
        <div className="panel-body">
          <p className="flavor">{t("pickCityFlavor")}</p>
          <ul className="columns-2 md:columns-3">
            {allCities.map((cc) => (
              <li key={cc.id}>
                {cc.id === cityId ? (
                  <b>{cc.name}</b>
                ) : (
                  <Link href={`/city/${cc.id}`} className="text-brand hover:underline">
                    {cc.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
