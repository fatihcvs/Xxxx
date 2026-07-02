import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { Link } from "@/i18n/routing";

/** Inventory: everything the character carries (books today; more item types later). */
export default async function ItemsPage({
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
    include: { ownedBooks: { include: { book: { include: { skill: true } } } } },
  });
  if (!me) redirect(`/${locale}/create`);

  const t = await getTranslations("items");

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("flavor")}</p>
          {me.ownedBooks.length === 0 ? (
            <p>{t("empty", { name: me.firstName })}</p>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>{t("colItem")}</th>
                  <th>{t("colKind")}</th>
                  <th>{t("colNote")}</th>
                </tr>
              </thead>
              <tbody>
                {me.ownedBooks.map((ob) => (
                  <tr key={ob.id}>
                    <td>{ob.book.title}</td>
                    <td>{t("kindBook")}</td>
                    <td className="text-[11px] text-[#777777]">
                      {t("teaches", { skill: ob.book.skill.name })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="flavor mt-2">
            {t.rich("studyHint", {
              link: (chunks) => (
                <Link href="/attributes" className="text-brand hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">{t("loadTitle")}</div>
        <div className="panel-body">
          <p>{t("loadLine", { count: me.ownedBooks.length })}</p>
          <p className="flavor">{t("loadFlavor")}</p>
        </div>
      </div>
    </div>
  );
}
