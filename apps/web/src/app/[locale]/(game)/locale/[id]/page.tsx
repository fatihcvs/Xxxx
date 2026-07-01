import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma, LocaleType } from "@fameworld/db";
import { getCharacterForUser } from "@/lib/character";
import { Link } from "@/i18n/routing";
import {
  restAction,
  eatAction,
  applyJobAction,
  buyBookAction,
} from "@/app/actions/game";

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

  const t = await getTranslations("locale");
  const venue = await prisma.locale.findUnique({
    where: { id },
    include: { jobs: true },
  });
  if (!venue || venue.cityId !== character.currentCityId) notFound();

  const here = character.currentLocaleId === venue.id;
  const books =
    venue.type === LocaleType.SHOP
      ? await prisma.book.findMany({ include: { skill: true }, orderBy: { title: "asc" } })
      : [];

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header flex items-center justify-between">
          <span>{venue.name}</span>
          <span className="text-xs font-normal text-ink/50">{venue.type.toLowerCase()}</span>
        </div>
        <div className="panel-body">
          {!here && (
            <p className="text-sm text-ink/60">
              <Link href="/city" className="text-brand hover:underline">
                {t("backToCity")}
              </Link>
            </p>
          )}
          {here && !character.hospitalized && (
            <div>
              <h2 className="text-xs uppercase tracking-wide text-ink/50 mb-2">{t("actions")}</h2>
              <div className="flex flex-wrap gap-2">
                <form action={restAction.bind(null, locale)}>
                  <button className="btn-ghost">{t("rest")}</button>
                </form>
                {(venue.type === LocaleType.RESTAURANT || venue.type === LocaleType.BAR) && (
                  <form action={eatAction.bind(null, locale)}>
                    <button className="btn-ghost">{t("eat")} (§20)</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {venue.jobs.length > 0 && (
        <div className="panel">
          <div className="panel-header">{t("jobsHere")}</div>
          <div className="panel-body">
            <ul className="divide-y divide-black/5">
              {venue.jobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between py-2">
                  <span className="text-sm">
                    {job.title} · §{job.salary}/wk
                  </span>
                  <form action={applyJobAction}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <button className="btn-ghost" disabled={!here}>
                      {t("apply")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {books.length > 0 && (
        <div className="panel">
          <div className="panel-header">{t("booksHere")}</div>
          <div className="panel-body">
            <ul className="divide-y divide-black/5">
              {books.map((book) => (
                <li key={book.id} className="flex items-center justify-between py-2">
                  <span className="text-sm">
                    {book.title} · {book.skill.name} · §{book.price}
                  </span>
                  <form action={buyBookAction}>
                    <input type="hidden" name="bookId" value={book.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <button className="btn-ghost" disabled={!here || character.money < book.price}>
                      {t("buy")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
