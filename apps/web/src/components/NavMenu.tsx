"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { logoutAction } from "@/app/actions/auth";

// Grouped navigation rendered as a classic two-row horizontal menu:
// top row = sections, second row = the active section's pages.
const GROUPS: { title: string; items: { href: string; key: string }[] }[] = [
  {
    title: "grpCharacter",
    items: [
      { href: "/home", key: "home" },
      { href: "/attributes", key: "attributes" },
      { href: "/skills", key: "skills" },
      { href: "/achievements", key: "achievements" },
    ],
  },
  {
    title: "grpCareer",
    items: [
      { href: "/career", key: "career" },
      { href: "/band", key: "band" },
      { href: "/charts", key: "charts" },
      { href: "/awards", key: "awards" },
    ],
  },
  {
    title: "grpSocial",
    items: [
      { href: "/relationships", key: "relationships" },
      { href: "/messages", key: "messages" },
    ],
  },
  {
    title: "grpWorld",
    items: [
      { href: "/city", key: "city" },
      { href: "/world", key: "world" },
      { href: "/news", key: "news" },
      { href: "/estate", key: "estate" },
      { href: "/politics", key: "politics" },
    ],
  },
  {
    title: "grpMoney",
    items: [{ href: "/finances", key: "finances" }],
  },
];

function groupOf(pathname: string): number {
  const idx = GROUPS.findIndex((g) => g.items.some((i) => pathname.startsWith(i.href)));
  return idx === -1 ? 0 : idx;
}

export function NavMenu({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const activeGroup = groupOf(pathname);
  // null = follow the route; a number = section the user clicked open.
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const shownGroup = openGroup ?? activeGroup;

  return (
    <nav className="border-b border-edge bg-panel shadow-sm">
      {/* Mobile: hamburger + full list */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium"
        >
          <span>{t(GROUPS[activeGroup].title)}</span>
          <span aria-hidden className="text-lg leading-none">
            {mobileOpen ? "✕" : "☰"}
          </span>
        </button>
        {mobileOpen && (
          <div className="border-t border-edge pb-2">
            {GROUPS.map((group) => (
              <div key={group.title}>
                <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-ink/40">
                  {t(group.title)}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-6 py-1.5 text-sm no-underline ${
                      pathname.startsWith(item.href)
                        ? "font-semibold text-brand"
                        : "text-ink/80"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </div>
            ))}
            <form action={logoutAction.bind(null, locale)}>
              <button type="submit" className="px-6 py-1.5 text-sm text-ink/60">
                {t("logout")}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Desktop: two-row tab menu */}
      <div className="hidden md:block">
        <div className="mx-auto flex max-w-5xl items-stretch px-4">
          {GROUPS.map((group, i) => (
            <button
              key={group.title}
              type="button"
              onClick={() => setOpenGroup(i)}
              className={`border-b-2 px-4 py-2 text-[13px] font-semibold transition-colors ${
                shownGroup === i
                  ? "border-brand text-brand"
                  : "border-transparent text-ink/70 hover:text-ink"
              }`}
            >
              {t(group.title)}
            </button>
          ))}
          <form action={logoutAction.bind(null, locale)} className="ml-auto self-center">
            <button
              type="submit"
              className="px-3 py-1 text-xs text-ink/50 hover:text-ink"
            >
              {t("logout")}
            </button>
          </form>
        </div>
        <div className="border-t border-edge bg-altRow">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-x-1 px-4">
            {GROUPS[shownGroup].items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-[13px] no-underline ${
                  pathname.startsWith(item.href)
                    ? "font-semibold text-brand"
                    : "text-ink/80 hover:text-brand"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
