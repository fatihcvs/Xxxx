"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

/**
 * The nine fixed game sections in the horizontal main menu. Each item maps to
 * the section's landing route; the context menu (right column) handles the
 * section's sub-pages.
 */
const ITEMS: { href: string; key: string; match: string[] }[] = [
  { href: "/city", key: "city", match: ["/city", "/politics", "/venues"] },
  { href: "/place", key: "place", match: ["/place", "/locale"] },
  {
    href: "/home",
    key: "character",
    match: [
      "/home",
      "/attributes",
      "/skills",
      "/career",
      "/finances",
      "/relationships",
      "/messages",
      "/press",
      "/awards",
      "/diary",
      "/blog",
      "/bio",
      "/family",
      "/player",
      "/focus",
      "/develop",
      "/invitations",
      "/flights",
      "/events",
      "/tasks",
      "/parties",
      "/activities",
      "/personality",
      "/recipes",
      "/items",
      "/housing",
      "/vehicles",
      "/shares",
      "/shopping",
      "/gifts",
    ],
  },
  { href: "/band", key: "artist", match: ["/band", "/charts"] },
  { href: "/estate", key: "company", match: ["/estate"] },
  { href: "/guide", key: "guide", match: ["/guide"] },
  { href: "/charts", key: "rankings", match: ["/charts"] },
  { href: "/relationships", key: "social", match: [] },
  { href: "/shop", key: "shop", match: ["/shop"] },
];

export function MainMenu() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // First match wins so overlapping routes highlight a single section.
  const activeKey = ITEMS.find((i) => i.match.some((m) => pathname.startsWith(m)))?.key;

  return (
    <nav className="mainmenu" aria-label="main">
      <span className="diamond" aria-hidden>
        ◆
      </span>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`menu-link ${activeKey === item.key ? "active" : ""}`}
          >
            {t(item.key)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
