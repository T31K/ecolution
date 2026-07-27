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
    <section className="relative overflow-hidden py-24">
      <Container>
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="lg:w-1/2">
            <h2 className="mb-6 font-display text-headline-lg text-primary">
              Why work in Climate Tech?
            </h2>
            <div className="space-y-stack-lg">
              {BENEFITS.map(({ icon: BenefitIcon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="h-fit rounded-lg bg-secondary-container/50 p-3">
                    <BenefitIcon className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-body-lg font-bold text-secondary">
                      {title}
                    </h3>
                    <p className="text-body-md text-on-surface-variant">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:w-1/2">
            <figure className="relative z-10 overflow-hidden rounded-2xl border border-outline-variant/40 shadow-raised">
              <Image
                src="/img/why-climate-solar.jpg"
                alt="An engineer in a hi-vis vest walks between rows of solar panels at golden hour, wind turbines on green hills behind."
                width={1280}
                height={720}
                className="aspect-[4/3] w-full object-cover md:aspect-video"
              />
              {/* Same treatment as the auth page: primary-container scrim so
                  white type stays legible over the bright sky. */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/25 to-transparent" />
            </figure>
          </div>
        </div>
      </Container>
    </section>
  );
}
