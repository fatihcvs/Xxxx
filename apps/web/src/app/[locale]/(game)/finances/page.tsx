import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";

export default async function FinancesPage({
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
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("nav");

  return (
    <div className="panel">
      <div className="panel-header">{t("finances")}</div>
      <div className="panel-body">
        <p className="mb-3 text-sm">
          Balance: <span className="font-semibold">§{character.money}</span>
        </p>
        {character.transactions.length === 0 ? (
          <p className="text-sm text-ink/50">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-black/5 text-sm">
            {character.transactions.map((tx) => (
              <li key={tx.id} className="flex justify-between py-1.5">
                <span className="text-ink/70">{tx.memo ?? tx.type}</span>
                <span className={tx.amount < 0 ? "text-red-600" : "text-green-600"}>
                  {tx.amount < 0 ? "" : "+"}
                  §{tx.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
