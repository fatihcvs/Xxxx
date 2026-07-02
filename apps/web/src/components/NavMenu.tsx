"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { logoutAction } from "@/app/actions/auth";

// Grouped navigation, sidebar style.
const GROUPS: { title: string; items: { href: string; key: string }[] }[] = [
  {
    title: "grpCharacter",
    items: [
      { href: "/home", key: "home" },
      { href: "/attributes", key: "attributes" },
      { href: "/skills", key: "skills" },
    ],
  },
  {
    title: "grpCareer",
    items: [
      { href: "/career", key: "career" },
      { href: "/band", key: "band" },
      { href: "/charts", key: "charts" },
      { href: "/press", key: "press" },
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
      { href: "/estate", key: "estate" },
      { href: "/politics", key: "politics" },
    ],
  },
  {
    title: "grpMoney",
    items: [{ href: "/finances", key: "finances" }],
  },
];

export function NavMenu({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="panel">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="md:hidden flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
      >
        <span>{t("home")}</span>
        <span aria-hidden className="text-lg leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      <div className={`${open ? "block" : "hidden"} md:block`}>
        {GROUPS.map((group) => (
          <div key={group.title} className="border-b border-black/5 last:border-0">
            <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink/40">
              {t(group.title)}
            </div>
            <ul className="pb-1">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`block px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-brand/10 text-brand font-medium border-l-2 border-brand"
                          : "text-ink/80 hover:bg-black/[0.03] border-l-2 border-transparent"
                      }`}
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <form action={logoutAction.bind(null, locale)} className="p-2">
          <button
            type="submit"
            className="w-full text-left rounded px-3 py-1.5 text-sm text-ink/60 hover:bg-black/[0.03]"
          >
            {t("logout")}
          </button>
        </form>
      </div>
    </nav>
  );
}
