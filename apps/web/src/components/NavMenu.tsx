"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { logoutAction } from "@/app/actions/auth";

const ITEMS = [
  { href: "/home", key: "home" },
  { href: "/city", key: "city" },
  { href: "/attributes", key: "attributes" },
  { href: "/career", key: "career" },
  { href: "/band", key: "band" },
  { href: "/charts", key: "charts" },
  { href: "/relationships", key: "relationships" },
  { href: "/messages", key: "messages" },
  { href: "/estate", key: "estate" },
  { href: "/politics", key: "politics" },
  { href: "/finances", key: "finances" },
] as const;

export function NavMenu({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="panel">
      {/* Mobile header with a hamburger toggle. */}
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

      <div className={`panel-body p-2 ${open ? "block" : "hidden"} md:block`}>
        <ul className="space-y-1">
          {ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded px-3 py-2 text-sm transition-colors ${
                    active ? "bg-brand text-white" : "hover:bg-black/[0.04]"
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
          <li className="pt-1 border-t border-black/10 mt-1">
            <form action={logoutAction.bind(null, locale)}>
              <button
                type="submit"
                className="w-full text-left rounded px-3 py-2 text-sm hover:bg-black/[0.04]"
              >
                {t("logout")}
              </button>
            </form>
          </li>
        </ul>
      </div>
    </nav>
  );
}
