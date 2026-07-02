import { setRequestLocale } from "next-intl/server";
import { SkeletonPage } from "@/components/SkeletonPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SkeletonPage id="invitations" />;
}
