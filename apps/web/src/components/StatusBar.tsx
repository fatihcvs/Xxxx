import { getTranslations } from "next-intl/server";
import type { CharacterView } from "@/lib/character";
import { formatGameDate } from "@/lib/world";

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="min-w-[110px]">
      <div className="flex justify-between text-[11px] text-ink/70">
        <span>{label}</span>
        <span>{value}%</span>
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
      <div className="panel-body flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="mr-auto">
          <div className="font-semibold">
            {character.firstName} {character.lastName}
          </div>
          <div className="text-xs text-ink/60">
            {t("age")}: {character.age} · {character.currentCityName}
            {character.currentLocaleName ? ` · ${character.currentLocaleName}` : ""}
          </div>
        </div>
        <Meter label={t("mood")} value={character.meters.mood} color="#f59e0b" />
        <Meter label={t("health")} value={character.meters.health} color="#ef4444" />
        <Meter label={t("energy")} value={character.meters.energy} color="#10b981" />
        <div className="text-sm">
          <div className="text-[11px] text-ink/60">{t("money")}</div>
          <div className="font-semibold">§{character.money}</div>
        </div>
        <div className="text-sm">
          <div className="text-[11px] text-ink/60">{t("fame")}</div>
          <div className="font-semibold">{character.starValue.toFixed(1)}</div>
        </div>
        <div className="text-sm">
          <div className="text-[11px] text-ink/60">{t("date")}</div>
          <div className="font-semibold">{formatGameDate()}</div>
        </div>
      </div>
    </header>
  );
}
