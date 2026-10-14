"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CaretDown, List, X } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { PAGES } from "@/i18n/pages";
import { LangToggle } from "./LangToggle";

const SERVICE_SLUGS = ["usdt-desk", "property-payments", "crypto-click-payments"] as const;

export function Nav({ locale, d, base = "" }: { locale: Locale; d: Dict; base?: string }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pages = PAGES[locale];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMenu(false);
      }
    };
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const anchors = [
    { href: `${base}#clients`, label: d.nav.audience },
    { href: `${base}#office`, label: d.nav.office },
    { href: `${base}#faq`, label: d.nav.faq },
  ];

  const cta =
    "h-11 items-center whitespace-nowrap rounded-full bg-accent px-6 text-sm font-semibold text-accent-ink transition active:scale-[0.98] hover:brightness-110";
  const link = "text-sm font-medium text-muted transition hover:text-fg";

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href={`/${locale}`} aria-label={d.nav.home} className="flex items-center gap-3">
          <Image src="/brand/logo-tile.png" alt="" width={40} height={40} priority className="size-10 rounded-[10px]" />
          <span className="whitespace-nowrap font-display text-xl font-extrabold tracking-tight" dir="ltr">
            369 LTD
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <div ref={menuRef} className="relative" onMouseEnter={() => setMenu(true)} onMouseLeave={() => setMenu(false)}>
            <button
              type="button"
              aria-expanded={menu}
              aria-controls="services-menu"
              onClick={() => setMenu((v) => !v)}
              className={`${link} inline-flex items-center gap-1.5`}
            >
              {d.nav.services}
              <CaretDown size={14} weight="bold" className={`transition ${menu ? "rotate-180" : ""}`} />
            </button>
            {menu && (
              <div id="services-menu" className="absolute start-[-1rem] top-full pt-3">
                <ul className="panel w-72 p-2">
                  {SERVICE_SLUGS.map((s) => (
                    <li key={s}>
                      <Link
                        href={`/${locale}/${s}`}
                        onClick={() => setMenu(false)}
                        className="block rounded-2xl px-4 py-3 text-sm font-semibold transition hover:bg-white/10 hover:text-accent"
                      >
                        {pages[s].navLabel}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-white/10 pt-1">
                    <a
                      href={`${base}#services`}
                      onClick={() => setMenu(false)}
                      className="block rounded-2xl px-4 py-3 text-sm text-muted transition hover:bg-white/10 hover:text-fg"
                    >
                      {d.nav.services}
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
          {anchors.map((l) => (
            <a key={l.href} href={l.href} className={link}>
              {l.label}
            </a>
          ))}
          <Link href={`/${locale}/about`} className={link}>
            {pages.about.navLabel}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LangToggle locale={locale} label={d.nav.switchLabel} text={d.nav.switchText} />
          <a href={`${base}#contact`} className={`${cta} hidden sm:inline-flex`}>
            {d.nav.cta}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? d.nav.close : d.nav.menu}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 lg:hidden"
          >
            {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </div>

    </header>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-[68px] z-30 bottom-0 overflow-y-auto bg-ink-950 px-5 pb-10 pt-6 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            <p className="text-sm font-semibold text-accent">{d.nav.services}</p>
            {SERVICE_SLUGS.map((s) => (
              <Link
                key={s}
                href={`/${locale}/${s}`}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-4 font-display text-2xl font-extrabold"
              >
                {pages[s].navLabel}
              </Link>
            ))}
            <div className="mt-6" />
            {[...anchors, { href: `/${locale}/about`, label: pages.about.navLabel }].map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-4 font-display text-2xl font-extrabold"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a href={`${base}#contact`} onClick={() => setOpen(false)} className={`${cta} mt-8 inline-flex w-full justify-center`}>
            {d.nav.cta}
          </a>
        </div>
      )}
    </>
  );
}
