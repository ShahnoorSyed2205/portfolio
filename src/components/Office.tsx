import Image from "next/image";
import type { Dict } from "@/i18n/en";
import { Reveal } from "./Reveal";
import { VideoFrame } from "./VideoFrame";
import { OfficeControls } from "./OfficeControls";

type Item =
  | { kind: "image"; src: string; position?: string }
  | { kind: "video"; src: string; poster: string };

/** Order matches the captions in the dictionaries. */
const ITEMS: Item[] = [
  { kind: "image", src: "/media/office-tall.webp" },
  { kind: "video", src: "/media/lounge.mp4", poster: "/media/lounge.webp" },
  { kind: "video", src: "/media/tower.mp4", poster: "/media/tower.webp" },
  { kind: "video", src: "/media/lobby.mp4", poster: "/media/lobby.webp" },
  { kind: "image", src: "/media/desk-chess.webp", position: "62% 50%" },
];

export function Office({ d, lang }: { d: Dict; lang: string }) {
  const play = lang === "ar" ? "تشغيل الفيديو" : "Play video";
  const pause = lang === "ar" ? "إيقاف الفيديو" : "Pause video";

  return (
    <section id="office" aria-labelledby="office-title" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <h2 id="office-title" className="font-display text-4xl font-extrabold tracking-[-0.025em] md:text-6xl [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal">
            {d.office.title}
          </h2>
          <p className="mt-4 max-w-[36rem] text-lg text-muted">{d.office.intro}</p>
        </Reveal>
      </div>

      <div className="relative mt-14">
        <div
          id="office-strip"
          tabIndex={0}
          role="region"
          aria-label={d.office.title}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 md:px-8 lg:ps-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        >
          {ITEMS.map((it, i) => {
            const copy = d.office.items[i];
            return (
              <figure
                key={it.src}
                className={`w-[72vw] shrink-0 snap-start sm:w-[22rem] ${i % 2 ? "md:mt-12" : ""}`}
              >
                <div className="arch-ring">
                  <div className="arch relative aspect-[3/4.4] bg-ink-900">
                    {it.kind === "image" ? (
                      <Image
                        src={it.src}
                        alt={copy.alt}
                        fill
                        sizes="(min-width: 640px) 22rem, 72vw"
                        className="object-cover"
                        style={{ objectPosition: it.position }}
                      />
                    ) : (
                      <VideoFrame src={it.src} poster={it.poster} label={copy.alt} playLabel={play} pauseLabel={pause} />
                    )}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/45 via-transparent to-transparent" />
                  </div>
                </div>
                <figcaption className="mt-4 text-center text-sm font-medium text-muted">{copy.caption}</figcaption>
              </figure>
            );
          })}
          <div className="w-4 shrink-0" aria-hidden="true" />
        </div>
        <OfficeControls lang={lang} />
      </div>
    </section>
  );
}
