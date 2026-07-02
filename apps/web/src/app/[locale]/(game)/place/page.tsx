import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";

/** "Mekân" section entry: jump to the place the character is standing in. */
export default async function PlacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const me = await prisma.character.findFirst({
    where: { userId: session.user.id, isAlive: true },
    select: { currentLocaleId: true },
  });
  if (!me) redirect(`/${locale}/create`);

  redirect(
    me.currentLocaleId ? `/${locale}/locale/${me.currentLocaleId}` : `/${locale}/city`,
  );
}
