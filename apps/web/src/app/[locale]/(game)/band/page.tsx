import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function BandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const t = await getTranslations("nav");

  return (
    <div className="panel">
      <div className="panel-header">{t("band")}</div>
      <div className="panel-body text-sm text-ink/60">
        <p>
          Forming bands, composing songs, rehearsing and playing concerts arrives in the music
          career phase. The engine formulas (song quality, concert outcome) are already in place.
        </p>
      </div>
    </div>
  );
}
