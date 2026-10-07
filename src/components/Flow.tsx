import type { Dict } from "@/i18n/en";
import { Reveal } from "./Reveal";
import { TopicLink } from "./TopicLink";

const DIGITS = ["3", "6", "9"];

/** Property payment flow. The 3, 6, 9 numerals come straight from the brand mark. */
export function Flow({ d }: { d: Dict }) {
  return (
    <section id="property" aria-labelledby="flow-title" className="relative overflow-hidden py-16 md:py-24">
      <div aria-hidden="true" className="absolute inset-x-0 top-1/2 -z-10 h-[40rem] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgb(19_24_104/0.55),transparent_70%)]" />
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <h2 id="flow-title" className="font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.025em] md:text-6xl [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal">
              {d.flow.title}
            </h2>
            <p className="mt-6 max-w-md text-lg text-muted">{d.flow.intro}</p>
            <TopicLink
              topic="property"
              className="mt-8 inline-flex h-12 items-center whitespace-nowrap rounded-full border border-white/25 px-6 text-sm font-semibold transition hover:border-accent hover:text-accent"
            >
              {d.services.items[1].cta}
            </TopicLink>
          </Reveal>
        </div>

        <ol className="flex flex-col gap-14 md:gap-20">
          {d.flow.steps.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={0.05}>
                <div className="relative ps-4">
                  <span
                    aria-hidden="true"
                    dir="ltr"
                    className="pointer-events-none absolute -top-10 end-0 select-none font-display text-[9rem] font-extrabold leading-none text-transparent opacity-80 [-webkit-text-stroke:1.5px_rgb(242_206_25/0.8)] md:text-[13rem]"
                  >
                    {DIGITS[i]}
                  </span>
                  <h3 className="relative font-display text-4xl font-extrabold md:text-5xl">{s.title}</h3>
                  <p className="relative mt-4 max-w-md text-lg text-muted">{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
