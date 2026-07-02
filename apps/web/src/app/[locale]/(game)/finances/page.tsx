import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { BANK_WEEKLY_INTEREST, BANK_WEEKLY_INTEREST_CAP } from "@fameworld/game-engine";
import { bankDepositAction, bankWithdrawAction } from "@/app/actions/game";

/** Economy page: pocket cash, bills, bank account and recent transactions. */
export default async function EconomyPage({
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
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 20 },
      bankAccount: true,
      rentContracts: { where: { active: true }, include: { locale: true } },
    },
  });
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("economy");
  const account = character.bankAccount;
  const overdueRent = character.rentContracts.some((rc) => rc.missedWeeks > 0);

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
          <p>
            {t.rich("cashLine", {
              name: character.firstName,
              amount: () => (
                <b>{character.money.toLocaleString(locale)} M$</b>
              ),
            })}
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("billsTitle")}</div>
        <div className="panel-body">
          <p className="flavor">{t("billsFlavor")}</p>
          {character.rentContracts.length === 0 ? (
            <p>{t("noBills")}</p>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>{t("colBill")}</th>
                  <th>{t("colAmount")}</th>
                  <th>{t("colState")}</th>
                </tr>
              </thead>
              <tbody>
                {character.rentContracts.map((rc) => (
                  <tr key={rc.id}>
                    <td>
                      {t("rentAt", { name: rc.locale.name })}
                    </td>
                    <td>{rc.weeklyRent.toLocaleString(locale)} M$ {t("perWeek")}</td>
                    <td className={rc.missedWeeks > 0 ? "font-bold text-alert" : ""}>
                      {rc.missedWeeks > 0
                        ? t("missed", { weeks: rc.missedWeeks })
                        : t("paid")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!overdueRent && character.rentContracts.length > 0 && (
            <p className="flavor">{t("allPaid")}</p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("bankTitle")}</div>
        <div className="panel-body space-y-2">
          <p className="flavor">
            {t("bankFlavor", {
              rate: Math.round(BANK_WEEKLY_INTEREST * 100),
              cap: BANK_WEEKLY_INTEREST_CAP.toLocaleString(locale),
            })}
          </p>
          {account ? (
            <p>
              {t("balance")}: <b>{account.balance.toLocaleString(locale)} M$</b>
            </p>
          ) : (
            <p>{t("noAccount")}</p>
          )}
          <div className="flex flex-wrap gap-4">
            <form action={bankDepositAction} className="flex items-end gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-[#666666]">
                  {t("depositLabel")}
                </label>
                <input name="amount" type="number" min={1} className="field w-28" required />
              </div>
              <input type="hidden" name="locale" value={locale} />
              <button className="btn">{t("deposit")}</button>
            </form>
            {account && account.balance > 0 && (
              <form action={bankWithdrawAction} className="flex items-end gap-2">
                <div>
                  <label className="mb-1 block text-[10px] text-[#666666]">
                    {t("withdrawLabel")}
                  </label>
                  <input name="amount" type="number" min={1} className="field w-28" required />
                </div>
                <input type="hidden" name="locale" value={locale} />
                <button className="btn">{t("withdraw")}</button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("txTitle")}</div>
        <div className="panel-body">
          {character.transactions.length === 0 ? (
            <p className="flavor">{t("noTx")}</p>
          ) : (
            <table className="data">
              <tbody>
                {character.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.memo ?? tx.type}</td>
                    <td
                      className={`w-28 text-right font-bold ${
                        tx.amount < 0 ? "text-alert" : "text-brand"
                      }`}
                    >
                      {tx.amount < 0 ? "" : "+"}
                      {tx.amount.toLocaleString(locale)} M$
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
