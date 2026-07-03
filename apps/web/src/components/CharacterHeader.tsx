import { getTranslations } from "next-intl/server";
import { adjectiveIndex } from "@fameworld/game-engine";
import { Link } from "@/i18n/routing";
import type { CharacterView } from "@/lib/character";
import { Avatar } from "./Avatar";

/**
 * Character presentation block: a portrait panel with the identity paragraph,
 * followed by the three-column status list (quick links · meters · facts).
 * Recreates the classic layout.
 */
export async function CharacterHeader({ character }: { character: CharacterView }) {
  const [t, tAdj] = await Promise.all([
    getTranslations("charHeader"),
    getTranslations("adjectives"),
  ]);

  const moodWord = tAdj(`a${adjectiveIndex(character.meters.mood)}`);
  const healthWord = tAdj(`a${adjectiveIndex(character.meters.health)}`);
  const money = character.money.toLocaleString("tr-TR", { minimumFractionDigits: 2 });

  const meterRows = [
    { icon: "☺", color: "#5a6167", pct: character.meters.mood },
    { icon: "♥", color: "#b33", pct: character.meters.health },
    { icon: "★", color: "#c9a400", pct: Math.min(100, Math.round(character.starValue * 3)) },
  ];

  return (
    <>
      {/* Portrait panel */}
      <div className="panel">
        <div className="panel-header" style={{ display: "flex", alignItems: "center" }}>
          <span style={{ flex: 1 }}>
            {character.firstName} {character.lastName}
            <span className="idbadge">#{character.id.slice(-6).toUpperCase()}</span>
            {character.vip && <span style={{ marginLeft: 6, color: "#b58f00" }}>★ VIP</span>}
          </span>
          <span style={{ display: "flex", gap: 6, fontSize: 13 }}>
            <Link href="/career" title={t("develop")} style={iconStyle}>▤</Link>
            <Link href="/band" title="Artist" style={iconStyle}>◉</Link>
            <Link href="/band" title="Songs" style={iconStyle}>♪</Link>
          </span>
        </div>
        <div className="panel-body" style={{ display: "flex", gap: 12 }}>
          <div style={{ width: 112, height: 148, flex: "none", border: "1px solid #8b9298", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef1f3" }}>
            <Avatar firstName={character.firstName} lastName={character.lastName} size={110} />
          </div>
          <div style={{ lineHeight: 1.6, color: "#222" }}>
            <p style={{ margin: "0 0 12px" }}>
              {t("age", { name: character.firstName, age: character.age })}{" "}
              {t.rich("location", {
                name: character.firstName,
                city: () => (
                  <Link href="/city" style={{ color: "#09639a" }}>
                    {character.currentCityName}
                  </Link>
                ),
                locale: () =>
                  character.currentLocaleName ? (
                    <Link href={`/locale/${character.currentLocaleId}`} style={{ color: "#09639a" }}>
                      {character.currentLocaleName}
                    </Link>
                  ) : (
                    <>{t("outside")}</>
                  ),
              })}
            </p>
            {character.hospitalized && (
              <p style={{ margin: 0, color: "#cc2200", fontWeight: 700 }}>{t("hospitalized")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Status list */}
      <div style={{ display: "flex", gap: 10, padding: "2px 4px 10px" }}>
        <div style={{ width: 170, display: "grid", gap: 5 }}>
          <span>
            <span style={{ color: "#5a6167", marginRight: 5 }}>☺</span>
            <Link href="/attributes" style={{ color: "#09639a" }}>{moodWord}</Link>
          </span>
          <span>
            <span style={{ color: "#b33", marginRight: 5 }}>♥</span>
            <Link href="/attributes" style={{ color: "#09639a" }}>{healthWord}</Link>
          </span>
          <span>
            <span style={{ color: "#5a6167", marginRight: 5 }}>✚</span>
            <Link href="/develop" style={{ color: "#09639a" }}>{t("develop")}</Link>
          </span>
          <span>
            <span style={{ color: "#5a6167", marginRight: 5 }}>◎</span>
            <Link href="/focus" style={{ color: "#09639a" }}>{t("focuses")}</Link>
          </span>
          <span>
            <span style={{ color: "#5a6167", marginRight: 5 }}>⚙</span>
            <Link href="/player" style={{ color: "#09639a" }}>{t("settings")}</Link>
          </span>
        </div>

        <div style={{ display: "grid", gap: 5 }}>
          {meterRows.map((m) => (
            <span key={m.icon} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, textAlign: "center", color: m.color }}>{m.icon}</span>
              <span className="meter" style={{ width: 122 }}>
                <span style={{ width: `${m.pct}%` }} />
              </span>
            </span>
          ))}
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, textAlign: "center", color: "#5a6167" }}>§</span>
            <span style={{ fontWeight: 700 }}>{money} §</span>
          </span>
        </div>

        <div style={{ flex: 1, display: "grid", gap: 5, alignContent: "start" }}>
          <span><b>{t("gameLbl")}:</b> Fameworld</span>
          <span><b>{t("points")}:</b> <Link href="/charts" style={{ color: "#09639a" }}>{Math.round(character.starValue * 10)}</Link></span>
          <span><b>{t("activeDays")}:</b> {character.age * 3} {t("daysWord")}</span>
          <span><b>{t("statusLbl")}:</b> {character.hospitalized ? t("statusHospital") : t("statusNormal")}</span>
        </div>
      </div>
    </>
  );
}

const iconStyle = { textDecoration: "none", color: "#5a6167" };
