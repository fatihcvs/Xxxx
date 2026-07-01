import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma, LocaleType } from "@fameworld/db";
import {
  createBandAction,
  composeSongAction,
  rehearseSongAction,
  performConcertAction,
  leaveBandAction,
} from "@/app/actions/game";

export default async function BandPage({
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
  });
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("band");

  const membership = await prisma.bandMembership.findFirst({
    where: { characterId: character.id },
    include: {
      band: {
        include: {
          genre: true,
          members: { include: { character: true } },
          songs: { orderBy: { composedAt: "desc" } },
          concerts: { orderBy: { scheduledAt: "desc" }, take: 5, include: { locale: true } },
        },
      },
    },
  });

  // --- No band yet: show the create form. ---
  if (!membership) {
    const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
    return (
      <div className="panel">
        <div className="panel-header">{t("startBand")}</div>
        <div className="panel-body">
          <p className="mb-4 text-sm text-ink/60">{t("startIntro")}</p>
          <form action={createBandAction} className="space-y-3 max-w-sm">
            <input type="hidden" name="locale" value={locale} />
            <div>
              <label className="block text-xs mb-1 text-ink/70">{t("bandName")}</label>
              <input name="name" required maxLength={60} className="field" />
            </div>
            <div>
              <label className="block text-xs mb-1 text-ink/70">{t("genre")}</label>
              <select name="genreId" required className="field">
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn">
              {t("create")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const band = membership.band;
  const venues = await prisma.locale.findMany({
    where: {
      cityId: character.currentCityId,
      type: { in: [LocaleType.CLUB, LocaleType.STADIUM] },
      capacity: { gt: 0 },
    },
    orderBy: { capacity: "asc" },
  });
  const canPlay = band.songs.length > 0 && venues.length > 0 && !character.hospitalizedAt;

  return (
    <div className="space-y-4">
      {/* Band header */}
      <div className="panel">
        <div className="panel-header flex items-center justify-between">
          <span>{band.name}</span>
          <span className="text-xs font-normal text-ink/50">{band.genre?.name}</span>
        </div>
        <div className="panel-body text-sm">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] text-ink/60">{t("fame")}</div>
              <div className="font-semibold text-brand">{band.fame.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-[11px] text-ink/60">{t("members")}</div>
              <div>
                {band.members.map((m) => `${m.character.firstName} (${m.role})`).join(", ")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repertoire */}
      <div className="panel">
        <div className="panel-header flex items-center justify-between">
          <span>{t("repertoire")}</span>
          <form action={composeSongAction.bind(null, locale)}>
            <button className="btn-ghost" disabled={character.hospitalizedAt !== null}>
              {t("compose")}
            </button>
          </form>
        </div>
        <div className="panel-body">
          {band.songs.length === 0 ? (
            <p className="text-sm text-ink/50">{t("noSongs")}</p>
          ) : (
            <ul className="divide-y divide-black/5 text-sm">
              {band.songs.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-[11px] text-ink/50">
                      {t("quality")} {s.quality} · {t("rehearsed")} {s.rehearsal}%
                    </div>
                  </div>
                  <form action={rehearseSongAction}>
                    <input type="hidden" name="songId" value={s.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <button className="btn-ghost" disabled={s.rehearsal >= 100 || character.hospitalizedAt !== null}>
                      {s.rehearsal >= 100 ? t("tight") : t("rehearse")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Play a concert */}
      <div className="panel">
        <div className="panel-header">{t("playConcert")}</div>
        <div className="panel-body">
          {!canPlay ? (
            <p className="text-sm text-ink/50">{t("cannotPlay")}</p>
          ) : (
            <form action={performConcertAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="locale" value={locale} />
              <div>
                <label className="block text-xs mb-1 text-ink/70">{t("venue")}</label>
                <select name="venueId" className="field" required>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 text-ink/70">{t("ticketPrice")}</label>
                <input
                  name="ticketPrice"
                  type="number"
                  min={0}
                  max={1000}
                  defaultValue={20}
                  className="field w-28"
                />
              </div>
              <button type="submit" className="btn">
                {t("perform")}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Recent concerts */}
      {band.concerts.length > 0 && (
        <div className="panel">
          <div className="panel-header">{t("recentConcerts")}</div>
          <div className="panel-body">
            <ul className="divide-y divide-black/5 text-sm">
              {band.concerts.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <span>{c.locale.name}</span>
                  <span className="text-ink/60">
                    {t("attendance")} {c.attendance ?? 0} · {t("review")} {c.reviewScore ?? 0} · §
                    {c.revenue ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-body">
          <form action={leaveBandAction.bind(null, locale)}>
            <button className="btn-ghost text-red-600">{t("leave")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
