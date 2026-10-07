import Image from "next/image";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import type { Dict } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { SITE } from "@/lib/site";
import { KhatamPattern } from "./Khatam";

export function Footer({ d }: { d: Dict; locale?: Locale }) {
  const links = [
    { href: "#services", label: d.nav.services },
    { href: "#property", label: d.nav.flow },
    { href: "#office", label: d.nav.office },
    { href: "#principles", label: d.nav.values },
    { href: "#faq", label: d.nav.faq },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink-900/60">
      <div aria-hidden="true" className="ornament pointer-events-none absolute inset-0 opacity-60">
        <KhatamPattern opacity={0.12} />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-tile.png" alt="" width={48} height={48} className="size-12 rounded-xl" />
            <span className="font-display text-2xl font-extrabold" dir="ltr">369 LTD</span>
          </div>
          <p className="mt-5 max-w-xs text-lg text-fg/90">{d.footer.tagline}</p>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram @dubai_369ltd"
            className="mt-6 inline-flex size-11 items-center justify-center rounded-full border border-white/25 transition hover:border-accent hover:text-accent"
          >
            <InstagramLogo size={22} weight="bold" />
          </a>
        </div>

        <nav aria-label="Footer">
          <p className="text-sm font-semibold text-muted">{d.footer.explore}</p>
          <ul className="mt-4 grid gap-3">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition hover:text-accent">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <address className="not-italic">
          <p className="text-sm font-semibold text-muted">{d.contact.addressLabel}</p>
          <p className="mt-4">{d.contact.addressValue}</p>
          <p className="text-muted">{d.contact.poBox}</p>
        </address>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted md:px-8">
          <p className="max-w-3xl">{d.footer.disclaimer}</p>
          <p>
            <span dir="ltr">© {new Date().getFullYear()} 369 LTD.</span> {d.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
