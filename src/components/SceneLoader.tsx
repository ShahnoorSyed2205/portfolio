"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
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
  return (
    <>
      {!ready && <Poster />}
      <HeroScene label={label} onReady={() => setReady(true)} />
    </>
  );
}
