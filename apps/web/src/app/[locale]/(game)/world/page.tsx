import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@fameworld/db";
import {
  haversineKm,
  flightCost,
  flightMinutes,
  flightEnergyCost,
} from "@fameworld/game-engine";
import { getCharacterForUser } from "@/lib/character";
import { flyToCityAction } from "@/app/actions/game";

/** Regional-indicator flag for an ISO country code (rendered by the OS font). */
function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

function localTime(timezone: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return "";
  }
}

export default async function WorldPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const character = await getCharacterForUser(session.user.id);
  if (!character) redirect(`/${locale}/create`);

  const t = await getTranslations("world");
  const cities = await prisma.city.findMany({
    include: { country: true, _count: { select: { presentHere: true } } },
    orderBy: [{ country: { name: "asc" } }, { name: "asc" }],
  });
  const here = cities.find((c) => c.id === character.currentCityId);
  const inTransit = !!character.travelingToCityName;

  return (
    <div className="space-y-4">
      {inTransit && (
        <div className="panel">
          <div className="panel-body text-sm">
            ✈{" "}
            {t("inFlight", {
              city: character.travelingToCityName!,
              time: character.travelArrivesAt
                ? new Intl.DateTimeFormat(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(character.travelArrivesAt)
                : "",
            })}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="mb-3 text-xs text-ink/60">
            {t("intro", { count: cities.length })}
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="py-1 pr-2">{t("city")}</th>
                <th className="py-1 pr-2">{t("localTime")}</th>
                <th className="py-1 pr-2 text-right">{t("residents")}</th>
                <th className="py-1 pr-2 text-right">{t("flight")}</th>
                <th className="py-1"></th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => {
                const isHere = city.id === character.currentCityId;
                const km = here ? Math.round(haversineKm(here, city)) : 0;
                const price = flightCost(km);
                const minutes = flightMinutes(km);
                const energy = flightEnergyCost(km);
                return (
                  <tr key={city.id} className="row">
                    <td className="py-1.5 pr-2">
                      <span className="mr-1.5">{flagEmoji(city.country.code)}</span>
                      <span className="font-medium">{city.name}</span>
                      <span className="ml-1.5 text-xs text-ink/50">
                        {city.country.name}
                      </span>
                    </td>
                    <td className="py-1.5 pr-2 tabular-nums">
                      {localTime(city.timezone, locale)}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums">
                      {city._count.presentHere}
                    </td>
                    <td className="py-1.5 pr-2 text-right text-xs tabular-nums">
                      {isHere
                        ? "—"
                        : t("flightInfo", { price, minutes, energy, km })}
                    </td>
                    <td className="py-1.5 text-right">
                      {isHere ? (
                        <span className="text-xs text-green-700">
                          {t("youAreHere")}
                        </span>
                      ) : (
                        <form action={flyToCityAction}>
                          <input type="hidden" name="cityId" value={city.id} />
                          <input type="hidden" name="locale" value={locale} />
                          <button
                            type="submit"
                            className="btn-ghost !py-0.5 !px-2 text-xs"
                            disabled={inTransit || character.money < price}
                          >
                            {t("flyHere")}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
