import type { ReactNode } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCharacterForUser } from "@/lib/character";
import { gameClockParts } from "@/lib/world";
import { readFlash } from "@/lib/flash";
import { Link } from "@/i18n/routing";
import { CharacterHeader } from "@/components/CharacterHeader";
import { MainMenu } from "@/components/MainMenu";
import { ContextMenu } from "@/components/ContextMenu";
import { logoutAction } from "@/app/actions/auth";

// Every game page is per-character state: never statically cache them.
export const dynamic = "force-dynamic";

/** A small icon link used in the header icon row. */
function IconLink({ href, title, glyph, color }: { href: string; title: string; glyph: string; color?: string }) {
  return (
    <Link
      href={href}
      title={title}
      className="no-underline"
      style={{ fontSize: "13px", color: color ?? "#5a6167", textDecoration: "none" }}
    >
      {glyph}
    </Link>
  );
}

export default async function GameLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const character = await getCharacterForUser(session.user.id);
  if (!character) redirect(`/${locale}/create`);

  const [tClock, tFlash, tNav] = await Promise.all([
    getTranslations("clock"),
    getTranslations("flash"),
    getTranslations("nav"),
  ]);
  const clock = gameClockParts();
  const flash = await readFlash();
  const otherLocale = locale === "tr" ? "en" : "tr";

  return (
    <div style={{ minHeight: "100vh", padding: "14px 0 40px" }}>
      <div style={{ width: "762px", maxWidth: "100%", margin: "16px auto 0", position: "relative", paddingTop: "34px" }}>
        {/* Overhanging wordmark */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <Link
            href="/home"
            className="wordmark"
            style={{
              fontSize: "52px",
              fontWeight: 800,
              letterSpacing: "-2.5px",
              color: "#ffffff",
              textDecoration: "none",
              textShadow: "2px 3px 5px rgba(0,0,0,0.65)",
            }}
          >
            fameworld
          </Link>
        </div>

        {/* Glossy shell */}
        <div
          style={{
            background: "linear-gradient(#d8dcdf, #c3c9cd)",
            borderRadius: "10px",
            boxShadow: "0 4px 26px rgba(0,0,0,0.55)",
            marginTop: "-30px",
            padding: "10px 12px 12px",
          }}
        >
          {/* Window controls */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "3px" }}>
            <span style={winBtn}>▲</span>
            <span style={{ ...winBtn, color: "#a33" }}>✕</span>
          </div>

          {/* Icon row + game clock */}
          <div style={{ display: "flex", alignItems: "center", margin: "2px 0 8px" }}>
            <div style={{ display: "flex", gap: "7px", width: "110px" }}>
              <IconLink href="/messages" title={tNav("messages")} glyph="✉" />
              <IconLink href="/relationships" title={tNav("social")} glyph="☻" />
              <IconLink href="/city" title={tNav("city")} glyph="⌂" />
              <IconLink href="/guide" title={tNav("guide")} glyph="⌕" />
            </div>
            <div style={{ flex: 1, textAlign: "center", color: "#2d3439" }}>
              {tClock(`d${clock.day}`)} {clock.time}
            </div>
            <div style={{ display: "flex", gap: "7px", width: "110px", justifyContent: "flex-end" }}>
              <IconLink href="/guide" title={tNav("guide")} glyph="?" />
              <IconLink href="/home" title={tNav("character")} glyph="☻" />
              <Link
                href="/home"
                locale={otherLocale}
                title={otherLocale.toUpperCase()}
                style={{ fontSize: "13px", color: "#5a6167", textDecoration: "none" }}
              >
                ⊕
              </Link>
            </div>
          </div>

          <MainMenu />

          {/* Feedback line */}
          {flash ? (
            <p className="flashline">{tFlash(flash.key, flash.params)}</p>
          ) : (
            <p className="flashline empty">{tFlash("none")}</p>
          )}

          {/* Content + right context column */}
          <div className="game-content" style={{ display: "flex", gap: "12px", marginTop: "8px", alignItems: "flex-start" }}>
            <section style={{ flex: 1, minWidth: 0 }}>
              <CharacterHeader character={character} />
              {children}
            </section>
            <aside style={{ width: "218px", flex: "none" }}>
              <ContextMenu />
            </aside>
          </div>

          {/* Footer */}
          <div className="game-content" style={{ textAlign: "center", padding: "10px 0 2px", color: "#4a5157" }}>
            <Link href="/home" locale="tr" style={{ color: "#09639a", fontWeight: locale === "tr" ? 700 : 400 }}>
              Türkçe
            </Link>
            {" · "}
            <Link href="/home" locale="en" style={{ color: "#09639a", fontWeight: locale === "en" ? 700 : 400 }}>
              English
            </Link>
            {" | "}
            <Link href="/guide" style={{ color: "#09639a" }}>
              {tNav("guide")}
            </Link>
            {" | "}
            <form action={logoutAction.bind(null, locale)} style={{ display: "inline" }}>
              <button type="submit" style={{ color: "#09639a", background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit" }}>
                {tNav("logout")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const winBtn = {
  width: "17px",
  height: "13px",
  background: "linear-gradient(#f2f4f5, #c9cfd3)",
  border: "1px solid #8b9298",
  borderRadius: "3px",
  fontSize: "8px",
  lineHeight: "12px",
  textAlign: "center" as const,
  color: "#555",
};
