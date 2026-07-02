import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma, NewsKind } from "@fameworld/db";
import {
  INTERVIEW_COOLDOWN_GAME_DAYS,
  PR_AGENT_WEEKLY_FEE,
  FAN_CLUB_FOUNDING_FEE,
} from "@fameworld/game-engine";
import { worldClock, formatGameDate } from "@/lib/world";
import {
  giveInterviewAction,
  hirePrAgentAction,
  firePrAgentAction,
  foundFanClubAction,
} from "@/app/actions/game";

const MS_PER_GAME_DAY = 24 * 3_600_000;

const KIND_STYLE: Record<NewsKind, string> = {
  INTERVIEW: "bg-brand/10 text-brand",
  GOSSIP: "bg-amber-500/10 text-amber-700",
  AWARD: "bg-emerald-500/10 text-emerald-700",
};

export default async function PressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const me = await prisma.character.findFirst({
    where: { userId: session.user.id, isAlive: true },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("press");

  const [membership, agent, articles] = await Promise.all([
    prisma.bandMembership.findFirst({
      where: { characterId: me.id },
      include: { band: { include: { fanClub: true } } },
    }),
    prisma.prAgent.findUnique({ where: { characterId: me.id } }),
    prisma.newsArticle.findMany({
      where: { OR: [{ cityId: me.currentCityId }, { cityId: null }] },
      orderBy: { publishedAtGame: "desc" },
      take: 20,
      include: { band: true, character: true },
    }),
  ]);

  const nowGame = worldClock.toGameTime();
  const canInterview =
    !me.lastInterviewGameAt ||
    nowGame.getTime() - me.lastInterviewGameAt.getTime() >=
      INTERVIEW_COOLDOWN_GAME_DAYS * MS_PER_GAME_DAY;
  const hasAgent = !!agent?.active;
  const fanClub = membership?.band.fanClub ?? null;

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("interviewTitle")}</div>
        <div className="panel-body space-y-2">
          <p className="text-xs text-ink/60">{t("interviewHint")}</p>
          {canInterview ? (
            <form action={giveInterviewAction.bind(null, locale)}>
              <button className="btn">{t("interview")}</button>
            </form>
          ) : (
            <p className="text-sm text-ink/50">{t("interviewCooldown")}</p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("prAgentTitle")}</div>
        <div className="panel-body space-y-2">
          <p className="text-xs text-ink/60">
            {t("prAgentHint", { fee: PR_AGENT_WEEKLY_FEE })}
          </p>
          {hasAgent ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">{t("prAgentActive")}</span>
              <form action={firePrAgentAction.bind(null, locale)}>
                <button className="btn-ghost">{t("fire")}</button>
              </form>
            </div>
          ) : (
            <form action={hirePrAgentAction.bind(null, locale)}>
              <button className="btn" disabled={me.money < PR_AGENT_WEEKLY_FEE}>
                {t("hire", { fee: PR_AGENT_WEEKLY_FEE })}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("fanClubTitle")}</div>
        <div className="panel-body space-y-2">
          {!membership ? (
            <p className="text-sm text-ink/50">{t("needBand")}</p>
          ) : fanClub ? (
            <p className="text-sm">
              {t("members", { count: fanClub.members.toLocaleString(locale) })}
            </p>
          ) : membership.isLeader ? (
            <>
              <p className="text-xs text-ink/60">
                {t("fanClubHint", { fee: FAN_CLUB_FOUNDING_FEE })}
              </p>
              <form action={foundFanClubAction.bind(null, locale)}>
                <button className="btn" disabled={me.money < FAN_CLUB_FOUNDING_FEE}>
                  {t("found")}
                </button>
              </form>
            </>
          ) : (
            <p className="text-sm text-ink/50">{t("leaderOnly")}</p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("newsFeed")}</div>
        <div className="panel-body">
          {articles.length === 0 ? (
            <p className="text-sm text-ink/50">{t("emptyNews")}</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {articles.map((a) => (
                <li key={a.id} className="py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${KIND_STYLE[a.kind]}`}
                    >
                      {t(`kind${a.kind}`)}
                    </span>
                    <span className="text-[11px] text-ink/40">
                      {formatGameDate(a.publishedAtGame)}
                    </span>
                  </div>
                  <p className="mt-1">{a.headline}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
