import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  redirect(session?.user?.id ? `/${locale}/home` : `/${locale}/login`);
}
