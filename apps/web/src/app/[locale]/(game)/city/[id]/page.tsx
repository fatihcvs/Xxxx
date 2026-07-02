import { setRequestLocale } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import { CityView } from "@/components/CityView";

/** View any city's page (read-only unless it is the character's own city). */
export default async function CityByIdPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const me = await prisma.character.findFirst({
    where: { userId: session.user.id, isAlive: true },
    select: { id: true, currentCityId: true },
  });
  if (!me) redirect(`/${locale}/create`);

  const exists = await prisma.city.count({ where: { id } });
  if (!exists) notFound();

  return (
    <CityView cityId={id} viewerId={me.id} viewerCityId={me.currentCityId} locale={locale} />
  );
}
