"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

type Group = { title: string; items: { href: string; key: string; vip?: boolean }[] };

/**
 * Right-column context menu: grouped link lists that belong to the section the
 * player is in (character pages show the character menu, artist pages the
 * artist menu, and so on). Grows page by page with the U-phases.
 */
const CHARACTER_MENU: Group[] = [
  {
    title: "gCharacter",
    items: [
      { href: "/home", key: "overview" },
      { href: "/awards", key: "achievements" },
      { href: "/relationships", key: "relationships" },
      { href: "/attributes", key: "bodyHealth" },
    ],
  },
  {
    title: "gCareer",
    items: [
      { href: "/skills", key: "skills" },
      { href: "/career", key: "employment" },
      { href: "/press", key: "press" },
    ],
  },
  {
    title: "gAssets",
    items: [
      { href: "/finances", key: "economy" },
      { href: "/estate", key: "estate" },
    ],
  },
  {
    title: "gExtras",
    items: [{ href: "/messages", key: "messages" }],
  },
];

const ARTIST_MENU: Group[] = [
  {
    title: "gArtist",
    items: [
      { href: "/band", key: "artistOverview" },
      { href: "/press", key: "press" },
    ],
  },
  {
    title: "gRankings",
    items: [{ href: "/charts", key: "charts" }],
  },
];

const WORLD_MENU: Group[] = [
  {
    title: "gCity",
    items: [
      { href: "/city", key: "cityPage" },
      { href: "/politics", key: "politics" },
    ],
  },
  {
    title: "gPlace",
    items: [{ href: "/place", key: "currentPlace" }],
  },
];

const SHOP_MENU: Group[] = [
  {
    title: "gShop",
    items: [{ href: "/shop", key: "vip" }],
  },
];

const GUIDE_MENU: Group[] = [
  {
    title: "gGuide",
    items: [{ href: "/guide", key: "guideHome" }],
  },
];

function menuFor(pathname: string): Group[] {
  if (pathname.startsWith("/band") || pathname.startsWith("/charts")) return ARTIST_MENU;
  if (
    pathname.startsWith("/city") ||
    pathname.startsWith("/locale") ||
    pathname.startsWith("/place") ||
    pathname.startsWith("/politics")
  )
    return WORLD_MENU;
  if (pathname.startsWith("/shop")) return SHOP_MENU;
  if (pathname.startsWith("/guide")) return GUIDE_MENU;
  return CHARACTER_MENU;
}

export function ContextMenu() {
  const t = useTranslations("ctx");
  const pathname = usePathname();
  const groups = menuFor(pathname);

  return (
    <div className="ctxmenu">
      {groups.map((g) => (
        <div key={g.title}>
          <h3>{t(g.title)}</h3>
          <ul>
            {g.items.map((item) => (
              <li key={item.href + item.key}>
                <Link
                  href={item.href}
                  className={pathname.startsWith(item.href) ? "active" : ""}
                >
                  {t(item.key)}
                  {item.vip ? " ★" : ""}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
