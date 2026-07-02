import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";

/** Player (account) information behind the character. */
export default async function PlayerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      characters: {
        orderBy: { createdAt: "asc" },
        select: { id: true, firstName: true, lastName: true, isAlive: true },
      },
    },
  });
  if (!user) redirect(`/${locale}/login`);
  const alive = user.characters.find((c) => c.isAlive);
  if (!alive) redirect(`/${locale}/create`);

  const t = await getTranslations("player");
  const vip = !!user.vipUntil && user.vipUntil.getTime() > Date.now();

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
          <table className="data">
            <tbody>
              <tr>
                <td className="w-40 font-bold">{t("email")}</td>
                <td>{user.email}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("joined")}</td>
                <td>{user.createdAt.toLocaleDateString(locale)}</td>
              </tr>
              <tr>
                <td className="font-bold">{t("membership")}</td>
                <td>
                  {vip
                    ? t("vipUntil", { date: user.vipUntil!.toLocaleDateString(locale) })
                    : t("standard")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("charactersTitle")}</div>
        <div className="panel-body">
          <table className="data">
            <tbody>
              {user.characters.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.firstName} {c.lastName}
                    {!c.isAlive && <span className="ml-1 text-[10px] text-[#999999]">†</span>}
                  </td>
                  <td className="w-32">{c.isAlive ? t("alive") : t("deceased")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
