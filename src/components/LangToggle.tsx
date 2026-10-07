"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

/** One-click EN/AR switch. Keeps the current path and remembers the choice for the next visit. */
export function LangToggle({
  locale,
  label,
  text,
  className,
}: {
  locale: Locale;
  label: string;
  text: string;
  className?: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const target: Locale = locale === "ar" ? "en" : "ar";
  const href = pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${target}`) || `/${target}`;

  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={label}
      scroll={false}
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={
        className ??
        "inline-flex h-10 min-w-12 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-semibold text-fg transition hover:border-accent hover:text-accent"
      }
    >
      {text}
    </Link>
  );
}
