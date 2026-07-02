import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { CharacterView } from "@/lib/character";
import { Avatar } from "./Avatar";

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="min-w-[92px]">
      <div className="flex justify-between text-[10px] text-[#666666]">
        <span>{label}</span>
        <span className="font-bold text-ink">{value}</span>
      </div>
      <div className="meter">
        <span style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

/**
 * Character presentation block shown above the content column: portrait,
 * name + id, age/location sentences, the four gauges and quick links.
 */
export async function CharacterHeader({ character }: { character: CharacterView }) {
  const t = await getTranslations("charHeader");

  return (
    <div className="mb-3 border border-[#cccccc] bg-white">
      <div className="flex flex-wrap gap-3 p-2">
        <Avatar firstName={character.firstName} lastName={character.lastName} size={56} />
        <div className="min-w-[200px] flex-1">
          <h1 className="text-[15px] font-bold leading-tight">
            {character.firstName} {character.lastName}
            <span className="idbadge">#{character.id.slice(-6).toUpperCase()}</span>
            {character.vip && (
              <span className="ml-2 align-middle text-[10px] font-bold text-alert">VIP ★</span>
            )}
          </h1>
          <p className="text-[11px] text-[#444444]">
            {t("age", { name: character.firstName, age: character.age })}
          </p>
          <p className="text-[11px] text-[#444444]">
            {t.rich("location", {
              name: character.firstName,
              city: (chunk) => (
                <Link href="/city" className="text-brand hover:underline">
                  {character.currentCityName}
                </Link>
              ),
              locale: (chunk) =>
                character.currentLocaleName ? (
                  <Link
                    href={`/locale/${character.currentLocaleId}`}
                    className="text-brand hover:underline"
                  >
                    {character.currentLocaleName}
                  </Link>
                ) : (
                  <>{t("outside")}</>
                ),
            })}
          </p>
          {character.hospitalized && (
            <p className="text-[11px] font-bold text-alert">{t("hospitalized")}</p>
          )}
          <p className="mt-1 text-[11px]">
            <Link href="/skills" className="text-brand hover:underline">
              {t("develop")}
            </Link>
            {" · "}
            <Link href="/attributes" className="text-brand hover:underline">
              {t("bodyHealth")}
            </Link>
            {" · "}
            <Link href="/press" className="text-brand hover:underline">
              {t("press")}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Gauge label={t("mood")} value={character.meters.mood} color="#f0b400" />
          <Gauge label={t("health")} value={character.meters.health} color="#c0392b" />
          <Gauge label={t("energy")} value={character.meters.energy} color="#2e8b57" />
          <div className="text-right">
            <div className="text-[10px] text-[#666666]">{t("cash")}</div>
            <div className="text-[13px] font-bold">
              {character.money.toLocaleString()} <span className="text-[10px]">M$</span>
            </div>
            <div className="text-[10px] text-[#666666]">
              {t("star")}: <b className="text-ink">{character.starValue.toFixed(1)}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
