import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { createCharacterAction } from "@/app/actions/game";

export default async function CreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const existing = await prisma.character.findFirst({
    where: { userId: session.user.id, isAlive: true },
  });
  if (existing) redirect(`/${locale}/home`);

  const t = await getTranslations("create");
  const cities = await prisma.city.findMany({
    include: { country: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="panel">
          <div className="panel-header">{t("title")}</div>
          <div className="panel-body">
            <p className="text-sm text-ink/60 mb-4">{t("intro")}</p>
            <form action={createCharacterAction} className="space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-ink/70">{t("firstName")}</label>
                  <input name="firstName" required maxLength={40} className="field" />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-ink/70">{t("lastName")}</label>
                  <input name="lastName" required maxLength={40} className="field" />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 text-ink/70">{t("gender")}</label>
                <select name="gender" className="field" defaultValue="FEMALE">
                  <option value="FEMALE">{t("female")}</option>
                  <option value="MALE">{t("male")}</option>
                  <option value="OTHER">{t("other")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 text-ink/70">{t("city")}</label>
                <select name="cityId" className="field" required>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn w-full">
                {t("submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
