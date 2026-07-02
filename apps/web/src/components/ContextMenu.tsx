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
      { href: "/diary", key: "diary" },
      { href: "/blog", key: "blog" },
      { href: "/bio", key: "background" },
      { href: "/family", key: "family" },
      { href: "/relationships", key: "relationships" },
      { href: "/attributes", key: "bodyHealth" },
      { href: "/player", key: "playerInfo" },
    ],
  },
  {
    title: "gCareer",
    items: [
      { href: "/focus", key: "focuses" },
      { href: "/develop", key: "develop" },
      { href: "/invitations", key: "invitations" },
      { href: "/skills", key: "skills" },
      { href: "/flights", key: "flights" },
      { href: "/events", key: "events" },
      { href: "/tasks", key: "tasks" },
      { href: "/parties", key: "parties" },
      { href: "/activities", key: "activities" },
      { href: "/career", key: "employment" },
      { href: "/personality", key: "personality" },
      { href: "/recipes", key: "recipes" },
    ],
  },
  {
    title: "gAssets",
    items: [
      { href: "/items", key: "items" },
      { href: "/housing", key: "housing" },
      { href: "/finances", key: "economy" },
      { href: "/vehicles", key: "vehicles" },
      { href: "/shares", key: "shares" },
      { href: "/estate", key: "estate" },
    ],
  },
  {
    title: "gTrade",
    items: [
      { href: "/shopping", key: "shoppingAssistant" },
      { href: "/gifts", key: "gifts" },
    ],
  },
  {
    title: "gExtras",
    items: [
      { href: "/messages", key: "messages" },
      { href: "/press", key: "press" },
    ],
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
