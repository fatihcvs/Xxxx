import { setRequestLocale, getTranslations } from "next-intl/server";

const TOPICS = ["start", "music", "economy", "social", "world", "health"] as const;

/** Game guide landing page: welcome text + topic menu (content grows in U4). */
export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guide");

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t("title")}</div>
        <div className="panel-body">
          <p className="flavor">{t("intro")}</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-header">{t("menuTitle")}</div>
        <div className="panel-body">
          <ul className="space-y-1">
            {TOPICS.map((topic) => (
              <li key={topic}>
                <span className="font-bold">{t(`topic_${topic}`)}</span>
                <span className="ml-2 text-[11px] text-[#777777]">
                  {t(`topic_${topic}_sub`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
