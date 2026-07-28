"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Poster-first video: the optimized still (the video's first frame) paints
 * immediately via next/image, and the looping clip cross-fades in only once
 * the browser reports it can play through. If the video never loads (slow
 * network, data saver), the page simply keeps the still.
 */
export function AuthHeroVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <Image
        // Extracted from the first frame of auth-turbines.mp4 — regenerate it
        // alongside any change to the clip or the fade reveals a jump.
        src="/img/auth-turbines-poster.jpg"
        alt="A receding row of white wind turbines on a desert ridge, mountains behind them under a clear blue sky."
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`object-cover transition-opacity duration-700 ${playing ? "opacity-0" : "opacity-100"}`}
      />
      <video
        src="/video/auth-turbines.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        onCanPlayThrough={(event) => {
          // Some browsers pause autoplay started before the fade; nudge it.
          void event.currentTarget.play().catch(() => {});
          setPlaying(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
