import { getTranslations } from "next-intl/server";
import type { CharacterView } from "@/lib/character";
import { Avatar } from "./Avatar";

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="min-w-[96px]">
      <div className="flex justify-between text-[11px] text-ink/70">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="meter">
        <span style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export async function StatusBar({ character }: { character: CharacterView }) {
  const t = await getTranslations("status");
  return (
    <header className="panel mb-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 py-2">
        <div className="mr-auto flex items-center gap-2.5">
          <Avatar firstName={character.firstName} lastName={character.lastName} size={36} />
          <div>
            <div className="flex items-center gap-2 font-display text-[15px] font-semibold">
              {character.firstName} {character.lastName}
              {character.vip && (
                <span className="rounded-sm bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                  VIP
                </span>
              )}
            </div>
            <div className="text-[11px] text-ink/60">
              {character.travelingToCityName
                ? `${t("age")}: ${character.age} · ✈ ${t("inFlightTo", { city: character.travelingToCityName })}`
                : `${t("age")}: ${character.age} · ${character.currentCityName}${character.currentLocaleName ? ` · ${character.currentLocaleName}` : ""}`}
            </div>
          </div>
        </div>
        <Meter label={t("mood")} value={character.meters.mood} color="#c9a227" />
        <Meter label={t("health")} value={character.meters.health} color="#a23434" />
        <Meter label={t("energy")} value={character.meters.energy} color="#4e7a3a" />
        <div className="text-sm">
          <div className="text-[11px] text-ink/60">{t("money")}</div>
          <div className="font-semibold tabular-nums">§{character.money}</div>
        </div>
        <div className="text-sm">
          <div className="text-[11px] text-ink/60">{t("fame")}</div>
          <div className="font-semibold tabular-nums">{character.starValue.toFixed(1)}</div>
        </div>
      </div>
    </header>
  );
}
