import { getTranslations } from "next-intl/server";

/**
 * Placeholder section page: title panel + flavour text + empty state. Used by
 * character-menu pages whose systems arrive in later U-phases, so the menu
 * structure is complete from day one.
 */
export async function SkeletonPage({ id }: { id: string }) {
  const t = await getTranslations("skeleton");
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">{t(`${id}_title`)}</div>
        <div className="panel-body">
          <p className="flavor">{t(`${id}_flavor`)}</p>
          <p>{t(`${id}_empty`)}</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-body">
          <p className="flavor">{t("comingSoon")}</p>
        </div>
      </div>
    </div>
  );
}
