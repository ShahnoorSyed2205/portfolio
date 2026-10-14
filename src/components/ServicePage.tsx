import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Dict } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { PAGES, SLUGS, type Slug } from "@/i18n/pages";
import { KhatamPattern } from "./Khatam";
import { Reveal } from "./Reveal";
import { Faq } from "./Faq";

export function ServicePage({ d, locale, slug }: { d: Dict; locale: Locale; slug: Slug }) {
  const p = PAGES[locale][slug];
  const home = `/${locale}`;
  const others = SLUGS.filter((s) => s !== slug);

  return (
    <>
      <section aria-labelledby="page-title" className="relative isolate overflow-hidden pb-12 pt-32 md:pt-40">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -top-32 start-[-10%] size-[50rem] rounded-full bg-[radial-gradient(circle,rgb(19_24_104/0.9),transparent_65%)]" />
          <div className="ornament absolute inset-0"><KhatamPattern opacity={0.14} /></div>
        </div>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href={home} className="transition hover:text-accent">369 LTD</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-fg">{p.navLabel}</li>
            </ol>
          </nav>
          <h1 id="page-title" className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-7xl [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal">
            {p.h1}
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted">{p.intro}</p>
          <a href={`${home}#contact`} className="mt-9 inline-flex h-14 items-center gap-2 whitespace-nowrap rounded-full bg-accent px-8 text-base font-semibold text-accent-ink transition active:scale-[0.98] hover:brightness-110">
            {p.cta}
            <ArrowUpRight size={20} weight="bold" className="rtl:-scale-x-100" />
          </a>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-14 px-5 md:gap-20 md:px-8">
          {p.sections.map((s) => (
            <Reveal key={s.h}>
              <article className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] md:text-4xl [html[lang=ar]_&]:leading-[1.4] [html[lang=ar]_&]:tracking-normal">{s.h}</h2>
                <div className="flex max-w-2xl flex-col gap-4 text-lg text-muted">
                  {s.p.map((t) => (<p key={t}>{t}</p>))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Faq d={d} items={p.faq} title={d.faq.title} />

      <section aria-labelledby="more-title" className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 id="more-title" className="font-display text-2xl font-extrabold">{p.more}</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((s) => (
              <li key={s}>
                <Link href={`/${locale}/${s}`} className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-white/25 px-5 text-sm font-semibold transition hover:border-accent hover:text-accent">
                  {PAGES[locale][s].navLabel}
                  <ArrowUpRight weight="bold" className="rtl:-scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
