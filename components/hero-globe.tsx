"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export type JobLocation = { city: string; country: string };

/**
 * Brand-coloured rotating globe (cobe) with a marker per job location.
 * Rendered oversized and clipped by the hero, northern hemisphere up front.
 */
export function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;
    let width = canvas.offsetWidth;
    const onResize = () => {
      width = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.22,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 18000,
      mapBrightness: 3.5,
      baseColor: [0.8, 0.9, 0.84],
      markerColor: [0.0, 0.62, 0.42],
      glowColor: [0.92, 0.97, 0.94],
      markers: [],
    });

    let frame = 0;
    const spin = () => {
      phi += 0.0028;
      globe.update({ phi, width: width * 2, height: width * 2 });
      frame = requestAnimationFrame(spin);
    };
    frame = requestAnimationFrame(spin);

    return () => {
      cancelAnimationFrame(frame);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="h-full w-full [contain:layout_paint_size]"
    />
  );
}
