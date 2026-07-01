"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { createCharacterAction } from "@/app/actions/game";
import { firstNamesForGender, LAST_NAMES } from "@/lib/names";

type Gender = "MALE" | "FEMALE" | "OTHER";

export function CharacterCreateForm({
  locale,
  cities,
}: {
  locale: string;
  cities: { id: string; label: string }[];
}) {
  const t = useTranslations("create");
  const [gender, setGender] = useState<Gender>("FEMALE");
  const firstNames = useMemo(() => firstNamesForGender(gender), [gender]);

  return (
    <form action={createCharacterAction} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className="block text-xs mb-1 text-ink/70">{t("gender")}</label>
        <select
          name="gender"
          className="field"
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
        >
          <option value="FEMALE">{t("female")}</option>
          <option value="MALE">{t("male")}</option>
          <option value="OTHER">{t("other")}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1 text-ink/70">{t("firstName")}</label>
          <select name="firstName" className="field" required key={gender}>
            {firstNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1 text-ink/70">{t("lastName")}</label>
          <select name="lastName" className="field" required>
            {LAST_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs mb-1 text-ink/70">{t("city")}</label>
        {cities.length === 0 ? (
          <p className="text-sm text-red-600">{t("noCities")}</p>
        ) : (
          <select name="cityId" className="field" required>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <button type="submit" className="btn w-full" disabled={cities.length === 0}>
        {t("submit")}
      </button>
    </form>
  );
}
