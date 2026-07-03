import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (session?.user?.id) redirect(`/${locale}/home`);

  const t = await getTranslations("auth");

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
      <div style={{ width: "340px", maxWidth: "100%", background: "#ffffff", border: "1px solid #98a0a6", borderRadius: "5px", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(#eef1f3, #b9c0c6)", borderBottom: "1px solid #98a0a6", padding: "4px 9px", fontWeight: 700 }}>
          {t("register")}
        </div>
        <div style={{ padding: "12px" }}>
          <AuthForm mode="register" locale={locale} />
        </div>
      </div>
    </div>
  );
}
