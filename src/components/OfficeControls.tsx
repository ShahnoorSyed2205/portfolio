"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

/** Previous/next buttons for the gallery strip. Direction-aware for RTL. */
export function OfficeControls({ lang }: { lang: string }) {
  const rtl = lang === "ar";
  const scroll = (dir: 1 | -1) => {
    const el = document.getElementById("office-strip");
    if (!el) return;
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * 360, behavior: "smooth" });
  };
  const btn =
    "inline-flex size-12 items-center justify-center rounded-full border border-white/25 transition hover:border-accent hover:text-accent active:scale-95";
  return (
    <div className="mx-auto mt-4 flex max-w-7xl gap-3 px-5 md:px-8">
      <button type="button" className={btn} aria-label={rtl ? "السابق" : "Previous"} onClick={() => scroll(-1)}>
        {rtl ? <ArrowRight size={20} weight="bold" /> : <ArrowLeft size={20} weight="bold" />}
      </button>
      <button type="button" className={btn} aria-label={rtl ? "التالي" : "Next"} onClick={() => scroll(1)}>
        {rtl ? <ArrowLeft size={20} weight="bold" /> : <ArrowRight size={20} weight="bold" />}
      </button>
    </div>
  );
}
