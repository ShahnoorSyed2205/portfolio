import { Lightbulb, LinkSimple, Lightning, ShieldCheck, UsersThree } from "@phosphor-icons/react/dist/ssr";
import type { Dict } from "@/i18n/en";
import { Reveal } from "./Reveal";

const ICONS = [Lightbulb, ShieldCheck, LinkSimple, UsersThree, Lightning];

/** Five bars that climb left to right, echoing the ascending bars in the 369 mark. */
const HEIGHTS = ["lg:h-[19rem]", "lg:h-[22rem]", "lg:h-[25rem]", "lg:h-[28rem]", "lg:h-[31rem]"];

export function Values({ d }: { d: Dict }) {
  return (
    <section id="principles" aria-labelledby="values-title" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <h2 id="values-title" className="font-display text-4xl font-extrabold tracking-[-0.025em] md:text-6xl [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal">
            {d.values.title}
          </h2>
        </Reveal>

        <ul className="mt-14 grid gap-4 lg:grid-cols-5 lg:items-end">
          {d.values.items.map((v, i) => {
            const Icon = ICONS[i];
            const t = i / (d.values.items.length - 1);
            return (
              <li key={v.title}>
                <Reveal delay={i * 0.07} className="h-full">
                  <div
                    className={`panel relative flex flex-col justify-between overflow-hidden p-7 ${HEIGHTS[i]}`}
                    style={{
                      backgroundImage: `linear-gradient(180deg, transparent 25%, rgb(62 243 238 / ${(0.05 + t * 0.2).toFixed(2)})), linear-gradient(145deg, rgb(255 255 255 / 0.07), rgb(255 255 255 / 0.015))`,
                    }}
                  >
                    <Icon size={34} weight="duotone" className="text-accent" />
                    <div className="mt-10 lg:mt-0">
                      <h3 className="font-display text-2xl font-extrabold">{v.title}</h3>
                      <p className="mt-3 text-muted">{v.text}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
