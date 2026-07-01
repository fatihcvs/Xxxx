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
  recordReleaseAction,
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
          releases: { orderBy: { releasedAt: "desc" }, include: { tracks: true } },
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

      {/* Record a release */}
      {band.songs.length > 0 && (
        <div className="panel">
          <div className="panel-header">{t("recordTitle")}</div>
          <div className="panel-body">
            <p className="mb-3 text-xs text-ink/50">{t("recordHint")}</p>
            <form action={recordReleaseAction} className="space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs mb-1 text-ink/70">{t("releaseTitle")}</label>
                  <input name="title" required maxLength={80} className="field" />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-ink/70">{t("format")}</label>
                  <select name="type" className="field" defaultValue="SINGLE">
                    <option value="SINGLE">{t("single")}</option>
                    <option value="ALBUM">{t("album")}</option>
                  </select>
                </div>
              </div>
              <fieldset className="border border-black/10 rounded p-2">
                <legend className="px-1 text-xs text-ink/60">{t("pickTracks")}</legend>
                <div className="grid sm:grid-cols-2 gap-1">
                  {band.songs.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="songIds" value={s.id} />
                      <span>
                        {s.title} <span className="text-ink/40">({s.quality})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button className="btn" disabled={character.hospitalizedAt !== null}>
                {t("record")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Releases */}
      {band.releases.length > 0 && (
        <div className="panel">
          <div className="panel-header">{t("releases")}</div>
          <div className="panel-body">
            <ul className="divide-y divide-black/5 text-sm">
              {band.releases.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-medium">{r.title}</span>{" "}
                    <span className="text-[11px] text-ink/50">
                      {r.type.toLowerCase()} · {r.tracks.length} {t("tracks")}
                    </span>
                  </div>
                  <span className="text-ink/60">
                    {t("sales")} {r.totalSales.toLocaleString(locale)} · {t("score")}{" "}
                    {r.chartScore.toFixed(0)}
                    {!r.active && ` · ${t("retired")}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
