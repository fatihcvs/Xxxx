import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { runForMayorAction, voteAction, setTaxRateAction } from "@/app/actions/game";

export default async function PoliticsPage({
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

  const t = await getTranslations("politics");

  const city = await prisma.city.findUnique({
    where: { id: me.currentCityId },
    include: { mayor: true },
  });
  const election = await prisma.election.findFirst({
    where: { cityId: me.currentCityId, resolved: false },
    orderBy: { closesAtGame: "desc" },
    include: { candidacies: { include: { character: true }, orderBy: { votes: "desc" } } },
  });

  const iAmCandidate = election?.candidacies.some((c) => c.characterId === me.id) ?? false;
  const myVote = election
    ? await prisma.vote.findUnique({
        where: { electionId_voterId: { electionId: election.id, voterId: me.id } },
      })
    : null;
  const iAmMayor = city?.mayorId === me.id;

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("cityHall", { city: city?.name ?? "" })}</div>
        <div className="panel-body text-sm space-y-1">
          <p>
            {t("mayor")}:{" "}
            <span className="font-medium">
              {city?.mayor ? `${city.mayor.firstName} ${city.mayor.lastName}` : t("vacant")}
            </span>
          </p>
          <p>
            {t("taxRate")}: {Math.round((city?.taxRate ?? 0) * 100)}%
          </p>
        </div>
      </div>

      {iAmMayor && (
        <div className="panel">
          <div className="panel-header">{t("mayorPanel")}</div>
          <div className="panel-body">
            <form action={setTaxRateAction} className="flex items-end gap-2">
              <div>
                <label className="block text-xs mb-1 text-ink/70">{t("setTax")}</label>
                <input
                  name="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.25"
                  defaultValue={city?.taxRate ?? 0}
                  className="field"
                />
              </div>
              <input type="hidden" name="locale" value={locale} />
              <button className="btn-ghost">{t("apply")}</button>
            </form>
            <p className="mt-1 text-xs text-ink/50">{t("taxHint")}</p>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">{t("election")}</div>
        <div className="panel-body">
          {!election ? (
            <p className="text-sm text-ink/50">{t("noElection")}</p>
          ) : (
            <>
              {election.candidacies.length === 0 ? (
                <p className="text-sm text-ink/50">{t("noCandidates")}</p>
              ) : (
                <ul className="divide-y divide-black/5 text-sm">
                  {election.candidacies.map((cand) => (
                    <li key={cand.id} className="flex items-center justify-between py-2">
                      <span>
                        {cand.character.firstName} {cand.character.lastName}{" "}
                        <span className="text-[11px] text-ink/40">
                          {cand.votes} {t("votes")}
                        </span>
                      </span>
                      <form action={voteAction}>
                        <input type="hidden" name="candidacyId" value={cand.id} />
                        <input type="hidden" name="locale" value={locale} />
                        <button className="btn-ghost" disabled={!!myVote}>
                          {myVote ? t("voted") : t("vote")}
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
              {!iAmCandidate && (
                <form action={runForMayorAction.bind(null, locale)} className="mt-3">
                  <button className="btn">{t("runForMayor")}</button>
                </form>
              )}
              {iAmCandidate && <p className="mt-3 text-xs text-green-600">{t("youAreCandidate")}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
