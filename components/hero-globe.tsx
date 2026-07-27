"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export type JobLocation = { city: string; country: string };

/** Lat/lng for the cities jobs are actually posted in. */
const CITY_COORDS: Record<string, [number, number]> = {
  "mexico city": [19.43, -99.13],
  butte: [46.0, -112.53],
  amsterdam: [52.37, 4.9],
  burlington: [42.5, -71.2],
  ulaanbaatar: [47.92, 106.92],
  london: [51.51, -0.13],
  fremont: [37.55, -121.99],
  "san diego": [32.72, -117.16],
  "midway island": [28.21, -177.35],
  washington: [38.91, -77.04],
  "københavn": [55.68, 12.57],
  bologna: [44.49, 11.34],
  berkeley: [37.87, -122.27],
  "new york": [40.71, -74.0],
  "new york city": [40.71, -74.0],
  bangalore: [12.97, 77.59],
  "ilhéus": [-14.79, -39.05],
  poitiers: [46.58, 0.34],
  anderson: [34.5, -82.65],
  cleveland: [41.5, -81.69],
  newark: [40.73, -74.17],
  sydney: [-33.87, 151.21],
  irving: [32.81, -96.95],
  "menlo park": [37.45, -122.18],
  depew: [42.9, -78.69],
  madrid: [40.42, -3.7],
  somerville: [42.39, -71.1],
  chicago: [41.88, -87.63],
  berlin: [52.52, 13.4],
  taipei: [25.03, 121.57],
  calgary: [51.05, -114.07],
  "los angeles": [34.05, -118.24],
  phoenix: [33.45, -112.07],
  rogers: [36.33, -94.12],
  "joão pessoa": [-7.12, -34.86],
  albuquerque: [35.08, -106.65],
  toronto: [43.65, -79.38],
  decatur: [33.77, -84.3],
};

/** Country centroids as a fallback for cities not in the table. */
const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [39.8, -98.6], CA: [56.1, -106.3], MX: [23.6, -102.5], BR: [-14.2, -51.9],
  GB: [54.0, -2.0], DE: [51.2, 10.4], FR: [46.6, 2.2], ES: [40.5, -3.7],
  IT: [42.8, 12.8], NL: [52.1, 5.3], DK: [56.1, 9.5], PL: [51.9, 19.1],
  PT: [39.6, -8.0], AU: [-25.3, 133.8], IN: [20.6, 79.0], TW: [23.7, 121.0],
  MN: [46.9, 103.8], AE: [23.4, 53.8], UM: [28.2, -177.35],
};

function toMarkers(locations: JobLocation[]) {
  const seen = new Set<string>();
  const markers: { location: [number, number]; size: number }[] = [];
  for (const { city, country } of locations) {
    const key = city.toLowerCase().split(",")[0].trim();
    const coords = CITY_COORDS[key] ?? COUNTRY_COORDS[country?.toUpperCase()];
    if (!coords) continue;
    const dedupe = coords.join(",");
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    markers.push({ location: coords, size: 0.06 });
  }
  return markers;
}

/**
 * Brand-coloured rotating globe (cobe) with a marker per job location.
 * Rendered oversized and clipped by the hero, northern hemisphere up front.
 */
export function HeroGlobe({ locations }: { locations: JobLocation[] }) {
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
      baseColor: [0.85, 0.93, 0.88],
      markerColor: [0.0, 0.62, 0.42],
      glowColor: [0.9, 0.96, 0.92],
      markers: toMarkers(locations),
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
  }, [locations]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="h-full w-full [contain:layout_paint_size]"
    />
  );
}
