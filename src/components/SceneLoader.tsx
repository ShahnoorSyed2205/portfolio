"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import { KhatamPattern } from "./Khatam";

/** Shown while WebGL loads, and kept as the look when WebGL is unavailable. */
function Poster() {
  return (
    <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
      <div className="ornament absolute inset-0">
        <KhatamPattern opacity={0.28} />
      </div>
      <div className="absolute size-[55%] rounded-full bg-[radial-gradient(circle,rgb(62_243_238/0.25),transparent_65%)]" />
      <Image src="/brand/logo-tile.png" alt="" width={160} height={160} className="relative size-32 rounded-[28px] shadow-2xl" />
    </div>
  );
}

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export function SceneLoader({ label }: { label: string }) {
  const [ready, setReady] = useState(false);
  const [mount, setMount] = useState(false);

  // Keep three.js off the critical path: text and poster paint first, the scene loads once the page is idle.
  useEffect(() => {
    const start = () => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(() => setMount(true), { timeout: 3000 });
      else setTimeout(() => setMount(true), 1200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  return (
    <>
      {!ready && <Poster />}
      {mount && <HeroScene label={label} onReady={() => setReady(true)} />}
    </>
  );
}
