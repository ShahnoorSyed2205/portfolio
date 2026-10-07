import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Dict } from "@/i18n/en";
import { KhatamPattern } from "./Khatam";
import { SceneLoader } from "./SceneLoader";

export function Hero({ d }: { d: Dict }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden"
    >
      {/* Backdrop: brand gradient glow plus a masked khatam lattice. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-40 start-[-10%] size-[60rem] rounded-full bg-[radial-gradient(circle,rgb(19_24_104/0.9),transparent_65%)]" />
        <div className="absolute end-[-12%] top-[10%] size-[46rem] rounded-full bg-[radial-gradient(circle,rgb(62_243_238/0.16),transparent_62%)]" />
        <div className="ornament absolute inset-0">
          <KhatamPattern opacity={0.16} />
        </div>
      </div>

      <div className="mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-4 px-5 pb-10 pt-[88px] md:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-6 lg:pt-24">
        <div className="relative z-10 order-2 lg:order-1">
          <h1
            id="hero-title"
            className="font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem] [html[lang=ar]_&]:text-[2.1rem] [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal sm:[html[lang=ar]_&]:text-5xl lg:[html[lang=ar]_&]:text-[3.3rem]"
          >
            {d.hero.titleTop}
            <br />
            <span className="text-brand-gradient">{d.hero.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted">{d.hero.sub}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="group inline-flex h-14 items-center gap-2 whitespace-nowrap rounded-full bg-accent px-8 text-base font-semibold text-accent-ink shadow-[0_18px_50px_-18px_rgb(62_243_238/0.8)] transition active:scale-[0.98] hover:brightness-110"
            >
              {d.hero.primary}
              <ArrowUpRight
                size={20}
                weight="bold"
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
              />
            </a>
            <a
              href="#services"
              className="inline-flex h-14 items-center whitespace-nowrap rounded-full border border-white/25 px-8 text-base font-semibold transition hover:border-accent hover:text-accent"
            >
              {d.hero.secondary}
            </a>
          </div>
        </div>

        <div className="relative order-1 h-[36dvh] min-h-[250px] lg:order-2 lg:h-[min(78dvh,720px)]">
          <SceneLoader label={d.hero.sceneLabel} />
        </div>
      </div>
    </section>
  );
}
