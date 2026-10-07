import { Plus } from "@phosphor-icons/react/dist/ssr";
import type { Dict } from "@/i18n/en";
import { Reveal } from "./Reveal";

/** Native details/summary: keyboard accessible, indexable, and works without JavaScript. */
export function Faq({ d }: { d: Dict }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="faq-title" className="font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.025em] md:text-5xl [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal">
            {d.faq.title}
          </h2>
        </Reveal>

        <div className="flex flex-col gap-3">
          {d.faq.items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.04}>
              <details className="panel group px-6 py-5 open:bg-ink-800/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-extrabold marker:hidden md:text-xl [&::-webkit-details-marker]:hidden">
                  <h3 className="text-start">{item.q}</h3>
                  <Plus
                    size={22}
                    weight="bold"
                    className="shrink-0 text-accent transition duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="mt-4 max-w-2xl text-muted">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
