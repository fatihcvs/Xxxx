import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { CharacterCreateForm } from "@/components/CharacterCreateForm";

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
  const cityRecords = await prisma.city.findMany({
    include: { country: true },
    orderBy: { name: "asc" },
  });
  const cities = cityRecords.map((c) => ({ id: c.id, label: `${c.name}, ${c.country.name}` }));

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="panel">
          <div className="panel-header">{t("title")}</div>
          <div className="panel-body">
            <p className="text-sm text-ink/60 mb-4">{t("intro")}</p>
            <CharacterCreateForm locale={locale} cities={cities} />
          </div>
        </div>
      </div>
    </main>
  );
}
