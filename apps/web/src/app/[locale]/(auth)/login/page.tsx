import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (session?.user?.id) redirect(`/${locale}/home`);
  return <AuthForm mode="login" locale={locale} />;
}
