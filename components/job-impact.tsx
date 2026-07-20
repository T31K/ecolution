import { Leaf } from "lucide-react";
import type { JobStat } from "@/lib/types";

export function JobImpact({
  summary,
  stats,
}: {
  summary: string;
  stats: JobStat[];
}) {
  return (
    <article className="relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#052e16_0%,#006c49_100%)] p-stack-md text-white shadow-raised md:p-stack-lg">
      <div className="relative z-10">
        <div className="mb-stack-sm flex items-center gap-stack-sm">
          <Leaf className="h-6 w-6 text-secondary-fixed" aria-hidden="true" />
          <h2 className="font-display text-headline-md">Climate Impact</h2>
        </div>
        <p className="mb-stack-md leading-relaxed text-secondary-fixed/90">
          {summary}
        </p>
        <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/10 bg-white/10 p-stack-sm"
            >
              <div className="text-headline-md font-bold text-secondary-fixed">
                {stat.value}
              </div>
              <div className="text-label-sm font-semibold uppercase tracking-wider opacity-80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative glow echoing the design's radial highlight. */}
      <div
        className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
        aria-hidden="true"
      />
    </article>
  );
}
