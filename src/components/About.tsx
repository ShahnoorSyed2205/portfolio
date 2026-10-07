import Image from "next/image";
import type { Dict } from "@/i18n/en";
import { KhatamPattern } from "./Khatam";
import { Reveal } from "./Reveal";

export function About({ d }: { d: Dict }) {
  return (
    <section id="about" aria-labelledby="about-title" className="relative overflow-x-clip py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
        <div>
          <Reveal>
            <h2 id="about-title" className="font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.025em] md:text-6xl [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal">
              {d.about.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-8 max-w-[38rem] text-lg text-muted">{d.about.body1}</p>
            <p className="mt-4 max-w-[38rem] text-lg text-muted">{d.about.body2}</p>
          </Reveal>
          <Reveal delay={0.14}>
            <figure className="mt-12 max-w-[38rem] border-s-2 border-gold ps-6">
              <blockquote className="font-display text-2xl font-extrabold leading-snug md:text-3xl">
                “{d.about.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-medium text-accent">{d.about.meaning}</figcaption>
            </figure>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="arch-ring">
            <div className="arch relative aspect-[4/5] bg-ink-900">
              <Image
                src="/media/office-wide.webp"
                alt={d.about.imgAlt}
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover object-[38%_50%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
            </div>
          </div>
          <div aria-hidden="true" className="ornament pointer-events-none absolute -bottom-10 -end-10 -z-10 size-72">
            <KhatamPattern opacity={0.5} size={64} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
