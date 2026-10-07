import Image from "next/image";
import {
  ArrowUpRight,
  Briefcase,
  Buildings,
  CurrencyCircleDollar,
  Lightning,
  Brain,
} from "@phosphor-icons/react/dist/ssr";
import type { Dict } from "@/i18n/en";
import { KhatamPattern } from "./Khatam";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { TopicLink } from "./TopicLink";

const link =
  "mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:gap-3";

export function Services({ d }: { d: Dict }) {
  const [usdt, property, ai, oneClick, business] = d.services.items;
  const icon = "size-11 rounded-full border border-white/20 bg-ink-950/50 p-2.5 text-accent";

  return (
    <section id="services" aria-labelledby="services-title" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <h2 id="services-title" className="font-display text-4xl font-extrabold tracking-[-0.025em] md:text-6xl [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal">
            {d.services.title}
          </h2>
          <p className="mt-4 max-w-[34rem] text-lg text-muted">{d.services.intro}</p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-6 [perspective:1400px]">
          {/* USDT desk: photo cell */}
          <Reveal className="md:col-span-4">
            <TiltCard className="panel group relative h-full min-h-[24rem] overflow-hidden p-8 md:p-10">
              <Image
                src="/media/screen-imac.webp"
                alt=""
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="-z-10 object-cover opacity-55 transition duration-700 group-hover:scale-[1.04]"
              />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/20" />
              <div className="flex h-full flex-col justify-end">
                <CurrencyCircleDollar className={icon} weight="duotone" />
                <h3 className="mt-5 font-display text-3xl font-extrabold md:text-4xl">{usdt.title}</h3>
                <p className="mt-3 max-w-md text-muted">{usdt.text}</p>
                <TopicLink topic="buy-usdt" className={link}>
                  {usdt.cta}
                  <ArrowUpRight weight="bold" className="rtl:-scale-x-100" />
                </TopicLink>
              </div>
            </TiltCard>
          </Reveal>

          {/* Property payments: tall gradient cell */}
          <Reveal delay={0.06} className="md:col-span-2 md:row-span-2">
            <TiltCard className="panel relative h-full min-h-[24rem] overflow-hidden p-8">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgb(204_255_102/0.22),rgb(242_206_25/0.12)_35%,rgb(62_243_238/0.2)_75%,rgb(27_143_176/0.25))]" />
              <div aria-hidden="true" className="ornament absolute inset-0 -z-10">
                <KhatamPattern opacity={0.3} size={72} />
              </div>
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
              <div className="flex h-full flex-col justify-end">
                <Buildings className={icon} weight="duotone" />
                <h3 className="mt-5 font-display text-3xl font-extrabold">{property.title}</h3>
                <p className="mt-3 text-fg/80">{property.text}</p>
                <TopicLink topic="property" className={link}>
                  {property.cta}
                  <ArrowUpRight weight="bold" className="rtl:-scale-x-100" />
                </TopicLink>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.04} className="md:col-span-2">
            <TiltCard className="panel h-full p-8">
              <Brain className={icon} weight="duotone" />
              <h3 className="mt-5 font-display text-2xl font-extrabold">{ai.title}</h3>
              <p className="mt-3 text-muted">{ai.text}</p>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-2">
            <TiltCard className="panel h-full bg-[linear-gradient(145deg,rgb(62_243_238/0.14),transparent)] p-8">
              <Lightning className={icon} weight="duotone" />
              <h3 className="mt-5 font-display text-2xl font-extrabold">{oneClick.title}</h3>
              <p className="mt-3 text-muted">{oneClick.text}</p>
            </TiltCard>
          </Reveal>

          {/* Business: wide cell */}
          <Reveal delay={0.04} className="md:col-span-6">
            <TiltCard className="panel relative overflow-hidden bg-[linear-gradient(100deg,transparent_40%,rgb(62_243_238/0.1))] p-8 md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-5">
                  <Briefcase className={`${icon} shrink-0`} weight="duotone" />
                  <div>
                    <h3 className="font-display text-2xl font-extrabold md:text-3xl">{business.title}</h3>
                    <p className="mt-3 max-w-2xl text-muted">{business.text}</p>
                  </div>
                </div>
                <TopicLink topic="business" className="inline-flex h-12 items-center gap-2 self-start whitespace-nowrap rounded-full border border-white/25 px-6 text-sm font-semibold transition hover:border-accent hover:text-accent md:self-center">
                  {business.cta}
                  <ArrowUpRight weight="bold" className="rtl:-scale-x-100" />
                </TopicLink>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
