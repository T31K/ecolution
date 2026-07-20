import { CheckCircle2, Star } from "lucide-react";

const ICONS = {
  check: CheckCircle2,
  star: Star,
} as const;

export function JobBulletList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: keyof typeof ICONS;
}) {
  const Icon = ICONS[icon];

  return (
    <article className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card md:p-stack-lg">
      <h2 className="mb-stack-sm font-display text-headline-md text-primary">
        {title}
      </h2>
      <ul className="space-y-stack-sm">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-stack-sm">
            <Icon
              className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
              aria-hidden="true"
            />
            <span className="text-on-surface-variant">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
