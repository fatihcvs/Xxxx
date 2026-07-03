import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { AuthForm } from "@/components/AuthForm";

const boxHeader = {
  background: "linear-gradient(#eef1f3, #b9c0c6)",
  borderBottom: "1px solid #98a0a6",
  padding: "4px 9px",
  fontWeight: 700 as const,
};
const box = { background: "#ffffff", border: "1px solid #98a0a6", borderRadius: "5px", overflow: "hidden" as const };

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (session?.user?.id) redirect(`/${locale}/home`);

  const [t, tl] = await Promise.all([getTranslations("auth"), getTranslations("landing")]);
  const news = [
    { t: tl("n1t"), d: tl("n1d"), b: tl("n1b") },
    { t: tl("n2t"), d: tl("n2d"), b: tl("n2b") },
    { t: tl("n3t"), d: tl("n3d"), b: tl("n3b") },
  ];

  return (
    <div style={{ color: "#1e2429", fontSize: "11px" }}>
      {/* Hero band */}
      <div
        style={{
          height: "120px",
          borderRadius: "5px",
          border: "1px solid #2a2f34",
          marginBottom: "10px",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(120deg, #24507f, #4a80c4 55%, #7a4a99)",
          backgroundImage:
            "linear-gradient(rgba(20,30,50,0.15), rgba(20,30,50,0.35)), url(/hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ position: "absolute", left: "22px", top: "50%", transform: "translateY(-50%)", color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
          <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>{tl("heroTitle")}</div>
          <div style={{ fontSize: "12px", opacity: 0.92, marginTop: "3px" }}>{tl("heroSub")}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: "2px 0 8px", fontSize: "18px", fontWeight: 800 }}>{tl("welcomeH1")}</h1>
          <p style={{ margin: "0 0 8px", lineHeight: 1.6, color: "#2b3035" }}>{tl("intro1")}</p>
          <p style={{ margin: "0 0 12px", lineHeight: 1.6, color: "#2b3035" }}>{tl("intro2")}</p>

          {/* Sign up box */}
          <div style={{ ...box, marginBottom: "12px" }}>
            <div style={boxHeader}>{tl("signupH")}</div>
            <div style={{ padding: "11px" }}>
              <p style={{ margin: "0 0 9px", lineHeight: 1.55, color: "#444" }}>{tl("signupDesc")}</p>
              <Link href="/register" className="btn">{t("registerCta")}</Link>
            </div>
          </div>

          <p style={{ margin: "0 0 12px", lineHeight: 1.6, color: "#2b3035" }}>{tl("intro3")}</p>

          {/* News */}
          <div style={box}>
            <div style={boxHeader}>{tl("newsH")}</div>
            <div style={{ padding: "4px 0" }}>
              {news.map((n, i) => (
                <div key={n.t} style={{ padding: "8px 11px", background: i % 2 ? "#f6f7f8" : "#ffffff" }}>
                  <div style={{ marginBottom: "3px" }}>
                    <b>{n.t}</b> <span style={{ color: "#888", marginLeft: "5px" }}>◷ {n.d}</span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.55, color: "#444" }}>{n.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ width: "224px", flex: "none", display: "grid", gap: "10px" }}>
          {/* Login */}
          <div style={box}>
            <div style={boxHeader}>{t("login")}</div>
            <div style={{ padding: "10px" }}>
              <AuthForm mode="login" locale={locale} />
            </div>
          </div>

          {/* Stats */}
          <div style={box}>
            <div style={boxHeader}>{tl("statsH")}</div>
            <div style={{ padding: "9px", lineHeight: 1.65, color: "#333" }}>
              <p style={{ margin: "0 0 6px" }}>{tl("stat1")}</p>
              <p style={{ margin: 0 }}>{tl("stat2")}</p>
            </div>
          </div>

          {/* Language */}
          <div style={box}>
            <div style={boxHeader}>{tl("langH")}</div>
            <div style={{ padding: "9px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <Link href="/login" locale="tr" style={{ color: "#09639a", fontWeight: locale === "tr" ? 700 : 400 }}>Türkçe</Link>
                <Link href="/login" locale="en" style={{ color: "#09639a", fontWeight: locale === "en" ? 700 : 400 }}>English</Link>
              </div>
            </div>
          </div>

          {/* 18+ */}
          <div style={box}>
            <div style={boxHeader}>{tl("ageH")}</div>
            <div style={{ padding: "9px", lineHeight: 1.55, color: "#444" }}>{tl("ageDesc")}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "12px 0 2px", color: "#4a5157" }}>
        <span style={{ color: "#09639a" }}>{tl("about")}</span>
        {" | "}
        <span style={{ color: "#09639a" }}>{tl("contact")}</span>
      </div>
    </div>
  );
}
