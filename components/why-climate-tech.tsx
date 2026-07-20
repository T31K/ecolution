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
            <figure className="relative z-10 overflow-hidden rounded-2xl border border-secondary/20 shadow-2xl">
              <Image
                src="/img/mission-control-room.jpg"
                alt="A brightly lit control room where operators monitor an offshore wind farm on high-resolution screens."
                width={1024}
                height={576}
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <figcaption className="glass-card absolute right-6 bottom-6 left-6 rounded-xl border border-white/20 p-4">
                <blockquote className="mb-1 text-body-md font-bold italic text-secondary">
                  &ldquo;I wanted my career to mean more than just bottom lines.
                  Ecolution helped me find a lead engineering role at a carbon
                  removal startup where I feel like I&rsquo;m actually saving the
                  world.&rdquo;
                </blockquote>
                <p className="text-label-sm text-on-surface-variant">
                  &mdash; Sarah J., Lead Engineer @ Heirloom
                </p>
              </figcaption>
            </figure>
            <div className="absolute -top-10 -right-10 z-0 h-40 w-40 rounded-full bg-secondary-container/30 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 z-0 h-64 w-64 rounded-full bg-tertiary-fixed-dim/20 blur-3xl" />
          </div>
        </div>
      </Container>
    </section>
  );
}
