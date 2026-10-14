"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState } from "react";
import type { Dict } from "@/i18n/en";

/** Client segments from the brand strategy, as tabs so one profile is read at a time. */
export function Audience({ d }: { d: Dict }) {
  const a = d.audience;
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const uid = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (to: number) => {
    const n = (to + a.tabs.length) % a.tabs.length;
    setActive(n);
    tabRefs.current[n]?.focus();
  };

  const rows = [
    { label: a.profileLabel, key: "profile" as const },
    { label: a.needsLabel, key: "needs" as const },
    { label: a.goalLabel, key: "goal" as const },
  ];
  const tab = a.tabs[active];

  return (
    <section id="clients" aria-labelledby="clients-title" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 id="clients-title" className="font-display text-4xl font-extrabold tracking-[-0.025em] md:text-6xl [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal">
          {a.title}
        </h2>
        <p className="mt-4 max-w-[34rem] text-lg text-muted">{a.intro}</p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div
            role="tablist"
            aria-label={a.title}
            aria-orientation="vertical"
            className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); move(active + 1); }
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); move(active - 1); }
            }}
          >
            {a.tabs.map((t, i) => (
              <button
                key={t.label}
                ref={(el) => { tabRefs.current[i] = el; }}
                role="tab"
                id={`${uid}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${uid}-panel`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                className={`shrink-0 rounded-full border px-6 py-3.5 text-start font-display text-base font-extrabold transition lg:text-lg ${
                  i === active
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-white/25 text-fg hover:border-accent hover:text-accent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`} className="panel min-h-[22rem] p-7 md:p-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.dl
                key={active}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-8"
              >
                {rows.map((r) => (
                  <div key={r.key}>
                    <dt className="text-sm font-semibold text-accent">{r.label}</dt>
                    <dd className="mt-2 max-w-xl text-lg">{tab[r.key]}</dd>
                  </div>
                ))}
              </motion.dl>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
