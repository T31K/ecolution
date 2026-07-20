import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGES = [1, 2, 3];

export function BrowsePagination({
  current = 1,
  totalPages = 12,
}: {
  current?: number;
  totalPages?: number;
}) {
  return (
    <nav
      aria-label="Pagination"
      className="mt-stack-lg flex items-center justify-center gap-4"
    >
      <button
        aria-label="Previous page"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-all hover:border-secondary hover:text-secondary"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        {PAGES.map((page) => (
          <button
            key={page}
            aria-current={page === current ? "page" : undefined}
            className={
              page === current
                ? "flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-bold text-on-secondary"
                : "flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high"
            }
          >
            {page}
          </button>
        ))}
        <span className="text-outline">…</span>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high">
          {totalPages}
        </button>
      </div>

      <button
        aria-label="Next page"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-all hover:border-secondary hover:text-secondary"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
