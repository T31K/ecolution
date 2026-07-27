import Image from "next/image";
import { Container } from "./container";
import { Cpu, Leaf, TrendingUp } from "lucide-react";

const BENEFITS = [
  {
    icon: Leaf,
    title: "True Purpose",
    body: "Your code or engineering isn't just generating clicks; it's actively reducing gigatonnes of carbon from the atmosphere.",
  },
  {
    icon: TrendingUp,
    title: "High Growth",
    body: "The climate tech sector has seen a 10x increase in venture capital since 2018. The talent war is just beginning.",
  },
  {
    icon: Cpu,
    title: "Deep Tech Challenges",
    body: "Work on the frontiers of physics, chemistry, and computation to solve humanity's greatest existential threat.",
  },
];

export function WhyClimateTech() {
  return (
    <section className="py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] shadow-raised">
          <Image
            src="/img/why-climate-solar.jpg"
            alt="An engineer in a hi-vis vest walks between rows of solar panels at golden hour, wind turbines on green hills behind."
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover"
          />
          {/* Bottom-heavy scrim keeps the glass cards and heading legible
              while the top of the photo stays bright. */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/30 to-primary/10" />

          <div className="relative z-10 flex min-h-[34rem] flex-col gap-stack-lg p-stack-md md:p-stack-lg">
            <div className="flex flex-1 items-center justify-center">
              <h2 className="text-center font-display text-headline-lg text-white drop-shadow-md">
                Why work in Climate Tech?
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {BENEFITS.map(({ icon: BenefitIcon, title, body }) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/15 bg-white/10 p-stack-md backdrop-blur-md"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-container/80">
                    <BenefitIcon className="h-5 w-5 text-on-secondary-container" />
                  </div>
                  <h3 className="mb-1 text-body-lg font-bold text-white">
                    {title}
                  </h3>
                  <p className="text-body-md leading-relaxed text-white/85">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
