import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma, LocaleType } from "@fameworld/db";
import { adjectiveIndex } from "@fameworld/game-engine";
import { getCharacterForUser } from "@/lib/character";
import { Link } from "@/i18n/routing";
import {
  restAction,
  eatAction,
  applyJobAction,
  buyBookAction,
  enrollCourseAction,
  rentApartmentAction,
  flyToCityAction,
  workOutAction,
  prayAction,
  hotelRestAction,
} from "@/app/actions/game";

/** Place page: basic-information box, management note and per-type actions. */
export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const character = await getCharacterForUser(session.user.id);
  if (!character) redirect(`/${locale}/create`);

  const [t, tCity, tAdj] = await Promise.all([
    getTranslations("locale"),
    getTranslations("city"),
    getTranslations("adjectives"),
  ]);
  const venue = await prisma.locale.findUnique({
    where: { id },
    include: { jobs: true, city: true, district: true },
  });
  if (!venue) notFound();

  const sameCity = venue.cityId === character.currentCityId;
  const here = character.currentLocaleId === venue.id;

  const books =
    venue.type === LocaleType.SHOP
      ? await prisma.book.findMany({ include: { skill: true }, orderBy: { title: "asc" } })
      : [];
  const ownedBookIds =
    books.length > 0
      ? new Set(
          (
            await prisma.ownedBook.findMany({
              where: { characterId: character.id },
              select: { bookId: true },
            })
          ).map((o) => o.bookId),
        )
      : new Set<string>();
  const courses =
    venue.type === LocaleType.UNIVERSITY
      ? await prisma.course.findMany({ where: { localeId: venue.id }, orderBy: { title: "asc" } })
      : [];
  const activeRent =
    venue.type === LocaleType.APARTMENT
      ? await prisma.rentContract.findFirst({ where: { characterId: character.id, active: true } })
      : null;
  const otherCities =
    venue.type === LocaleType.AIRPORT
      ? await prisma.city.findMany({
          where: { id: { not: venue.cityId } },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : [];

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">
          {venue.name}
          <span className="idbadge">#{venue.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="panel-body">
          <p className="flavor">{t(`d_${venue.type}`)}</p>
          {!sameCity && (
            <p className="text-[11px] text-alert">{t("otherCityNote", { city: venue.city.name })}</p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("basicsTitle")}</div>
        <div className="panel-body">
          <table className="data">
            <tbody>
              <tr>
                <td className="w-40 font-bold">{t("bType")}:</td>
                <td>{tCity(`t_${venue.type}`)}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("bCity")}:</td>
                <td>
                  <Link href={`/city/${venue.cityId}`} className="text-brand hover:underline">
                    {venue.city.name}
                  </Link>
                </td>
              </tr>
              <tr>
                <td className="font-bold">{t("bDistrict")}:</td>
                <td>{venue.district?.name ?? "—"}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("bAdmin")}:</td>
                <td>{t("cityAdmin", { city: venue.city.name })}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("bQuality")}:</td>
                <td>
                  <span className="lvl">
                    {venue.quality}
                    <span className="adj">{tAdj(`a${adjectiveIndex(venue.quality)}`)}</span>
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-bold">{t("bCash")}:</td>
                <td>{venue.cash.toLocaleString(locale)} M$</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("managerNote")}</div>
        <div className="panel-body">
          <p>{venue.managerNote ?? t("defaultManagerNote")}</p>
        </div>
      </div>

      {here && !character.hospitalized && (
        <div className="panel">
          <div className="panel-header">{t("actions")}</div>
          <div className="panel-body">
            <div className="flex flex-wrap gap-2">
              <form action={restAction.bind(null, locale)}>
                <button className="btn">{t("rest")}</button>
              </form>
              {(venue.type === LocaleType.RESTAURANT || venue.type === LocaleType.BAR) && (
                <form action={eatAction.bind(null, locale)}>
                  <button className="btn">{t("eat")} (20 M$)</button>
                </form>
              )}
              {venue.type === LocaleType.GYM && (
                <form action={workOutAction.bind(null, locale)}>
                  <button className="btn">{t("workOut")}</button>
                </form>
              )}
              {venue.type === LocaleType.TEMPLE && (
                <form action={prayAction.bind(null, locale)}>
                  <button className="btn">{t("pray")}</button>
                </form>
              )}
              {venue.type === LocaleType.HOTEL && (
                <form action={hotelRestAction.bind(null, locale)}>
                  <button className="btn" disabled={character.money < 80}>
                    {t("hotelNight")} (80 M$)
                  </button>
                </form>
              )}
              {venue.type === LocaleType.BANK && (
                <Link href="/finances" className="btn">
                  {t("bankDesk")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {here && venue.type === LocaleType.AIRPORT && otherCities.length > 0 && (
        <div className="panel">
          <div className="panel-header">{t("flightsTitle")}</div>
          <div className="panel-body">
            <p className="flavor">{t("flightsFlavor", { cost: 400 })}</p>
            <form action={flyToCityAction} className="flex items-end gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-[#666666]">{t("flyTo")}</label>
                <select name="cityId" className="field w-56" required>
                  {otherCities.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.name}
                    </option>
                  ))}
                </select>
              </div>
              <input type="hidden" name="locale" value={locale} />
              <button className="btn" disabled={character.money < 400}>
                {t("fly")} (400 M$)
              </button>
            </form>
          </div>
        </div>
      )}

      {venue.jobs.length > 0 && (
        <div className="panel">
          <div className="panel-header">{t("jobsHere")}</div>
          <div className="panel-body">
            <table className="data">
              <tbody>
                {venue.jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      {job.title}
                      <span className="ml-1 text-[11px] text-[#777777]">
                        {job.salary} M$ {t("perWeek")}
                      </span>
                    </td>
                    <td className="w-28 text-right">
                      <form action={applyJobAction}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <input type="hidden" name="locale" value={locale} />
                        <button className="btn" disabled={!here}>
                          {t("apply")}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {books.length > 0 && (
        <div className="panel">
          <div className="panel-header">{t("booksHere")}</div>
          <div className="panel-body">
            <table className="data">
              <tbody>
                {books.map((book) => {
                  const owned = ownedBookIds.has(book.id);
                  return (
                    <tr key={book.id}>
                      <td>
                        {book.title}
                        <span className="ml-1 text-[11px] text-[#777777]">
                          {book.skill.name} · {book.price} M$
                        </span>
                      </td>
                      <td className="w-28 text-right">
                        {owned ? (
                          <span className="text-[11px] font-bold">{t("owned")}</span>
                        ) : (
                          <form action={buyBookAction}>
                            <input type="hidden" name="bookId" value={book.id} />
                            <input type="hidden" name="locale" value={locale} />
                            <button
                              className="btn"
                              disabled={!here || character.money < book.price}
                            >
                              {t("buy")}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="flavor mt-2">{t("studyHint")}</p>
          </div>
        </div>
      )}

      {courses.length > 0 && (
        <div className="panel">
          <div className="panel-header">{t("coursesHere")}</div>
          <div className="panel-body">
            <table className="data">
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      {course.title}
                      <span className="ml-1 text-[11px] text-[#777777]">{course.fee} M$</span>
                    </td>
                    <td className="w-28 text-right">
                      <form action={enrollCourseAction}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <input type="hidden" name="locale" value={locale} />
                        <button
                          className="btn"
                          disabled={!here || character.money < course.fee}
                        >
                          {t("enroll")}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {venue.type === LocaleType.APARTMENT && (
        <div className="panel">
          <div className="panel-header">{t("housing")}</div>
          <div className="panel-body">
            {activeRent ? (
              <p className="font-bold text-brand">{t("renting")}</p>
            ) : (
              <form action={rentApartmentAction} className="flex items-center justify-between">
                <span>{t("rentInfo", { rent: 150 })}</span>
                <input type="hidden" name="localeId" value={venue.id} />
                <input type="hidden" name="locale" value={locale} />
                <button className="btn" disabled={!here}>
                  {t("rent")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
