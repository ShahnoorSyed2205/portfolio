"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import type { Dict } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { LangToggle } from "./LangToggle";

export function Nav({ locale, d }: { locale: Locale; d: Dict }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = [
    { href: "#services", label: d.nav.services },
    { href: "#property", label: d.nav.flow },
    { href: "#office", label: d.nav.office },
    { href: "#faq", label: d.nav.faq },
  ];

  const cta =
    "h-11 items-center whitespace-nowrap rounded-full bg-accent px-6 text-sm font-semibold text-accent-ink transition active:scale-[0.98] hover:brightness-110";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href={`/${locale}`} aria-label={d.nav.home} className="flex items-center gap-3">
          <Image src="/brand/logo-tile.png" alt="" width={40} height={40} priority className="size-10 rounded-[10px]" />
          <span className="whitespace-nowrap font-display text-xl font-extrabold tracking-tight" dir="ltr">
            369 LTD
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted transition hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangToggle locale={locale} label={d.nav.switchLabel} text={d.nav.switchText} />
          <a href="#contact" className={`${cta} hidden sm:inline-flex`}>
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

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-[68px] bottom-0 overflow-y-auto bg-ink-950 px-5 pb-10 pt-6 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-5 font-display text-3xl font-extrabold"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a href="#contact" onClick={() => setOpen(false)} className={`${cta} mt-8 inline-flex w-full justify-center`}>
            {d.nav.cta}
          </a>
        </div>
      )}
    </header>
  );
}
