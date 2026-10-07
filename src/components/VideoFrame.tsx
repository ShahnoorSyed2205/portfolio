"use client";

import { Pause, Play } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

/** Muted looping clip that only plays while visible, and never autoplays for reduced-motion users. */
export function VideoFrame({
  src,
  poster,
  label,
  playLabel,
  pauseLabel,
}: {
  src: string;
  poster: string;
  label: string;
  playLabel: string;
  pauseLabel: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const manual = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (manual.current) return;
        if (e.isIntersecting && !reduce) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 size-full object-cover"
      />
      <button
        type="button"
        aria-label={playing ? pauseLabel : playLabel}
        onClick={() => {
          const v = ref.current;
          if (!v) return;
          manual.current = true;
          if (v.paused) v.play().catch(() => {});
          else v.pause();
        }}
        className="absolute bottom-5 end-5 z-10 inline-flex size-11 items-center justify-center rounded-full border border-white/30 bg-ink-950/70 text-fg backdrop-blur transition hover:border-accent hover:text-accent"
      >
        {playing ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
      </button>
    </>
  );
}
